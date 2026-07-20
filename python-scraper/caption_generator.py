"""
Generates AI marketing captions for a car listing using Claude.
Produces 9 captions: 3 platforms (tiktok, instagram, facebook) x 3 languages (en, fr, ar).
Stores results in the car_captions Supabase table.
Requires: ANTHROPIC_API_KEY env var.
"""

import json
import os

import anthropic


PLATFORMS = ["tiktok", "instagram", "facebook"]
LANGUAGES = ["en", "fr", "ar"]


def _build_prompt(car: dict) -> str:
    make         = car.get("make", "")
    model        = car.get("model", "")
    year         = car.get("year", "")
    price        = car.get("price_cny", 0)
    mileage      = car.get("mileage")
    engine       = car.get("engine", "")
    transmission = car.get("transmission", "")
    fuel         = car.get("fuel", "")
    color        = car.get("exterior_color", "")

    specs_parts = [p for p in [engine, transmission, fuel, color, f"{mileage:,} km" if mileage else ""] if p]
    specs       = " | ".join(specs_parts)
    price_str   = f"${float(price):,.0f} FOB" if price else "price on request"

    return f"""You are a marketing copywriter for Djermoun Auto — a company that exports quality used cars from China to Algeria, UAE, and internationally.

Car details:
- Vehicle: {year} {make} {model}
- Specs: {specs}
- Price: {price_str}
- Website: djermoun-auto.com
- WhatsApp: available on site

Generate 9 marketing captions: 3 platforms × 3 languages.

Platform requirements:
- tiktok: Max 150 chars. Punchy hook first line. 1-2 emojis. 3-5 hashtags. Drive curiosity.
- instagram: 150-300 chars. Aspirational/lifestyle tone. 10-15 hashtags including Arabic ones for AR caption.
- facebook: 250-450 chars. Informative. Mention price and key specs. WhatsApp CTA. 3-5 hashtags.

Language requirements:
- en: English
- fr: French (North African market — Algeria, Morocco, Tunisia)
- ar: Algerian Darija in Arabic script — casual, relatable tone, not formal MSA

Return ONLY valid JSON, no markdown, no extra text:
{{
  "tiktok":     {{"en": "...", "fr": "...", "ar": "..."}},
  "instagram":  {{"en": "...", "fr": "...", "ar": "..."}},
  "facebook":   {{"en": "...", "fr": "...", "ar": "..."}}
}}"""


def generate_captions(car: dict) -> dict | None:
    """
    Call Claude to generate captions. Returns parsed dict or None on failure.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[CAPTIONS] ANTHROPIC_API_KEY not set — skipping")
        return None

    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            messages=[{"role": "user", "content": _build_prompt(car)}],
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if model wraps output
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        print(f"[CAPTIONS] Generation failed: {e}")
        return None


def store_captions(car_id: str, captions: dict) -> None:
    """Insert 9 caption rows into car_captions, upsert on conflict."""
    from db import supabase

    rows = [
        {
            "car_id":   car_id,
            "platform": platform,
            "language": lang,
            "caption":  captions[platform][lang],
        }
        for platform in PLATFORMS
        for lang in LANGUAGES
        if captions.get(platform, {}).get(lang)
    ]
    if not rows:
        print("[CAPTIONS] Nothing to store")
        return

    try:
        supabase.table("car_captions").upsert(rows, on_conflict="car_id,platform,language").execute()
        print(f"[CAPTIONS] Stored {len(rows)} captions for car {car_id}")
    except Exception as e:
        print(f"[CAPTIONS] Store failed: {e}")


def generate_and_store(car_id: str, car: dict) -> None:
    """Full pipeline: generate + store. Safe to call — skips on missing API key."""
    captions = generate_captions(car)
    if captions:
        store_captions(car_id, captions)
