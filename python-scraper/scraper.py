import os
import re
from collections import Counter
from datetime import datetime

from bs4 import BeautifulSoup
from curl_cffi import requests as cf_requests

from db import supabase
from duty_calculator import CustomsDutyCalculator

calculator = CustomsDutyCalculator()

SESSION = cf_requests.Session(impersonate="chrome131")

CDN_PATTERN = re.compile(
    r'(https://m\.tichetech\.com/used/\d+/(\d+)/[^\s\"\'<>]+\.(?:webp|jpg|jpeg|png))',
    re.IGNORECASE,
)
CDN_SUFFIX = "/d?imageMogr2/format/jpg/strip"

DUMMY_CARS = [
    {"make": "CHERY",  "model": "TIGGO 8 PRO", "year": 2025, "price_cny": 145000},
    {"make": "GEELY",  "model": "COOLRAY",      "year": 2024, "price_cny": 98000},
    {"make": "BYD",    "model": "ATTO 3",        "year": 2025, "price_cny": 160000},
    {"make": "HAVAL",  "model": "JOLION",        "year": 2024, "price_cny": 110000},
]


def parse_autocango(url):
    print(f"[SCRAPE] Fetching: {url}")
    r = SESSION.get(url, timeout=60)
    if r.status_code != 200:
        print(f"[ERR] HTTP {r.status_code} for {url}")
        return None

    soup = BeautifulSoup(r.text, "html.parser")
    html = r.text
    text = soup.get_text(separator="\n", strip=True)

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
        # Last part is SKU (starts with ACU or similar), rest is make-model
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
    primary_image = None
    images = []
    if matches:
        id_counts = Counter(cid for _, cid in matches)
        primary_id = id_counts.most_common(1)[0][0]
        seen = set()
        for full_url, cid in matches:
            base = full_url.split("?")[0]
            if cid == primary_id and base not in seen:
                seen.add(base)
                images.append(base + CDN_SUFFIX)
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
        payload = {
            "make":             car["make"],
            "model":            car["model"],
            "year":             car["year"],
            "price_cny":        car["price_cny"],
            "customs_duty_dzd": duty,
            "status":           "available",
            "is_visible":       True,
            "primary_image":    car.get("primary_image"),
            "images":           car.get("images") or [],
            "mileage":          car.get("mileage"),
            "fuel":             car.get("fuel"),
            "fuel_type":        car.get("fuel_type"),
            "transmission":     car.get("transmission"),
            "engine":           car.get("engine"),
            "exterior_color":   car.get("exterior_color"),
            "accessories":      car.get("accessories"),
            "title":            car.get("title"),
            "source_url":       car.get("source_url"),
        }
        # Drop None so DB defaults apply
        payload = {k: v for k, v in payload.items() if v is not None}

        res = supabase.table("cars").insert(payload).execute()
        if res.data:
            duty_fmt = f"{duty:,.0f}" if duty is not None else "N/A"
            print(f"[OK] Inserted {car['year']} {car['make']} {car['model']} — Duty: {duty_fmt} DZD")
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
