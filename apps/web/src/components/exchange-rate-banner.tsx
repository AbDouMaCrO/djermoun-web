"use client";

import { Landmark } from "lucide-react";
import { useExchangeRate } from "@/currency/exchange-rate-context";

export default function ExchangeRateBanner() {
  const { rate } = useExchangeRate();

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-2 text-center text-xs text-slate-700 sm:text-sm">
      <span className="inline-flex items-center gap-2">
        <Landmark size={14} className="shrink-0 text-amber-500" />
        Base Currency: USD | Estimated Exchange Rate: 1 USD = {rate} DZD (Adjustable at
        checkout).
      </span>
    </div>
  );
}
