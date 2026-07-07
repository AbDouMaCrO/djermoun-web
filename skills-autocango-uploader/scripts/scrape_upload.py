"""
On-demand autocango.com -> WooCommerce uploader.

Usage:
    python scrape_upload.py <url> [<url> ...] [--min-year YYYY] [--max-pages N]

URL types (auto-detected):
  * Single listing : https://www.autocango.com/sku/usedcar-<Brand>-<Model>-ACU<digits>
  * Brand / search : https://www.autocango.com/usedcar/brandName=<Brand>   (paginated)
                     any /usedcar/... or /search... collection page

Config (site URL + credentials) lives in config.json next to this script.
Resumable: progress stored in <state_dir>/upload_state.json (keyed by SKU).
Crash-safe: network errors on any single car are logged and skipped, never fatal.
"""
import sys, os, io, re, json, time, argparse
from pathlib import Path
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from curl_cffi import requests as cf_requests
from bs4 import BeautifulSoup
import requests as wp_requests

HERE = Path(__file__).resolve().parent
CONFIG = json.loads((HERE / "config.json").read_text(encoding="utf-8"))

SITE_URL   = CONFIG["site_url"].rstrip("/")
WC_AUTH    = (CONFIG["wc_consumer_key"], CONFIG["wc_consumer_secret"])
WP_AUTH    = (CONFIG["wp_user"], CONFIG["wp_app_password"])
IMAGES_DIR = Path(CONFIG.get("images_dir", str(HERE / "car_images")))
STATE_DIR  = Path(CONFIG.get("state_dir", str(HERE)))
WORKERS    = int(CONFIG.get("workers", 3))

WC_API   = f"{SITE_URL}/wp-json/wc/v3"
WP_MEDIA = f"{SITE_URL}/wp-json/wp/v2/media"
STATE_PATH = STATE_DIR / "upload_state.json"

SESSION = cf_requests.Session(impersonate="chrome131")
IMG_PATTERN = re.compile(
    r'(https://m\.tichetech\.com/used/\d+/(\d+)/[^\s"\'<>]+\.(?:webp|jpg|jpeg|png))', re.IGNORECASE)
CDN_SUFFIX = "/d?imageMogr2/format/jpg/strip"


# ---------------- URL discovery ----------------
def is_listing(url):
    return bool(re.search(r'/sku/usedcar-.+-ACU\d+', url))

def collect_listing_urls(collection_url, max_pages=30):
    """Paginate a brand/search page, return unique listing URLs (union across pages)."""
    base = collection_url.rstrip("/")
    seen, streak = {}, 0
    for page in range(1, max_pages + 1):
        url = base if page == 1 else f"{base}/pageNum={page}"
        html = ""
        for attempt in range(3):
            try:
                r = SESSION.get(url, timeout=40)
                if r.status_code == 200:
                    html = r.text; break
            except Exception:
                time.sleep(2)
        found = set(re.findall(r'/sku/usedcar-[A-Za-z0-9\-]+-ACU\d+', html))
        new = found - seen.keys()
        for s in found:
            seen[s] = True
        print(f"  page {page}: {len(found)} on page, {len(new)} new, total={len(seen)}", flush=True)
        streak = streak + 1 if not new else 0
        if streak >= 4:
            break
        time.sleep(1)
    return ["https://www.autocango.com" + s for s in sorted(seen.keys())]


# ---------------- parsing ----------------
def parse_listing(url, html=None):
    if html is None:
        html = SESSION.get(url, timeout=60).text
    soup = BeautifulSoup(html, "html.parser")
    title_tag = soup.find("title")
    title = re.sub(r'\s*for Export.*$', '', title_tag.text).strip() if title_tag else ""
    full_title = re.sub(r'^Used\s+', '', title)
    msrp_el = soup.find("p", class_="msrp")
    msrp = msrp_el.get_text(strip=True) if msrp_el else ""
    usd = re.findall(r'\$([\d,]+)', html)
    price_usd = usd[0].replace(",", "") if usd else ""
    reg_label = soup.find("p", string=re.compile(r"Reg\. Year"))
    reg_year = ""
    if reg_label:
        v = reg_label.find_next_sibling("p")
        if v: reg_year = v.get_text(strip=True)
    text = soup.get_text(separator="\n", strip=True)
    engcc = re.search(r"Engine\(cc\)\s*\n(\d+)", text)
    engine_cc = engcc.group(1) if engcc else ""
    details = {}
    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            c = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
            if len(c) >= 2: details[c[0]] = c[1]
            if len(c) == 4: details[c[2]] = c[3]
    accessories = []
    acc_block = re.search(r"Accessories\n(.+?)\nRelevant Car Specs", text, re.DOTALL)
    if acc_block:
        accessories = [a.strip() for a in acc_block.group(1).split("\n") if a.strip()]
    desc_m = re.search(r"Description\n(.+?)(?:\nContact|\nCopy Link|$)", text, re.DOTALL)
    description = desc_m.group(1).strip() if desc_m else ""
    loc = re.search(r'\n([^\n]+? China)\nSID', text)
    if not loc:
        loc = re.search(r'\b([A-Z][a-z]+ [A-Z][a-z]+ China)\b', text)
    location = loc.group(1).strip() if loc else ""
    sku = (re.search(r'(ACU\d+)', url) or [None])[0]
    sku = re.search(r'(ACU\d+)', url).group(1) if re.search(r'(ACU\d+)', url) else ""
    bm = re.search(r'usedcar-([A-Za-z0-9]+)-(.+?)-ACU', url)
    brand = bm.group(1) if bm else ""
    model = bm.group(2).replace("-", " ") if bm else ""
    year = details.get("Model Year", "") or (reg_year[:4] if reg_year else "")
    return {
        "sku": sku, "url": url, "title": title, "full_title": full_title,
        "brand": brand, "model": model, "year": year,
        "msrp_cny": msrp, "price_usd": price_usd, "reg_year": reg_year,
        "engine_cc": engine_cc, "mileage_km": details.get("Mlg(km)", ""),
        "fuel": details.get("Fuel", ""), "transmission": details.get("Transmission", ""),
        "body_type": details.get("Body Type", ""), "steering": details.get("Steering", ""),
        "model_code": details.get("Model Code", ""), "exterior_color": details.get("Exterior Color", ""),
        "engine": details.get("Engine", ""), "drivetrain": details.get("Drivetrain", ""),
        "seats": details.get("Seats", ""), "doors": details.get("Doors", ""),
        "dimensions": details.get("Dim.(mm)", ""), "weight_kg": details.get("Weight(kg)", ""),
        "accessories": accessories, "description": description, "location": location,
        "_html": html,
    }


# ---------------- images ----------------
def get_image_urls(html):
    matches = IMG_PATTERN.findall(html)
    if not matches: return []
    primary = Counter(cid for _, cid in matches).most_common(1)[0][0]
    seen, out = set(), []
    for full, cid in matches:
        base = full.split("?")[0]
        if cid == primary and base not in seen:
            seen.add(base); out.append(base)
    return out

def download_image(base_url, dest):
    for attempt in range(2):
        try:
            r = SESSION.get(base_url + CDN_SUFFIX, timeout=40,
                            headers={"Referer": "https://www.autocango.com/"})
            if r.status_code == 200 and len(r.content) > 5000:
                dest.write_bytes(r.content); return True
        except Exception:
            if attempt == 0: time.sleep(2)
    return False

def upload_media(path, sku, idx):
    fn = f"{sku}_image_{idx}.jpg"
    for attempt in range(3):
        try:
            r = wp_requests.post(WP_MEDIA, auth=WP_AUTH,
                headers={"Content-Disposition": f'attachment; filename="{fn}"',
                         "Content-Type": "image/jpeg"},
                data=path.read_bytes(), timeout=60)
            if r.status_code in (200, 201):
                return r.json()["id"]
        except Exception:
            pass
        if attempt < 2: time.sleep(2)
    return None


# ---------------- woocommerce ----------------
def existing_sku_map():
    m, page = {}, 1
    while True:
        try:
            r = wp_requests.get(f"{WC_API}/products", auth=WC_AUTH,
                                params={"per_page": 100, "page": page}, timeout=30)
            data = r.json()
        except Exception:
            break
        if not isinstance(data, list) or not data: break
        for p in data:
            if p.get("sku"): m[p["sku"]] = p["id"]
        if len(data) < 100: break
        page += 1
    return m

def build_payload(car, image_ids):
    acc = ", ".join(car["accessories"])
    desc = (
        f"<p>{car['description']}</p>"
        f"<h3>Vehicle Details</h3><ul>"
        f"<li><strong>Engine:</strong> {car['engine']} ({car['engine_cc']} cc)</li>"
        f"<li><strong>Transmission:</strong> {car['transmission']}</li>"
        f"<li><strong>Fuel:</strong> {car['fuel']}</li>"
        f"<li><strong>Drivetrain:</strong> {car['drivetrain']}</li>"
        f"<li><strong>Mileage:</strong> {car['mileage_km']} km</li>"
        f"<li><strong>Reg. Year:</strong> {car['reg_year']}</li>"
        f"<li><strong>Exterior Color:</strong> {car['exterior_color']}</li>"
        f"<li><strong>Body Type:</strong> {car['body_type']}</li>"
        f"<li><strong>Steering:</strong> {car['steering']}</li>"
        f"<li><strong>Seats:</strong> {car['seats']} &nbsp; <strong>Doors:</strong> {car['doors']}</li>"
        f"<li><strong>Dimensions (mm):</strong> {car['dimensions']}</li>"
        f"<li><strong>Weight (kg):</strong> {car['weight_kg']}</li>"
        f"<li><strong>Location:</strong> {car['location']}</li>"
        f"<li><strong>MSRP:</strong> {car['msrp_cny']}</li>"
        f"</ul>"
        f"<h3>Accessories</h3><p>{acc}</p>"
        f'<p>Source: <a href="{car["url"]}" target="_blank">{car["url"]}</a></p>'
    )
    def attr(name, val):
        return {"name": name, "options": [str(val)], "visible": True} if val and val != "-" else None
    attrs = [a for a in [
        attr("Brand", car["brand"]), attr("Model", car["model"]), attr("Year", car["year"]),
        attr("Engine", car["engine"]), attr("Engine (cc)", car["engine_cc"]),
        attr("Transmission", car["transmission"]), attr("Fuel", car["fuel"]),
        attr("Drivetrain", car["drivetrain"]), attr("Mileage (km)", car["mileage_km"]),
        attr("Reg. Year", car["reg_year"]), attr("Exterior Color", car["exterior_color"]),
        attr("Body Type", car["body_type"]), attr("Steering", car["steering"]),
        attr("Model Code", car["model_code"]), attr("Seats", car["seats"]),
        attr("Doors", car["doors"]), attr("Dimensions (mm)", car["dimensions"]),
        attr("Weight (kg)", car["weight_kg"]), attr("Location", car["location"]),
        attr("MSRP (CNY)", car["msrp_cny"]), attr("Accessories", acc),
    ] if a]
    return {
        "name": car["full_title"], "type": "simple", "status": "publish",
        "sku": car["sku"], "regular_price": str(car["price_usd"]),
        "description": desc, "attributes": attrs,
        "images": [{"id": i} for i in image_ids if i],
        "meta_data": [{"key": "source_url", "value": car["url"]}],
    }


# ---------------- pipeline ----------------
def process_one(url, existing, state, min_year):
    sku = re.search(r'(ACU\d+)', url)
    sku = sku.group(1) if sku else url
    if sku in state.get("done", []):
        print(f"  {sku}: already done, skip", flush=True); return
    try:
        car = parse_listing(url)
    except Exception as e:
        print(f"  {sku}: parse error {str(e)[:120]}", flush=True)
        state.setdefault("failed", []).append({"sku": sku, "error": str(e)[:200]}); return
    try:
        yr = int(car["year"]) if car["year"] else 0
    except ValueError:
        yr = 0
    if min_year and yr and yr < min_year:
        print(f"  {sku}: skip year={car['year']} ({car['brand']} {car['model']})", flush=True)
        state.setdefault("skipped_year", []).append(sku)
        state.setdefault("done", []).append(sku); return

    print(f"  {sku}: {car['year']} {car['brand']} {car['model']} | ${car['price_usd']} | {car['mileage_km']}km", flush=True)
    img_dir = IMAGES_DIR / sku
    img_dir.mkdir(parents=True, exist_ok=True)
    imgnum = lambda p: int(re.search(r'image_(\d+)', p.name).group(1))
    imgs = sorted(img_dir.glob("image_*.jpg"), key=imgnum)
    if not imgs:
        bases = get_image_urls(car["_html"])
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            list(ex.map(lambda ib: download_image(ib[1], img_dir / f"image_{ib[0]}.jpg"),
                        enumerate(bases, 1)))
        imgs = sorted(img_dir.glob("image_*.jpg"), key=imgnum)

    results = {}
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(upload_media, p, sku, imgnum(p)): imgnum(p) for p in imgs}
        for fut in as_completed(futs):
            mid = fut.result()
            if mid: results[futs[fut]] = mid
    image_ids = [results[k] for k in sorted(results)]
    print(f"  {sku}: {len(image_ids)}/{len(imgs)} images uploaded", flush=True)

    payload = build_payload(car, image_ids)
    action = "updated" if sku in existing else "created"
    try:
        if sku in existing:
            resp = wp_requests.put(f"{WC_API}/products/{existing[sku]}", auth=WC_AUTH, json=payload, timeout=120)
        else:
            resp = wp_requests.post(f"{WC_API}/products", auth=WC_AUTH, json=payload, timeout=120)
        if resp.status_code in (200, 201):
            print(f"  {sku}: OK product #{resp.json()['id']} {action}", flush=True)
            state.setdefault("done", []).append(sku)
        else:
            print(f"  {sku}: FAIL {resp.status_code} {resp.text[:120]}", flush=True)
            state.setdefault("failed", []).append({"sku": sku, "status": resp.status_code})
    except Exception as e:
        print(f"  {sku}: FAIL exception {str(e)[:120]}", flush=True)
        state.setdefault("failed", []).append({"sku": sku, "error": str(e)[:200]})


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
    ap = argparse.ArgumentParser()
    ap.add_argument("urls", nargs="+")
    ap.add_argument("--min-year", type=int, default=0, help="only upload cars with year >= this")
    ap.add_argument("--max-pages", type=int, default=30)
    args = ap.parse_args()

    # expand collection URLs into listing URLs
    listing_urls = []
    for u in args.urls:
        if is_listing(u):
            listing_urls.append(u)
        else:
            print(f"Collection page: {u}", flush=True)
            listing_urls.extend(collect_listing_urls(u, args.max_pages))
    # dedupe preserve order
    seen = set(); listing_urls = [x for x in listing_urls if not (x in seen or seen.add(x))]
    print(f"\nTotal listings to process: {len(listing_urls)} | min-year={args.min_year or 'none'}\n", flush=True)

    state = json.loads(STATE_PATH.read_text()) if STATE_PATH.exists() else {}
    print("Fetching existing WooCommerce products...", flush=True)
    existing = existing_sku_map()
    print(f"Existing products: {len(existing)}\n", flush=True)

    for i, url in enumerate(listing_urls, 1):
        print(f"[{i}/{len(listing_urls)}]", flush=True)
        process_one(url, existing, state, args.min_year)
        STATE_PATH.write_text(json.dumps(state, indent=2))
        time.sleep(0.3)

    done = state.get("done", []); sk = state.get("skipped_year", []); fa = state.get("failed", [])
    print(f"\n=== DONE: {len(done) - len(sk)} uploaded, {len(sk)} skipped, {len(fa)} failed ===", flush=True)
    if fa:
        print("Failed:", [f.get('sku') for f in fa], flush=True)


if __name__ == "__main__":
    main()
