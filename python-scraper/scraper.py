from db import supabase
from duty_calculator import CustomsDutyCalculator

calculator = CustomsDutyCalculator()

DUMMY_CARS = [
    {"make": "CHERY",  "model": "TIGGO 8 PRO", "year": 2025, "price_cny": 145000},
    {"make": "GEELY",  "model": "COOLRAY",      "year": 2024, "price_cny": 98000},
    {"make": "BYD",    "model": "ATTO 3",        "year": 2025, "price_cny": 160000},
    {"make": "HAVAL",  "model": "JOLION",        "year": 2024, "price_cny": 110000},
]


def scrape_cars():
    for car in DUMMY_CARS:
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
                continue

            duty = calculator.get_estimated_duty_dzd(car["make"], car["model"], car["year"])
            payload = {
                "make":             car["make"],
                "model":            car["model"],
                "year":             car["year"],
                "price_cny":        car["price_cny"],
                "customs_duty_dzd": duty,
            }
            res = supabase.table("cars").insert(payload).execute()
            if res.data:
                duty_fmt = f"{duty:,.0f}" if duty is not None else "N/A"
                print(f"[OK] Inserted {car['year']} {car['make']} {car['model']} - Duty: {duty_fmt} DZD")
            else:
                print(f"[ERR] Failed to insert {car['year']} {car['make']} {car['model']}: {res}")
        except Exception as e:
            print(f"[ERR] {car['year']} {car['make']} {car['model']}: {e}")


if __name__ == "__main__":
    scrape_cars()
