import base64
import os
import re
from collections import Counter
from datetime import datetime

import io
import traceback
import urllib.request

import cv2
import numpy as np
import requests
import pytesseract
from bs4 import BeautifulSoup
from curl_cffi import requests as cf_requests
from PIL import Image, ImageDraw

from db import supabase
from duty_calculator import CustomsDutyCalculator
from tiktok_publisher import publish_car_to_tiktok

calculator = CustomsDutyCalculator()

SESSION = cf_requests.Session(impersonate="chrome131")

CDN_PATTERN = re.compile(
    r'(https://m\.tichetech\.com/used/\d+/(\d+)/[^\s\"\'<>]+\.(?:webp|jpg|jpeg|png))',
    re.IGNORECASE,
)
CDN_SUFFIX = "/d?imageMogr2/format/jpg/strip"

STORAGE_BUCKET = "car-images"
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN")

DUMMY_CARS = [
    {"make": "CHERY",  "model": "TIGGO 8 PRO", "year": 2025, "price_cny": 145000},
    {"make": "GEELY",  "model": "COOLRAY",      "year": 2024, "price_cny": 98000},
    {"make": "BYD",    "model": "ATTO 3",        "year": 2025, "price_cny": 160000},
    {"make": "HAVAL",  "model": "JOLION",        "year": 2024, "price_cny": 110000},
]


def _download_cdn_image(image_url: str) -> bytes | None:
    """Download image bytes from CDN using urllib.
    curl_cffi Chrome impersonation is blocked by tichetech.com (returns 403);
    plain urllib works fine.
    """
    try:
        req = urllib.request.Request(
            image_url,
            headers={
                "Referer": "https://www.autocango.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            },
        )
        with urllib.request.urlopen(req, timeout=40) as resp:
            data = resp.read()
        print(f"[DOWNLOAD] status={resp.status} size={len(data)}b")
        if len(data) >= 5000:
            return data
        print(f"[DOWNLOAD] too small ({len(data)}b) — skipping")
    except Exception as e:
        print(f"[DOWNLOAD] error: {e}")
    return None


def clean_image_replicate(image_url: str) -> bytes | None:
    """Submit image to Replicate flux-kontext-pro for watermark/logo removal.
    Downloads locally (CDN blocks remote fetches), encodes as base64 data URI,
    and sends directly — no staging needed.
    Returns cleaned JPEG bytes, or None if key absent / API fails.
    """
    if not REPLICATE_API_KEY:
        return None

    try:
        import replicate

        raw = _download_cdn_image(image_url)
        if raw is None:
            print("[REPLICATE] Local download failed — skipping")
            return None

        pil_in = Image.open(io.BytesIO(raw)).convert("RGB")
        jpeg_buf = io.BytesIO()
        pil_in.save(jpeg_buf, format="JPEG", quality=92)
        jpeg_bytes = jpeg_buf.getvalue()

        b64 = base64.b64encode(jpeg_bytes).decode()
        data_uri = f"data:image/jpeg;base64,{b64}"

        client = replicate.Client(api_token=REPLICATE_API_KEY)
        output = client.run(
            "black-forest-labs/flux-kontext-pro",
            input={
                "prompt": "Remove all watermarks, logos, and text overlays. Keep the car and background completely unchanged.",
                "input_image": data_uri,
            },
        )

        # SDK returns FileOutput, URL string, or list depending on version
        if hasattr(output, "read"):
            result = output.read()
        else:
            if isinstance(output, list):
                output = output[0]
            result_url = output.url if hasattr(output, "url") else str(output)
            img_resp = requests.get(result_url, timeout=60)
            img_resp.raise_for_status()
            result = img_resp.content

        pil_out = Image.open(io.BytesIO(result)).convert("RGB")
        out_buf = io.BytesIO()
        pil_out.save(out_buf, format="JPEG", quality=92)
        final = out_buf.getvalue()
        print(f"[REPLICATE] Done: {len(final)}b JPEG")
        return final

    except Exception as e:
        print(f"[REPLICATE] Failed ({e}) — falling back to OpenCV")
        traceback.print_exc()
        return None


def clean_image_replicate(image_url: str) -> str:
    """Remove AutoCango watermark using LaMA inpainting via Replicate.

    Downloads the image locally, builds a white mask over the known logo region
    (center 20-80% w, 40-55% h), and sends image + mask to a LaMA cleaner model.
    Returns the cleaned image URL on success, or the original image_url on any failure.
    Relies on REPLICATE_API_TOKEN environment variable — no keys are hardcoded.
    """
    if not REPLICATE_API_TOKEN:
        print("[REPLICATE] No REPLICATE_API_TOKEN set — skipping")
        return image_url

    try:
        import replicate

        raw = _download_cdn_image(image_url)
        if raw is None:
            print("[REPLICATE] Download failed — using original")
            return image_url

        pil_img = Image.open(io.BytesIO(raw)).convert("RGB")
        w, h = pil_img.size

        # White mask over AutoCango logo (center region)
        mask_img = Image.new("L", (w, h), 0)
        ImageDraw.Draw(mask_img).rectangle(
            [int(0.20 * w), int(0.40 * h), int(0.80 * w), int(0.55 * h)],
            fill=255,
        )

        img_buf = io.BytesIO()
        pil_img.save(img_buf, format="JPEG", quality=92)
        img_uri = "data:image/jpeg;base64," + base64.b64encode(img_buf.getvalue()).decode()

        mask_buf = io.BytesIO()
        mask_img.save(mask_buf, format="PNG")
        mask_uri = "data:image/png;base64," + base64.b64encode(mask_buf.getvalue()).decode()

        client = replicate.Client(api_token=REPLICATE_API_TOKEN)
        output = client.run(
            "allenhooo/lama",
            input={"image": img_uri, "mask": mask_uri},
        )

        if isinstance(output, list):
            output = output[0]
        result_url = output.url if hasattr(output, "url") else str(output)
        print(f"[REPLICATE] Cleaned: {result_url}")
        return result_url

    except Exception as e:
        print(f"[REPLICATE] Failed ({e}) — using original")
        return image_url


def upload_to_storage(slug: str, idx: int, img_bytes: bytes) -> str | None:
    """Upload processed image bytes to Supabase Storage, return public URL."""
    try:
        path = f"{slug}/{idx}.jpg"
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=path,
            file=img_bytes,
            file_options={"content-type": "image/jpeg", "x-upsert": "true"},
        )
        url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(path)
        print(f"[STORAGE] Uploaded -> {url}")
        return url
    except Exception as e:
        print(f"[STORAGE] Upload failed ({slug}/{idx}): {e}")
        traceback.print_exc()
        return None


def process_images(images: list[str], make: str, model: str, year: int) -> list[str]:
    """Remove watermarks via Replicate LaMA and upload cleaned images to storage.
    Falls back to original CDN URL on any failure.
    """
    slug = f"{year}-{make}-{model}".lower().replace(" ", "-")
    result = []
    for idx, url in enumerate(images):
        cleaned_url = clean_image_replicate(url)

        # Download cleaned image (Replicate output URL) or fall back to original CDN
        raw = None
        if cleaned_url != url:
            try:
                resp = requests.get(cleaned_url, timeout=60)
                if resp.status_code == 200 and len(resp.content) > 5000:
                    raw = resp.content
            except Exception as dl_err:
                print(f"[IMG] Cleaned URL download failed: {dl_err}")

        if raw is None:
            raw = _download_cdn_image(url)

        if raw:
            stored_url = upload_to_storage(slug, idx, raw)
            result.append(stored_url if stored_url else url)
        else:
            result.append(url)
        print(f"[IMG] {idx + 1}/{len(images)} processed for {make} {model}")
    return result


def parse_autocango(url):
    print(f"[SCRAPE] Fetching: {url}")
    r = SESSION.get(url, timeout=60)
    if r.status_code != 200:
        print(f"[ERR] HTTP {r.status_code} for {url}")
        return None

    soup = BeautifulSoup(r.text, "html.parser")
    html = r.text

    # Title
    title_tag = soup.find("title")
    title = re.sub(r'\s*for Export.*$', '', title_tag.text).strip() if title_tag else ""
    full_title = re.sub(r'^Used\s+', '', title)

    # Year from title (e.g. "Used 2022 Chang An...")
    year_m = re.search(r'\b(20[12]\d)\b', title)
    year = int(year_m.group(1)) if year_m else datetime.now().year

    # Make + model from URL slug: usedcar-{Make}-{Model}-{SKU}
    slug_m = re.search(r'/usedcar-([^/]+)', url)
    make = model = "UNKNOWN"
    if slug_m:
        parts = slug_m.group(1).split("-")
        non_sku = [p for p in parts if not re.match(r'^[A-Z]{2,3}\d+$', p)]
        if non_sku:
            make = non_sku[0].upper()
            model = " ".join(non_sku[1:]).upper() if len(non_sku) > 1 else "UNKNOWN"

    # Vehicle details table (key → value)
    details = {}
    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            cells = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
            if len(cells) >= 2:
                details[cells[0]] = cells[1]
            if len(cells) == 4:
                details[cells[2]] = cells[3]

    # Mileage
    mileage_raw = details.get("Mlg(km)", "")
    mileage = None
    if mileage_raw:
        m = re.search(r'[\d,]+', mileage_raw)
        if m:
            try:
                mileage = int(m.group().replace(",", ""))
            except ValueError:
                pass

    # USD price (first $X,XXX on page)
    usd_prices = re.findall(r'\$([\d,]+)', html)
    price_usd = float(usd_prices[0].replace(",", "")) if usd_prices else 0.0

    # Accessories
    accessories = []
    acc_ul = soup.find("ul", class_="accessories")
    if acc_ul:
        accessories = [li.get_text(strip=True) for li in acc_ul.find_all("li") if li.get_text(strip=True)]

    # Images — use Counter on CDN car_id to isolate primary car's images
    matches = CDN_PATTERN.findall(html)
    raw_images = []
    if matches:
        id_counts = Counter(cid for _, cid in matches)
        primary_id = id_counts.most_common(1)[0][0]
        seen = set()
        for full_url, cid in matches:
            base = full_url.split("?")[0]
            if cid == primary_id and base not in seen:
                seen.add(base)
                raw_images.append(base + CDN_SUFFIX)

    # Watermark removal — process images before storing
    images = process_images(raw_images, make, model, year) if raw_images else []
    primary_image = images[0] if images else None

    result = {
        "make":           make,
        "model":          model,
        "year":           year,
        "price_cny":      price_usd,
        "title":          full_title,
        "source_url":     url,
        "mileage":        mileage,
        "fuel":           details.get("Fuel") or None,
        "fuel_type":      details.get("Fuel") or None,
        "transmission":   details.get("Transmission") or None,
        "engine":         details.get("Engine") or None,
        "exterior_color": details.get("Exterior Color") or None,
        "accessories":    accessories or None,
        "primary_image":  primary_image,
        "images":         images,
    }
    print(
        f"[SCRAPE] {result['year']} {result['make']} {result['model']} | "
        f"${result['price_cny']} | mileage={result['mileage']} | "
        f"images={len(images)} | fuel={result['fuel']} | "
        f"engine={result['engine']} | color={result['exterior_color']}"
    )
    return result


def insert_car_record(car):
    try:
        existing = (
            supabase.table("cars")
            .select("id")
            .eq("make", car["make"])
            .eq("model", car["model"])
            .eq("year", car["year"])
            .execute()
        )
        if existing.data:
            row_id = existing.data[0]["id"]
            update = {}
            existing_full = supabase.table("cars").select("accessories,images,engine,transmission,fuel,mileage,exterior_color,primary_image").eq("id", row_id).single().execute().data
            for field in ("accessories", "images", "engine", "transmission", "fuel", "mileage", "exterior_color", "primary_image"):
                new_val = car.get(field) or car.get("fuel_type" if field == "fuel" else field)
                if not existing_full.get(field) and new_val:
                    update[field] = new_val
            if update:
                supabase.table("cars").update(update).eq("id", row_id).execute()
                print(f"[UPDATE] {car['year']} {car['make']} {car['model']} — filled: {list(update.keys())}")
            else:
                print(f"[SKIP] {car['year']} {car['make']} {car['model']} already in DB")
            return

        duty = calculator.get_estimated_duty_dzd(car["make"], car["model"], car["year"])
        mileage = car.get("mileage")
        year = car["year"]
        condition = "new" if (year == 2026 and (mileage is None or mileage <= 100)) else "used"
        payload = {
            "make":             car["make"],
            "model":            car["model"],
            "year":             year,
            "price_cny":        car["price_cny"],
            "customs_duty_dzd": duty,
            "condition":        condition,
            "status":           "available",
            "is_visible":       True,
            "primary_image":    car.get("primary_image"),
            "images":           car.get("images") or [],
            "mileage":          mileage,
            "fuel":             car.get("fuel"),
            "fuel_type":        car.get("fuel_type"),
            "transmission":     car.get("transmission"),
            "engine":           car.get("engine"),
            "exterior_color":   car.get("exterior_color"),
            "accessories":      car.get("accessories"),
            "title":            car.get("title"),
            "source_url":       car.get("source_url"),
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        res = supabase.table("cars").insert(payload).execute()
        if res.data:
            duty_fmt = f"{duty:,.0f}" if duty is not None else "N/A"
            print(f"[OK] Inserted {car['year']} {car['make']} {car['model']} — Duty: {duty_fmt} DZD")
            # Push new listing to TikTok as a draft
            publish_car_to_tiktok(car, car.get("images") or [])
        else:
            print(f"[ERR] Insert failed: {res}")
    except Exception as e:
        print(f"[ERR] {car.get('make')} processing failed: {e}")


def main():
    target_url = os.environ.get("TARGET_URL", "").strip()

    if target_url:
        print(f"[RUN] TARGET_URL: {target_url}")
        car = parse_autocango(target_url)
        if car:
            insert_car_record(car)
    else:
        print("[RUN] No TARGET_URL — running dummy bulk sweep...")
        for car in DUMMY_CARS:
            insert_car_record(car)


if __name__ == "__main__":
    main()
