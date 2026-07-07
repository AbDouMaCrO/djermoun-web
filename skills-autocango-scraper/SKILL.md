---
name: autocango-scraper
description: "Scrape used car listings from autocango.com with filters (engine size, year, price), export to Excel, and download all listing images per car. Use when user wants to scrape autocango.com, export car listings to Excel, or download car images for WooCommerce upload."
---

# /autocango-scraper

Scrape used car listings from autocango.com, export to Excel sorted by price, and download all listing images per car organized by SKU.

## Key Context

- **Bot protection**: autocango.com blocks Playwright/requests. Only `curl_cffi` with `impersonate="chrome131"` works.
- **CDN images**: `m.tichetech.com` requires `/d?imageMogr2/format/jpg/strip` appended to each image URL (returns 403 without it).
- **Primary car isolation**: Each listing page shows related cars too. Use `Counter` on `car_id` from CDN URL pattern to identify primary car's images.
- **Resume logic**: Skip SKU folders that already exist and contain files.
- **AI Rating**: Not available via static scrape — requires JavaScript execution. Skip or set to None.

## Files

- `C:\Users\HP\Downloads\ClaudePro\build_excel.py` — raw car data + filter + Excel export
- `C:\Users\HP\Downloads\ClaudePro\scrape_images.py` — image downloader per SKU
- `C:\Users\HP\Downloads\ClaudePro\upload_to_woo.py` — WooCommerce upload script
- `C:\Users\HP\Downloads\autocango_1_5L_2023plus.xlsx` — output Excel (369 cars, sorted by price)
- `C:\Users\HP\Downloads\car_images\{SKU}\` — downloaded images (image_1.jpg, image_2.jpg, ...)
- `C:\Users\HP\Downloads\ClaudePro\upload_log.json` — upload resume log (done/failed SKUs)

## Current Dataset

- **Filter**: engine contains "1.5", year >= 2023
- **Entries**: 369 qualifying cars (367 with images, 2 expired: ACU90581665, ACU90581669)
- **WooCommerce**: ~28 products uploaded before pause (resume: run upload_to_woo.py again)
- Sorted by lowest price first

---

## Full Listing Page Fields

Each listing page (e.g. `https://www.autocango.com/sku/usedcar-{Brand}-{Model}-{SKU}`) exposes:

| Field | Source | Example |
|---|---|---|
| Title (WP post title) | `<title>` strip suffix | `Used 2022 ChangAn UNI-V 1.5T 188HP L4 7DCT` |
| Code / SKU | URL or page | `ACU90589222` |
| Date | scrape date | `2026-06-27` |
| Full title | breadcrumb / page h-area | `2022 ChangAn UNI-V 1.5T 188HP L4 7DCT` |
| New price (MSRP CNY) | `<p class="msrp">` | `MSRP ¥116,900` |
| Price (USD, FOB) | first `$X,XXX` dollar text | `$8,070` |
| AI Rating | JS-rendered only | not scrapeable statically |
| Reg. Year | label/value pair | `2022-07` |
| Engine (cc) | "Relevant Car Specs" block | `1494` |
| Mileage (km) | vehicle details table | `54000` |
| Fuel | vehicle details table | `Petrol` |
| Transmission | vehicle details table | `DCT` |
| Description | condition text block | full paragraph |
| Location | page footer area | `Huizhou Guangdong China` |
| Accessories | `<ul>` list items | `Sun Roof, Leather Seat, ...` |
| Vehicle Details | `<table>` rows (key/value pairs) | see below |
| Images | CDN image URLs | downloaded to `car_images/{SKU}/` |

### Vehicle Details table keys
`Ref ID, Steering, Model Code, Body Type, Model Year, Mlg(km), Exterior Color, Fuel, Engine, Transmission, Drivetrain, Batt.Cap.(kWh), Range(km), Motor Power(kW), Seats, Doors, Dim.(mm), M³, Weight(kg), Max.Cap(kg)`

---

## Parsing Code

### Session (required for all requests)
```python
from curl_cffi import requests as cf_requests
SESSION = cf_requests.Session(impersonate="chrome131")
```

### Parse full listing page
```python
from bs4 import BeautifulSoup
import re

def parse_listing(url):
    r = SESSION.get(url, timeout=60)
    soup = BeautifulSoup(r.text, "html.parser")
    html = r.text

    # Title
    title_tag = soup.find("title")
    title = re.sub(r'\s*for Export.*$', '', title_tag.text).strip() if title_tag else ""

    # Full title (without "Used" prefix)
    full_title = re.sub(r'^Used\s+', '', title)

    # MSRP (CNY)
    msrp_el = soup.find("p", class_="msrp")
    msrp = msrp_el.get_text(strip=True) if msrp_el else ""  # e.g. "MSRP ¥116,900"

    # USD Price (first dollar amount on page)
    usd_prices = re.findall(r'\$([\d,]+)', html)
    price_usd = usd_prices[0].replace(",", "") if usd_prices else ""

    # Reg Year
    reg_label = soup.find("p", string=re.compile(r"Reg\. Year"))
    reg_year = ""
    if reg_label:
        val_el = reg_label.find_next_sibling("p")
        if val_el:
            reg_year = val_el.get_text(strip=True)  # e.g. "2022-07"

    # Engine CC (from Relevant Car Specs section)
    engcc_m = re.search(r'Engine Power \(kW\)\s*\n(\d+)', r.text)  # mislabeled as kW, actually cc
    if not engcc_m:
        # fallback: look in text
        from io import StringIO
        text = soup.get_text(separator="\n", strip=True)
        engcc_m = re.search(r"Engine\(cc\)\s*\n(\d+)", text)
    engine_cc = engcc_m.group(1) if engcc_m else ""

    # Vehicle Details table (key → value dict)
    details = {}
    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            cells = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
            if len(cells) >= 2:
                details[cells[0]] = cells[1]
            if len(cells) == 4:
                details[cells[2]] = cells[3]

    # Accessories
    accessories = []
    acc_item = soup.find(string=re.compile(r'Sun Roof|Leather Seat|ABS|Airbag', re.IGNORECASE))
    if acc_item:
        container = acc_item.find_parent("ul") or acc_item.find_parent("div")
        if container:
            accessories = [li.get_text(strip=True) for li in container.find_all(["li", "span"])]
            accessories = [a for a in accessories if a]

    # Description
    text_content = soup.get_text(separator="\n", strip=True)
    desc_m = re.search(r"Description\n(.+?)(?:\nContact|$)", text_content, re.DOTALL)
    description = desc_m.group(1).strip() if desc_m else ""

    # Location
    loc_m = re.search(r'([A-Za-z\s]+ China)', text_content)
    location = loc_m.group(1).strip() if loc_m else details.get("Location", "")

    return {
        "title": title,
        "full_title": full_title,
        "msrp_cny": msrp,
        "price_usd": price_usd,
        "reg_year": reg_year,
        "engine_cc": engine_cc,
        "mileage_km": details.get("Mlg(km)", ""),
        "fuel": details.get("Fuel", ""),
        "transmission": details.get("Transmission", ""),
        "body_type": details.get("Body Type", ""),
        "steering": details.get("Steering", ""),
        "model_code": details.get("Model Code", ""),
        "model_year": details.get("Model Year", ""),
        "exterior_color": details.get("Exterior Color", ""),
        "engine": details.get("Engine", ""),
        "drivetrain": details.get("Drivetrain", ""),
        "batt_cap": details.get("Batt.Cap.(kWh)", ""),
        "range_km": details.get("Range(km)", ""),
        "motor_power": details.get("Motor Power(kW)", ""),
        "seats": details.get("Seats", ""),
        "doors": details.get("Doors", ""),
        "dimensions": details.get("Dim.(mm)", ""),
        "volume_m3": details.get("M³", ""),
        "weight_kg": details.get("Weight(kg)", ""),
        "max_capacity_kg": details.get("Max.Cap(kg)", ""),
        "accessories": accessories,
        "description": description,
        "location": location,
        "ai_rating": None,  # requires JS, not scrapeable statically
    }
```

### Image scraping
```python
from collections import Counter

IMG_PATTERN = re.compile(
    r'(https://m\.tichetech\.com/used/\d+/(\d+)/[^\s\"\'<>]+\.(?:webp|jpg|jpeg|png))',
    re.IGNORECASE,
)
CDN_SUFFIX = "/d?imageMogr2/format/jpg/strip"

def get_car_image_urls(listing_url):
    r = SESSION.get(listing_url, timeout=60)
    matches = IMG_PATTERN.findall(r.text)
    if not matches:
        return []
    id_counts = Counter(cid for _, cid in matches)
    primary_id = id_counts.most_common(1)[0][0]
    seen, result = set(), []
    for full_url, cid in matches:
        base = full_url.split("?")[0]
        if cid == primary_id and base not in seen:
            seen.add(base); result.append(base)
    return result

def download_image(img_base_url, dest):
    for attempt in range(2):
        try:
            r = SESSION.get(img_base_url + CDN_SUFFIX, timeout=40,
                            headers={"Referer": "https://www.autocango.com/"})
            if r.status_code == 200 and len(r.content) > 5000:
                dest.write_bytes(r.content); return True
        except Exception:
            if attempt == 0: import time; time.sleep(2)
    return False
```

### Read Excel for SKU + URL
```python
import openpyxl
wb = openpyxl.load_workbook(EXCEL_PATH)
ws = wb.active
cars = []
for row in ws.iter_rows(min_row=3, values_only=True):
    if row[12] and row[13]:  # SKU at index 12, URL at index 13
        cars.append((str(row[12]), str(row[13])))
```

### Resume / skip completed
```python
from pathlib import Path
OUT_DIR = Path(r"C:\Users\HP\Downloads\car_images")
done = {d.name for d in OUT_DIR.iterdir() if d.is_dir() and any(d.iterdir())}
todo = [(s, u) for s, u in cars if s not in done]
```

---

## WooCommerce Upload

- **Site**: `http://djermoun-auto.local`
- **WC API**: consumer key/secret in `upload_to_woo.py`
- **WP media**: Application Password in `upload_to_woo.py`
- **Auth fix**: `$_SERVER['HTTPS'] = 'on';` added to `wp-config.php` (enables Basic Auth over HTTP)
- **Resume**: `upload_log.json` tracks done/failed SKUs; rerun script to continue

### WooCommerce product field mapping
| Listing field | WooCommerce field |
|---|---|
| full_title | `name` |
| price_usd | `regular_price` |
| sku | `sku` |
| description | `description` |
| brand, model, year, engine, transmission, fuel, mileage_km, location | `attributes[]` |
| image_ids (uploaded via WP media API) | `images[]` |
| source URL | `meta_data[source_url]` |

### Richer attribute mapping (to add)
Additional attributes from full listing parse:
`body_type, steering, model_code, exterior_color, drivetrain, seats, doors, dimensions, weight_kg, reg_year, engine_cc, msrp_cny, accessories (comma-joined)`
