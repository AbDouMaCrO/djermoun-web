"""
TikTok Content Posting API — Photo Post Publisher.

Sends a car listing as a photo slideshow draft to the TikTok mobile inbox
(post_mode=MEDIA_UPLOAD). The creator then reviews and publishes from the app.

Required env var:
  TIKTOK_ACCESS_TOKEN — OAuth 2.0 user access token with
                        video.upload + video.publish scopes.
"""

import json
import logging
import os

import requests

logger = logging.getLogger(__name__)

TIKTOK_API_URL = "https://open.tiktokapis.com/v2/post/publish/content/init/"
MAX_PHOTOS = 35  # TikTok hard limit per post


def generate_tiktok_payload(car_data: dict, clean_image_urls: list[str]) -> dict:
    """
    Build the JSON payload for TikTok Content Posting API (photo post).

    Args:
        car_data: dict with keys: make, model, year, price_cny, mileage,
                  fuel, transmission, engine, condition, exterior_color.
        clean_image_urls: list of public HTTPS URLs for the car images.

    Returns:
        dict ready to be sent as JSON to /v2/post/publish/content/init/
    """
    make   = car_data.get("make", "")
    model  = car_data.get("model", "")
    year   = car_data.get("year", "")
    price  = car_data.get("price_cny") or 0
    mileage    = car_data.get("mileage")
    fuel       = car_data.get("fuel") or car_data.get("fuel_type") or ""
    transmission = car_data.get("transmission") or ""
    engine     = car_data.get("engine") or ""
    condition  = car_data.get("condition", "used").capitalize()
    color      = car_data.get("exterior_color") or ""

    # ── Title (max 150 chars) ──────────────────────────────────────────────
    title = f"{year} {make} {model} | FOB ${price:,.0f} | {condition} | Direct Import"
    title = title[:150]

    # ── Description (hashtags + specs) ────────────────────────────────────
    specs_lines = []
    if mileage is not None:
        specs_lines.append(f"🛣️  Mileage: {mileage:,} km")
    if fuel:
        specs_lines.append(f"⛽  Fuel: {fuel}")
    if transmission:
        specs_lines.append(f"⚙️  Transmission: {transmission}")
    if engine:
        specs_lines.append(f"🔧  Engine: {engine}")
    if color:
        specs_lines.append(f"🎨  Color: {color}")

    # DZD estimate: FOB price at 240 DZD/USD, no overhead for the TikTok post
    dzd_millions = round(price * 240 / 10_000)

    description_parts = [
        f"🚗 {year} {make} {model}",
        f"💵 FOB Price: ${price:,.0f}  (~{dzd_millions} M centimes)",
        "",
        *specs_lines,
        "",
        "📦 Direct export from China",
        "🚢 Shipping available (Wasla)",
        "✅ Professional inspection included",
        "",
        "#CarExport #ImportCar #Algeria #DjermounAuto",
        f"#{make.replace(' ', '')} #{model.replace(' ', '')} #UsedCar",
        "#ChinaCars #CarDeals #AutoImport",
    ]
    description = "\n".join(description_parts)[:2_200]

    photos = clean_image_urls[:MAX_PHOTOS]

    return {
        "post_info": {
            "title":           title,
            "description":     description,
            "privacy_level":   "SELF_ONLY",   # draft — creator publishes from app
            "disable_comment": False,
            "auto_add_music":  True,
        },
        "source_info": {
            "source":            "PULL_FROM_URL",
            "photo_images":      photos,
            "photo_cover_index": 0,
            "media_type":        "PHOTO",
        },
        "post_mode": "MEDIA_UPLOAD",
    }


def publish_car_to_tiktok(car_data: dict, clean_image_urls: list[str], video_url: str | None = None) -> bool:
    """
    Send a car listing photo post to TikTok as an inbox draft.

    Returns True on success, False on any error.
    """
    access_token = os.environ.get("TIKTOK_ACCESS_TOKEN", "").strip()
    if not access_token:
        logger.warning("[TIKTOK] TIKTOK_ACCESS_TOKEN not set — skipping")
        return False

    if not clean_image_urls:
        logger.warning("[TIKTOK] No images available — skipping")
        return False

    payload = generate_tiktok_payload(car_data, clean_image_urls)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type":  "application/json; charset=utf-8",
    }

    logger.info(
        "[TIKTOK] Publishing draft: %s %s %s (%d photos)",
        car_data.get("year"), car_data.get("make"), car_data.get("model"),
        len(payload["source_info"]["photo_images"]),
    )

    try:
        resp = requests.post(
            TIKTOK_API_URL,
            headers=headers,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            timeout=30,
        )

        body = resp.json() if resp.content else {}
        error = body.get("error", {})
        code  = error.get("code", "unknown")
        msg   = error.get("message", "")

        if resp.status_code == 200 and code in ("ok", "success", ""):
            publish_id = body.get("data", {}).get("publish_id", "—")
            logger.info("[TIKTOK] Draft created — publish_id=%s", publish_id)
            return True

        logger.error(
            "[TIKTOK] API error %s: code=%s message=%s | body=%s",
            resp.status_code, code, msg, json.dumps(body)[:500],
        )
        return False

    except requests.RequestException as exc:
        logger.error("[TIKTOK] Request failed: %s", exc)
        return False


# ── Standalone test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    sample_car = {
        "make": "GEELY", "model": "COOLRAY", "year": 2024,
        "price_cny": 9800, "mileage": 32000, "fuel": "Petrol",
        "transmission": "DCT", "engine": "1.5T", "condition": "used",
        "exterior_color": "Pearl White",
    }
    sample_images = [
        "https://via.placeholder.com/800x600.jpg?text=Car+1",
        "https://via.placeholder.com/800x600.jpg?text=Car+2",
    ]

    payload = generate_tiktok_payload(sample_car, sample_images)
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print("\n--- payload validated ---")
    print(f"Title ({len(payload['post_info']['title'])} chars):", payload["post_info"]["title"])
    print(f"Photos: {len(payload['source_info']['photo_images'])}")
