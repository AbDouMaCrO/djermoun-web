"""Backfill customs_duty_dzd for all cars in DB where it is NULL."""
import os
from dotenv import load_dotenv
load_dotenv()

from db import supabase
from duty_calculator import CustomsDutyCalculator

calc = CustomsDutyCalculator()

res = supabase.table("cars").select("id,make,model,year").is_("customs_duty_dzd", "null").execute()
cars = res.data or []
print(f"[BACKFILL] {len(cars)} cars missing duty")

updated = skipped = 0
for car in cars:
    duty = calc.get_estimated_duty_dzd(car["make"], car["model"], car["year"])
    if duty is None:
        print(f"[SKIP] {car['year']} {car['make']} {car['model']} — not in CSV")
        skipped += 1
        continue
    supabase.table("cars").update({"customs_duty_dzd": duty}).eq("id", car["id"]).execute()
    print(f"[OK] {car['year']} {car['make']} {car['model']} → {duty:,.0f} DZD (~{int(duty/10_000)} M centimes)")
    updated += 1

print(f"\n[DONE] updated={updated} skipped={skipped}")
