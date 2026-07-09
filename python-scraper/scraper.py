from db import supabase
from duty_calculator import CustomsDutyCalculator
import os
import sys

# 1. Initialize the Customs Calculator
calculator = CustomsDutyCalculator()

# 2. Keep your fallback dummy cars for the standard automated daily sweep
DUMMY_CARS = [
    {"make": "CHERY",  "model": "TIGGO 8 PRO", "year": 2025, "price_cny": 145000},
    {"make": "GEELY",  "model": "COOLRAY",      "year": 2024, "price_cny": 98000},
    {"make": "BYD",    "model": "ATTO 3",        "year": 2025, "price_cny": 160000},
    {"make": "HAVAL",  "model": "JOLION",        "year": 2024, "price_cny": 110000},
]

def parse_url_to_car_data(url):
    """
    TODO: Replace this dummy parsing logic with your real BeautifulSoup/Requests code.
    Right now, it detects the URL and sets up a new live car payload based on it.
    """
    print(f"Parsing listing URL data from source: {url}")
    
    # Simple example logic checking the text for testing
    if "byd" in url.lower():
        return {"make": "BYD", "model": "SEAL", "year": 2025, "price_cny": 185000}
    elif "geely" in url.lower():
        return {"make": "GEELY", "model": "MONJARO", "year": 2025, "price_cny": 175000}
    else:
        # Default fallback so you can see it working immediately with any test link
        return {"make": "NEW_ARRIVALS", "model": "ON_DEMAND", "year": 2026, "price_cny": 120000}



def insert_car_record(car):
    """Handles checking duplicates and writing down complete rows to Supabase."""
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
        
        # WE ADD STABLE FRONTEND FILTER FALLBACKS HERE
        payload = {
            "make":             car["make"],
            "model":            car["model"],
            "year":             car["year"],
            "price_cny":        car["price_cny"],
            "customs_duty_dzd": duty,
            "status":           "available",             # Matches frontend .eq("status", "available") filter
            "is_visible":       True,                   # Passes visibility flags
            "image_url":        "https://placehold.co/600x400?text=Car+Image", # Prevents missing image filtering
            "images":           ["https://placehold.co/600x400?text=Car+Image"] # Supports array fields if needed
        }
        
        res = supabase.table("cars").insert(payload).execute()
        if res.data:
            duty_fmt = f"{duty:,.0f}" if duty is not None else "N/A"
            print(f"[OK] Inserted {car['year']} {car['make']} {car['model']} - Duty: {duty_fmt} DZD")
        else:
            print(f"[ERR] Failed to insert {car['year']} {car['make']} {car['model']}: {res}")
    except Exception as e:
        print(f"[ERR] Processing entry {car.get('make')} failed: {e}")


def main():
    # Check if GitHub Actions passed a specific target URL parameter from Appsmith
    target_url = os.environ.get("TARGET_URL")

    if target_url and target_url.strip() != "":
        print(f"Target URL detected from Appsmith CRM: {target_url}")
        # Parse the live metadata from that single custom URL
        scraped_car = parse_url_to_car_data(target_url)
        # Drop the live car record straight into Supabase
        insert_car_record(scraped_car)
    else:
        print("No TARGET_URL environment variable found. Running default bulk sweep...")
        # Loop through your default background inventory list
        for car in DUMMY_CARS:
            insert_car_record(car)


if __name__ == "__main__":
    main()