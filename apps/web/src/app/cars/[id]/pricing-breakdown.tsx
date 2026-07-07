"use client";

import { useState } from "react";
import { useExchangeRate } from "@/currency/exchange-rate-context";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDZD(n: number) {
  return `${Math.round(n).toLocaleString()} DZD`;
}

export default function PricingBreakdown({
  fobPrice,
  commission,
  shipping,
}: {
  fobPrice: number;
  commission: number;
  shipping: number;
}) {
  const { rate, setRate } = useExchangeRate();
  const [rateInput, setRateInput] = useState(String(rate));

  const totalUSD = fobPrice + commission + shipping;
  const parsedRate = Number(rateInput);
  const effectiveRate = Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : rate;
  const totalDZD = totalUSD * effectiveRate;

  function onRateChange(value: string) {
    setRateInput(value);
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) setRate(n);
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
        Transparent Pricing
      </h2>
      <dl className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Vehicle FOB Price (China)</dt>
          <dd className="font-medium text-slate-900">{formatUSD(fobPrice)}</dd>
        </div>
        <div className="text-xs text-slate-600">Includes: Vehicle Cost, Export Handling, Domestic Transport, Port &amp; Inspection Fees</div>

        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">DJERMOUN Brokerage Fee</dt>
          <dd className="font-medium text-slate-900">{formatUSD(commission)}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Global Shipping</dt>
          <dd className="font-medium text-slate-900">{formatUSD(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
          <dt className="font-semibold text-slate-900">Total Price</dt>
          <dd className="font-bold text-amber-500">{formatUSD(totalUSD)}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Your USD to DZD Exchange Rate
          </span>
          <input
            type="number"
            min={1}
            value={rateInput}
            onChange={(e) => onRateChange(e.target.value)}
            className="w-full max-w-[160px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
          />
        </label>

        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-500">
            Total in DZD
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">~ {formatDZD(totalDZD)}</p>
        </div>
      </div>
    </div>
  );
}
