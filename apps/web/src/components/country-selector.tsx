"use client";

import { useCountry, COUNTRY_CONFIG, type Country } from "@/country/country-context";

export default function CountrySelector({ className }: { className?: string }) {
  const { country, setCountry, enabledCountries } = useCountry();

  if (enabledCountries.length <= 1) return null;

  return (
    <select
      value={country}
      onChange={(e) => setCountry(e.target.value as Country)}
      aria-label="Country / Currency"
      className={`rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium text-slate-900 cursor-pointer ${className ?? ""}`}
    >
      {enabledCountries.map((key) => {
        const cfg = COUNTRY_CONFIG[key];
        return (
          <option key={key} value={key}>
            {cfg.flag} {cfg.label} ({cfg.currency})
          </option>
        );
      })}
    </select>
  );
}
