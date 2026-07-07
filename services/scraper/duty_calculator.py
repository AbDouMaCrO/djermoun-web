import os

import pandas as pd

_DEFAULT_CSV = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "Argus car prices - Valeurs de référence.csv",
)


class CustomsDutyCalculator:
    def __init__(self, csv_path=_DEFAULT_CSV, usd_to_dzd_rate=134):
        # Load the CSV table into memory
        self.df = pd.read_csv(csv_path)

        # Clean the text columns for easier matching
        self.df['Marque_clean'] = self.df['Marque'].str.upper().str.strip()
        self.df['modele_clean'] = self.df['modele'].str.upper().str.strip()

        # Exclude European manufacturers (Subject to EUR.1 exemption / 0% customs duty)
        self.european_brands = ['VOLKSWAGEN', 'SKODA', 'AUDI', 'PORCHE']

        self.usd_to_dzd_rate = usd_to_dzd_rate

    def get_estimated_duty_dzd(self, brand, model, year):
        b_clean = str(brand).upper().strip()
        m_clean = str(model).upper().strip()
        
        # 1. Rule Check: Exclude Europe as original manufacture
        if b_clean in self.european_brands:
            return 0  # 0 DZD Customs duty for European vehicles
            
        # 2. Find the matching brand in the CSV (e.g. Chery, Geely, Kia)
        brand_match = self.df[self.df['Marque_clean'] == b_clean]
        if brand_match.empty:
            return None # If brand isn't in CSV, skip or handle manually
            
        # 3. Find the matching model (Flexible match in case scraped name has extra words)
        model_match = brand_match[brand_match['modele_clean'].apply(lambda x: x in m_clean or m_clean in x)]
        
        if model_match.empty:
            # Fallback: If exact model is missing, take the average of the brand
            model_match = brand_match
            
        # 4. Map the scraped year to the correct CSV column
        year_cols = {
            2026: 'car year = 2026 ',
            2025: 'car year = 2025',
            2024: 'car year = 2024',
            2023: 'car year = 2023'
        }
        
        col_name = year_cols.get(int(year))
        if not col_name or col_name not in model_match.columns:
            return None # Year not supported in Argus table
            
        # 5. Extract the base reference value in USD
        # (We use .mean() in case there are multiple trims/engines for the same model)
        ref_value_usd = model_match[col_name].mean()
        
        # 6. Calculate 20% Duty and convert to DZD
        duty_usd = ref_value_usd * 0.20
        duty_dzd = duty_usd * self.usd_to_dzd_rate
        
        return round(duty_dzd, 2)

# --- QUICK TEST ---
# if __name__ == "__main__":
#     calc = CustomsDutyCalculator()
#     print("VW GOLF 2024 Duty:", calc.get_estimated_duty_dzd("VOLKSWAGEN", "GOLF", 2024), "DZD")
#     print("CHERY TIGGO 8 2025 Duty:", calc.get_estimated_duty_dzd("CHERY", "TIGGO 8 PRO", 2025), "DZD")