import json
import os
import re
import sys
from datetime import datetime

import requests
from bs4 import BeautifulSoup

from db import supabase
from duty_calculator import CustomsDutyCalculator

calculator = CustomsDutyCalculator()

DUMMY_CARS = [
    {"make": "CHERY",  "model": "TIGGO 8 PRO", "year": 2025, "price_cny": 145000},
    {"make": "GEELY",  "model": "COOLRAY",      "year": 2024, "price_cny": 98000},
    {"make": "BYD",    "model": "ATTO 3",        "year": 2025, "price_cny": 160000},
    {"make": "HAVAL",  "model": "JOLION",        "year": 2024, "price_cny": 110000},
]

KNOWN_MAKES = [
    "BYD", "GEELY", "CHERY", "HAVAL", "MG", "DONGFENG",
    "CHANGAN", "JAC", "JETOUR", "OMODA", "TANK", "EXEED",
    "VOLKSWAGEN", "TOYOTA", "HONDA", "HYUNDAI", "KIA",
]


def _extract_year(text):
    m = re.search(r"\b(20[12][0-9])\b", text)
    return int(m.group(1)) if m else None


def _extract_price(text):
    m = re.search(r"([\d\s .,]+)\s*(DZD|DA|dinar|CNY|USD|€|\$)", text, re.IGNORECASE)
    if m:
        cleaned = re.sub(r"[\s ,]", "", m.group(1)).replace(",", "")
        try:
            return float(cleaned)
        except ValueError:
            pass
    return None


def _extract_mileage(text):
    m = re.search(r"([\d\s]+)\s*km", text, re.IGNORECASE)
    if m:
        cleaned = re.sub(r"\s", "", m.group(1))
        try:
            val = int(cleaned)
            return val if 100 < val < 1_000_000 else None
        except ValueError:
            pass
    return None


def _make_from_text(text):
    upper = text.upper()
    for make in KNOWN_MAKES:
        if make in upper:
            return make
    return None


def parse_url_to_car_data(url):
    print(f"[SCRAPE] Fetching: {url}")

    make = model = year = price_cny = primary_image = mileage = fuel = transmission = title = None
    page_title = ""
    all_images = []

    try:
        resp = requests.get(url, headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "fr-DZ,fr;q=0.9,en;q=0.8",
        }, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # --- 1. JSON-LD structured data ---
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "")
                if not isinstance(data, dict):
                    continue
                if data.get("@type") in ("Car", "Vehicle", "Product"):
                    brand = data.get("brand") or {}
                    make = make or (brand.get("name") if isinstance(brand, dict) else brand)
                    model = model or data.get("model") or data.get("name")
                    year = year or data.get("vehicleModelDate") or data.get("productionDate")
                    offers = data.get("offers") or {}
                    price_cny = price_cny or (offers.get("price") if isinstance(offers, dict) else None)
                    mileage = mileage or data.get("mileageFromOdometer", {}).get("value") if isinstance(data.get("mileageFromOdometer"), dict) else mileage
                    fuel = fuel or data.get("fuelType")
                    transmission = transmission or data.get("vehicleTransmission")
                    img = data.get("image")
                    if img:
                        primary_image = primary_image or (img[0] if isinstance(img, list) else img)
            except Exception:
                pass

        # --- 2. OG / meta tags ---
        og_title = soup.find("meta", property="og:title")
        og_image = soup.find("meta", property="og:image")
        title_tag = soup.find("title")
        page_title = (
            og_title.get("content", "").strip() if og_title else
            (title_tag.get_text(strip=True) if title_tag else "")
        )
        title = page_title or None
        if og_image and og_image.get("content"):
            primary_image = primary_image or og_image["content"].strip()

        # --- 3. Common HTML selectors ---
        if not make:
            for sel in ["[itemprop='brand']", ".car-make", ".brand", ".marque", ".vehicle-brand"]:
                el = soup.select_one(sel)
                if el:
                    make = el.get_text(strip=True)
                    break

        if not model:
            for sel in ["[itemprop='model']", ".car-model", ".model", ".modele",
                        ".vehicle-title", ".listing-title", "h1"]:
                el = soup.select_one(sel)
                if el:
                    text = el.get_text(strip=True)
                    if text and len(text) < 80:
                        model = text
                        break

        if not year:
            for sel in ["[itemprop='vehicleModelDate']", ".car-year", ".annee", ".year"]:
                el = soup.select_one(sel)
                if el:
                    year = _extract_year(el.get_text())
                    break

        if not price_cny:
            for sel in ["[itemprop='price']", ".price", ".prix", ".car-price", ".listing-price"]:
                el = soup.select_one(sel)
                if el:
                    price_cny = _extract_price(el.get_text())
                    break

        if not mileage:
            for sel in ["[itemprop='mileageFromOdometer']", ".mileage", ".kilometrage", ".km"]:
                el = soup.select_one(sel)
                if el:
                    mileage = _extract_mileage(el.get_text())
                    break

        if not fuel:
            for sel in ["[itemprop='fuelType']", ".fuel", ".carburant", ".fuel-type"]:
                el = soup.select_one(sel)
                if el:
                    fuel = el.get_text(strip=True) or None
                    break

        if not transmission:
            for sel in ["[itemprop='vehicleTransmission']", ".transmission", ".boite", ".gearbox"]:
                el = soup.select_one(sel)
                if el:
                    transmission = el.get_text(strip=True) or None
                    break

        # Collect gallery images
        for img in soup.select("img[src]"):
            src = img.get("src", "")
            if src.startswith("http") and any(x in src for x in ["car", "vehicl", "photo", "img", "upload"]):
                all_images.append(src)
        all_images = list(dict.fromkeys(all_images))[:10]  # dedupe, cap at 10

        # --- 4. Regex sweep on full page text ---
        full_text = soup.get_text(" ", strip=True)

        if not year:
            year = _extract_year(full_text)
        if not price_cny:
            price_cny = _extract_price(full_text)
        if not make:
            make = _make_from_text(full_text)
        if not mileage:
            mileage = _extract_mileage(full_text)

        # --- 5. Title fallback ---
        if (not make or not model) and page_title:
            make = make or _make_from_text(page_title)
            if not model:
                parts = re.split(r"[\s\-|–]+", page_title)
                model_parts = [p for p in parts if p.upper() not in (KNOWN_MAKES + [""])]
                model = " ".join(model_parts[:3]) if model_parts else None

    except requests.RequestException as e:
        print(f"[WARN] HTTP fetch failed ({e}), falling back to URL parsing")

    # --- 6. URL slug fallback ---
    if not make:
        make = _make_from_text(url)
    if not model:
        slug = url.rstrip("/").split("/")[-1]
        slug = re.sub(r"[_\-]+", " ", slug).split("?")[0].strip()
        model = slug.upper() if slug else "UNKNOWN"
    if not year:
        year = datetime.now().year
    if not price_cny:
        price_cny = 0

    # Use first gallery image as primary if og:image missed
    if not primary_image and all_images:
        primary_image = all_images[0]

    result = {
        "make":          str(make).upper().strip() if make else "UNKNOWN",
        "model":         str(model).upper().strip() if model else "UNKNOWN",
        "year":          int(year),
        "price_cny":     float(price_cny),
        "primary_image": primary_image,
        "images":        all_images if all_images else ([primary_image] if primary_image else []),
        "mileage":       int(mileage) if mileage else None,
        "fuel":          str(fuel).strip() if fuel else None,
        "transmission":  str(transmission).strip() if transmission else None,
        "title":         title,
        "source_url":    url,
    }
    print(f"[SCRAPE] Parsed: make={result['make']} model={result['model']} year={result['year']} "
          f"price={result['price_cny']} image={'yes' if primary_image else 'NO'} mileage={result['mileage']}")
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
            "transmission":     car.get("transmission"),
            "title":            car.get("title"),
            "source_url":       car.get("source_url"),
        }
        # Drop None values so DB defaults apply
        payload = {k: v for k, v in payload.items() if v is not None}

        res = supabase.table("cars").insert(payload).execute()
        if res.data:
            duty_fmt = f"{duty:,.0f}" if duty is not None else "N/A"
            print(f"[OK] Inserted {car['year']} {car['make']} {car['model']} - Duty: {duty_fmt} DZD")
        else:
            print(f"[ERR] Failed to insert {car['year']} {car['make']} {car['model']}: {res}")
    except Exception as e:
        print(f"[ERR] Processing entry {car.get('make')} failed: {e}")


def main():
    target_url = os.environ.get("TARGET_URL", "").strip()

    if target_url:
        print(f"Target URL detected: {target_url}")
        scraped_car = parse_url_to_car_data(target_url)
        insert_car_record(scraped_car)
    else:
        print("No TARGET_URL found. Running default bulk sweep...")
        for car in DUMMY_CARS:
            insert_car_record(car)


if __name__ == "__main__":
    main()
