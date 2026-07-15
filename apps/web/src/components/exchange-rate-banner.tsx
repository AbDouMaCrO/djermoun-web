"use client";

import { Landmark } from "lucide-react";
import { useExchangeRate } from "@/currency/exchange-rate-context";
import { useCountry, AED_PER_USD, COUNTRY_CONFIG } from "@/country/country-context";

export default function ExchangeRateBanner() {
  const { rate } = useExchangeRate();
  const { country } = useCountry();

  const cfg = COUNTRY_CONFIG[country];

  let rateText: string;
  if (country === "international") {
    rateText = "Prices shown in USD (FOB China)";
  } else if (country === "uae") {
    rateText = `1 USD = ${AED_PER_USD} AED`;
  } else {
    rateText = `1 USD = ${rate} DZD`;
  }

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-2 text-center text-xs text-slate-700 sm:text-sm">
      <span className="inline-flex items-center gap-2">
        <Landmark size={14} className="shrink-0 text-amber-500" />
        <span>{cfg.flag} {cfg.label}</span>
        <span className="text-slate-300">|</span>
        <span>{rateText}</span>
      </span>
    </div>
  );
}
