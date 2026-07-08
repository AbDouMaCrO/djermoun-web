import os
import sys

import pandas as pd

_DEFAULT_CSV = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "Argus car prices - Valeurs de référence.csv",
)


class CustomsDutyCalculator:
    def __init__(self, csv_path=_DEFAULT_CSV, usd_to_dzd_rate=134):
        if not os.path.exists(csv_path):
            sys.exit(f"Error: Argus CSV not found at {csv_path}")
        try:
            self.df = pd.read_csv(csv_path)
        except Exception as e:
            sys.exit(f"Error reading Argus CSV: {e}")
        self.df['Marque_clean'] = self.df['Marque'].str.upper().str.strip()
        self.df['modele_clean'] = self.df['modele'].str.upper().str.strip()
        self.european_brands = {'VOLKSWAGEN', 'SKODA', 'AUDI', 'PORCHE'}
        self.usd_to_dzd_rate = usd_to_dzd_rate

    def get_estimated_duty_dzd(self, brand, model, year):
        try:
            b = str(brand).upper().strip()
            m = str(model).upper().strip()

            if b in self.european_brands:
                return 0

            brand_rows = self.df[self.df['Marque_clean'] == b]
            if brand_rows.empty:
                return None

            model_rows = brand_rows[brand_rows['modele_clean'].apply(
                lambda x: x in m or m in x
            )]
            if model_rows.empty:
                model_rows = brand_rows  # ponytail: fallback to brand average

            year_cols = {
                2026: 'car year = 2026 ',
                2025: 'car year = 2025',
                2024: 'car year = 2024',
                2023: 'car year = 2023',
            }
            col = year_cols.get(int(year))
            if not col or col not in model_rows.columns:
                return None

            ref_usd = model_rows[col].mean()
            return round(ref_usd * 0.20 * self.usd_to_dzd_rate, 2)
        except Exception as e:
            print(f"[WARN] Duty calc error for {brand} {model} {year}: {e}")
            return None


if __name__ == "__main__":
    calc = CustomsDutyCalculator()
    assert calc.get_estimated_duty_dzd("VOLKSWAGEN", "GOLF", 2024) == 0
    print("VW (EUR.1):", 0, "DZD ✓")
    result = calc.get_estimated_duty_dzd("CHERY", "TIGGO 8 PRO", 2025)
    print("CHERY TIGGO 8 PRO 2025:", result, "DZD")
