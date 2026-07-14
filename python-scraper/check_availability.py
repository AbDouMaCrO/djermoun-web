"""
Check if AutoCango listings are still available.
Runs every 30 min via GitHub Actions.
Marks sold cars in Supabase and sends Gmail alert.
"""

import os
import re
import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from bs4 import BeautifulSoup
from curl_cffi import requests as cf_requests
from dotenv import load_dotenv

from db import supabase

load_dotenv()

GMAIL_USER = os.environ.get("GMAIL_USER", "abdoumacro1@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
NOTIFY_EMAIL = "abdoumacro1@gmail.com"

SESSION = cf_requests.Session(impersonate="chrome131")


def is_still_available(url: str) -> bool | None:
    """
    Returns True if listing is live, False if sold/removed, None on network error.
    """
    try:
        r = SESSION.get(url, timeout=30, allow_redirects=True)

        # 404 or redirected away from listing = gone
        if r.status_code == 404:
            return False

        # If redirected to root / search, listing was removed
        final = str(r.url).rstrip("/")
        if final in ("https://www.autocango.com", "https://www.autocango.com/usedcar"):
            return False

        html = r.text
        lower = html.lower()

        # Explicit sold signals
        sold_phrases = [
            "this vehicle has been sold",
            "vehicle sold",
            "listing is no longer available",
            "car has been sold",
        ]
        if any(p in lower for p in sold_phrases):
            return False

        # No USD price = almost certainly sold
        if not re.search(r"\$[\d,]+", html):
            return False

        return True

    except Exception as exc:
        print(f"  Network error for {url}: {exc}")
        return None  # skip, don't mark sold on error


def send_email(sold_cars: list[dict]) -> None:
    if not GMAIL_APP_PASSWORD:
        print("GMAIL_APP_PASSWORD not set — skipping email.")
        return

    count = len(sold_cars)
    subject = f"[Djermoun Auto] {count} car{'s' if count != 1 else ''} marked SOLD"

    rows = "\n".join(
        f"  • {c['make']} {c['model']} {c['year']} | {c.get('source_url', '')}"
        for c in sold_cars
    )
    body = f"""
{count} listing{'s' if count != 1 else ''} on AutoCango no longer available and marked SOLD in your database:

{rows}

Review at: https://djermoun-web.vercel.app/admin/inventory
"""

    msg = MIMEMultipart()
    msg["From"] = GMAIL_USER
    msg["To"] = NOTIFY_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(body.strip(), "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.ehlo()
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, NOTIFY_EMAIL, msg.as_string())

    print(f"Alert email sent → {NOTIFY_EMAIL}")


def main() -> None:
    # Fetch all available cars that have a source_url
    res = (
        supabase.table("cars")
        .select("id, make, model, year, source_url")
        .eq("status", "available")
        .not_.is_("source_url", "null")
        .execute()
    )
    cars = res.data or []
    print(f"Checking {len(cars)} available listings...")

    sold: list[dict] = []
    errors = 0

    for i, car in enumerate(cars, 1):
        url = car["source_url"]
        label = f"{car['make']} {car['model']} {car['year']}"
        print(f"  [{i}/{len(cars)}] {label}")

        available = is_still_available(url)

        if available is False:
            print(f"    → SOLD — marking in DB")
            supabase.table("cars").update({"status": "sold"}).eq("id", car["id"]).execute()
            sold.append(car)
        elif available is None:
            errors += 1

        # Polite delay — avoid hammering autocango
        time.sleep(1.5)

    print(f"\nDone. Sold: {len(sold)} | Errors/skipped: {errors} | Still available: {len(cars) - len(sold) - errors}")

    if sold:
        send_email(sold)


if __name__ == "__main__":
    main()
