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
      className={`rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm font-medium text-slate-300 cursor-pointer [&>option]:bg-[#0A0F1E] ${className ?? ""}`}
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
