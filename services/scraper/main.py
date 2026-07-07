import asyncio
import logging
import os
import re
import uuid
from collections import Counter
from typing import List
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from curl_cffi import requests as cf_requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from playwright.sync_api import sync_playwright

from duty_calculator import CustomsDutyCalculator

load_dotenv()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("scraper")

app = FastAPI(title="AutoCango Scraper Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase REST config (PostgREST insert, no extra SDK needed)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# autocango.com blocks plain requests/Playwright behind a bot-detection wall
# (Tencent Cloud EdgeOne "Security Verification"). Only curl_cffi with a real
# browser TLS fingerprint gets through. See ~/.claude/skills/autocango-scraper.
SESSION = cf_requests.Session(impersonate="chrome131")
REFERER = {"Referer": "https://www.autocango.com/"}
CDN_SUFFIX = "/d?imageMogr2/format/jpg/strip"
IMG_PATTERN = re.compile(
    r'(https://m\.tichetech\.com/used/\d+/(\d+)/[^\s\"\'<>]+\.(?:webp|jpg|jpeg|png))',
    re.IGNORECASE,
)
CAR_LINK_RE = re.compile(r"/(usedcar|newcar)/[A-Za-z0-9_-]+")
# Listing URLs look like /sku/usedcar-Geely-Emgrand-ACU90633123 — make/model
# come straight from the slug, far more reliable than parsing the title.
SLUG_RE = re.compile(r"/sku/(?:usedcar|newcar)-([A-Za-z0-9]+)-([A-Za-z0-9]+)-([A-Za-z0-9]+)$")

# Columns a failed insert may drop and retry without. make/model are the only
# fields we refuse to give up on — everything else is optional metadata.
REQUIRED_FIELDS = {"make", "model"}


class ScrapeRequest(BaseModel):
    url: str


class BatchScrapeRequest(BaseModel):
    urls: List[str]


class CatalogScrapeRequest(BaseModel):
    url: str


def _details_table(soup: BeautifulSoup) -> dict:
    details: dict[str, str] = {}
    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) >= 2:
                details[cells[0]] = cells[1]
            if len(cells) == 4:
                details[cells[2]] = cells[3]
    return details


def _car_images(html: str) -> List[str]:
    """Each listing page also embeds related cars' photos — isolate the
    primary car's images via the most common car_id in the CDN URLs."""
    matches = IMG_PATTERN.findall(html)
    if not matches:
        return []
    id_counts = Counter(cid for _, cid in matches)
    primary_id = id_counts.most_common(1)[0][0]
    seen, result = set(), []
    for full_url, cid in matches:
        base = full_url.split("?")[0]
        if cid == primary_id and base not in seen:
            seen.add(base)
            result.append(base + CDN_SUFFIX)
    return result


# Matches "= Total Price($): FOB 7,856" — requires a leading digit so it never
# matches the "FOB ASK" state shown before a departure port is chosen.
FOB_TOTAL_RE = re.compile(r"Total Price\(\$\):\s*FOB\s*([0-9][0-9,]*)")


def _autocango_fob_price(url: str) -> "int | None":
    """Drive AutoCango's Total Price Calculator to the real USD FOB total.

    The page is a Vue/Element-Plus SPA. The FOB total only computes after you
    (1) select the FOB tab, which reveals an "International Logistic Departure
    Port" el-select, and (2) pick a port (Guangzhou) so the Domestic Transport
    Fee fills in. Until a port is chosen the total reads "FOB ASK".

    Returns the parsed integer, or None if the calculator can't be driven
    (some listings have no calculator / no Guangzhou route) — a None FOB is
    far better than the old bug of silently saving the Chinese MSRP.

    NOTE: uses the Playwright SYNC API, so this must run OFF the asyncio event
    loop (the endpoints call it via asyncio.to_thread). Calling it directly
    inside an async handler raises "Sync API inside the asyncio loop".
    """
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_context().new_page()
            try:
                page.goto(url, timeout=60000, wait_until="domcontentloaded")

                # 1. Select the FOB pricing tab.
                page.get_by_text("FOB", exact=True).first.click(timeout=8000)
                page.wait_for_timeout(500)

                # 2. Open the departure-port dropdown (Element Plus el-select).
                #    Its placeholder text identifies it before a port is picked.
                port = page.locator(
                    ".el-select", has_text="International Logistic Departure Port"
                ).first
                port.click(timeout=8000)
                page.wait_for_timeout(400)

                # 3. Pick Guangzhou from the opened option list.
                page.locator(
                    ".el-select-dropdown__item:visible", has_text="Guangzhou"
                ).first.click(timeout=6000)

                # 4. Poll until the JS recomputes the red total from "ASK" to a
                #    real number (fees update asynchronously after port select).
                for _ in range(16):  # ~8s max
                    page.wait_for_timeout(500)
                    m = FOB_TOTAL_RE.search(page.locator("body").inner_text(timeout=3000))
                    if m:
                        return int(re.sub(r"[^0-9]", "", m.group(1)))
                return None
            finally:
                browser.close()
    except Exception as e:
        log.warning("FOB calculator failed for %s: %s", url, e)
        return None


def extract_car_autocango(url: str) -> dict:
    """Scrape one AutoCango detail page into a cars-table row."""
    resp = SESSION.get(url, timeout=60)
    if resp.status_code >= 400:
        raise RuntimeError(f"HTTP {resp.status_code}")
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")

    slug_m = SLUG_RE.search(url)
    if not slug_m:
        raise RuntimeError(f"URL doesn't match expected /sku/<type>-<Make>-<Model>-<SKU> shape: {url}")
    make, model, _sku = slug_m.groups()

    details = _details_table(soup)

    year = None
    year_source = details.get("Model Year") or (soup.find("title").get_text() if soup.find("title") else "")
    year_m = re.search(r"\d{4}", year_source)
    if year_m:
        year = int(year_m.group(0))

    mileage_digits = re.sub(r"[^\d]", "", details.get("Mlg(km)", ""))
    mileage = int(mileage_digits) if mileage_digits else None

    images = _car_images(html)

    fob_price = _autocango_fob_price(url)

    return {
        "make": make,
        "model": model,
        "year": year,
        "mileage": mileage,
        "price_cny": fob_price,
        "fob_price": fob_price,
        "fuel": details.get("Fuel") or None,
        "transmission": details.get("Transmission") or None,
        "engine": details.get("Engine") or None,
        "primary_image": images[0] if images else None,
        "images": images or None,
        "status": "available",
    }


# global.che168.com/en/detail/<infoid> is a client-rendered SPA — the HTML is
# just a JS shell. The real listing data comes from a JSON API the page calls:
# https://globalapi.che168.com/api/v1/carinfo/<infoid>?_appid=global.pc&deviceid=<uuid>&language=en
# No bot wall on this endpoint; curl_cffi's default session works fine, no
# impersonation needed. Prices are already quoted in USD for this export site.
CHE168_URL_RE = re.compile(r"che168\.com/(?:en/)?detail/(\d+)")


def extract_car_che168(url: str) -> dict:
    """Scrape one global.che168.com detail page into a cars-table row."""
    m = CHE168_URL_RE.search(url)
    if not m:
        raise RuntimeError(f"URL doesn't match expected che168 detail/<id> shape: {url}")
    infoid = m.group(1)

    api_url = (
        f"https://globalapi.che168.com/api/v1/carinfo/{infoid}"
        f"?_appid=global.pc&deviceid={uuid.uuid4()}&language=en"
    )
    resp = SESSION.get(api_url, timeout=30)
    if resp.status_code >= 400:
        raise RuntimeError(f"HTTP {resp.status_code}")

    payload = resp.json()
    if payload.get("returncode") != 0:
        raise RuntimeError(f"che168 API error: {payload.get('message')}")
    car = payload.get("result") or {}
    if not car:
        raise RuntimeError("che168 API returned no result")

    make = (car.get("brandname") or "").strip()
    model = (car.get("seriesname") or "").strip()
    if not make or not model:
        raise RuntimeError("Could not parse make/model from che168 response")

    year = None
    year_m = re.search(r"\d{4}", car.get("yearname") or "")
    if year_m:
        year = int(year_m.group(0))

    mileage_digits = re.sub(r"[^\d]", "", car.get("mileage") or "")
    mileage = int(mileage_digits) if mileage_digits else None

    price_digits = re.sub(r"[^\d]", "", car.get("price") or "")
    price = int(price_digits) if price_digits else None

    # export_fee + port_fee are the site's own quoted shipping costs (USD) —
    # use them as the real shipping_cost instead of leaving it for manual entry.
    export_fee = re.sub(r"[^\d]", "", car.get("export_fee") or "")
    port_fee = re.sub(r"[^\d]", "", car.get("port_fee") or "")
    shipping = int(export_fee or 0) + int(port_fee or 0) if (export_fee or port_fee) else None

    images: List[str] = []
    for group in car.get("catepiclist") or []:
        images.extend(group.get("list") or [])

    return {
        "make": make,
        "model": model,
        "year": year,
        "mileage": mileage,
        "price_cny": price,
        "fob_price": price,
        "shipping_cost": shipping,
        "fuel": car.get("fuelname") or None,
        "transmission": car.get("gearbox") or None,
        "engine": car.get("engine") or None,
        "primary_image": images[0] if images else None,
        "images": images or None,
        "status": "available",
    }


def extract_car(url: str) -> dict:
    """Dispatch to the right site-specific extractor by hostname."""
    host = urlparse(url).netloc
    row = extract_car_che168(url) if "che168.com" in host else extract_car_autocango(url)
    row["customs_duty_dzd"] = _estimated_duty_dzd(row)
    return row


MISSING_COLUMN_RE = re.compile(r"Could not find the '(\w+)' column")

# Fired after every successful car import so external automations (e.g. a
# Make.com scenario) can react to new listings going live. Overridable via
# env for staging/prod without touching code.
NEW_CAR_WEBHOOK_URL = os.environ.get(
    "NEW_CAR_WEBHOOK_URL",
    "https://hook.eu1.make.com/q6xmv4yyx0xaky5pxdx622indtjupb5f",
)

# Must match apps/web/src/currency/exchange-rate-context.tsx's
# DEFAULT_USD_TO_DZD_RATE — the server has no visibility into a shopper's
# per-browser adjusted rate, so this is the same site-wide default.
USD_TO_DZD_RATE = float(os.environ.get("USD_TO_DZD_RATE", 253))

# Loads the Argus reference-value CSV once at startup rather than per-car (it's
# a pandas DataFrame load). A missing/broken CSV shouldn't take down scraping
# for everything else, so failures here just disable duty estimation.
try:
    duty_calc = CustomsDutyCalculator(usd_to_dzd_rate=USD_TO_DZD_RATE)
except Exception as e:
    log.warning("CustomsDutyCalculator unavailable, duty estimates disabled: %s", e)
    duty_calc = None


def _estimated_duty_dzd(row: dict) -> "float | None":
    if duty_calc is None or not row.get("make") or not row.get("model") or not row.get("year"):
        return None
    try:
        return duty_calc.get_estimated_duty_dzd(row["make"], row["model"], row["year"])
    except Exception as e:
        log.warning("duty calc failed for %s %s %s: %s", row.get("make"), row.get("model"), row.get("year"), e)
        return None


def notify_new_car_webhook(car: dict, source_url: str) -> None:
    """Best-effort: a webhook outage should never fail the actual import."""
    if not NEW_CAR_WEBHOOK_URL:
        return

    year = car.get("year")
    make = car.get("make")
    model = car.get("model")
    car_name = " ".join(str(p) for p in (year, make, model) if p)

    total_usd = (
        float(car.get("price_cny") or 0)
        + float(car.get("commission") or 0)
        + float(car.get("shipping_cost") or 0)
    )
    price_dzd = round(total_usd * USD_TO_DZD_RATE)

    payload = {
        "car_name": car_name,
        "price_dzd": price_dzd,
        "image_url": car.get("primary_image"),
        "source_url": source_url,
    }

    try:
        requests.post(NEW_CAR_WEBHOOK_URL, json=payload, timeout=10)
    except Exception as e:
        log.warning("webhook notify failed for %s: %s", source_url, e)


def insert_car(row: dict) -> tuple[List[str], dict]:
    """Insert one car into the Supabase `cars` table via PostgREST.

    ponytail: the cars-table schema drifts as the app evolves. If Supabase
    rejects an unknown column, drop it and retry rather than hard-failing —
    except make/model, which are load-bearing. Returns (skipped columns,
    inserted row as Supabase persisted it — includes id/created_at).
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured")

    row = dict(row)
    skipped: List[str] = []

    for _ in range(len(row) + 1):
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/cars",
            json=row,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Prefer": "resolution=merge-duplicates,return=representation",
            },
            timeout=15,
        )
        if resp.status_code < 400:
            try:
                inserted = resp.json()
                inserted_row = inserted[0] if isinstance(inserted, list) and inserted else row
            except Exception:
                inserted_row = row
            return skipped, inserted_row

        m = MISSING_COLUMN_RE.search(resp.text)
        if not m:
            raise RuntimeError(f"Supabase insert {resp.status_code}: {resp.text}")

        col = m.group(1)
        if col in REQUIRED_FIELDS or col not in row:
            raise RuntimeError(f"Supabase insert {resp.status_code}: {resp.text}")

        del row[col]
        skipped.append(col)

    raise RuntimeError("Too many missing columns — check the cars table schema")


@app.post("/api/scrape/catalog")
async def scrape_catalog(req: CatalogScrapeRequest):
    try:
        resp = SESSION.get(req.url, timeout=60)
        resp.raise_for_status()
    except Exception as e:
        log.error("catalog discovery failed for %s: %s", req.url, e)
        return {"discovered_urls": [], "error": str(e)}

    hrefs = re.findall(r'href="([^"]+)"', resp.text)
    urls = list(dict.fromkeys(h for h in hrefs if CAR_LINK_RE.search(h)))
    return {"discovered_urls": urls}


def _import_one(url: str) -> List[str]:
    """Blocking scrape+insert+notify for one URL. Runs in a worker thread so
    the Playwright SYNC API isn't inside the asyncio loop. Returns skipped cols;
    raises on failure."""
    row = extract_car(url)
    skipped, inserted_row = insert_car(row)
    notify_new_car_webhook(inserted_row, url)
    return skipped


@app.post("/api/scrape/batch")
async def scrape_batch(req: BatchScrapeRequest):
    success, failed, failed_urls = 0, 0, []
    skipped_columns: set = set()
    for url in req.urls:
        try:
            skipped = await asyncio.to_thread(_import_one, url)
            skipped_columns.update(skipped)
            success += 1
            log.info("imported %s", url)
        except Exception as e:
            failed += 1
            failed_urls.append(url)
            log.error("failed %s: %s", url, e)
    result = {"total": len(req.urls), "success": success, "failed": failed, "failed_urls": failed_urls}
    if skipped_columns:
        result["_skipped_columns"] = sorted(skipped_columns)
    return result


@app.post("/api/scrape")
async def scrape(req: ScrapeRequest):
    return await scrape_batch(BatchScrapeRequest(urls=[req.url]))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
