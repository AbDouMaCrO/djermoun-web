"use client";

import { useState } from "react";

type Destination = "algeria" | "other";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function estimate(basePrice: number, destination: Destination) {
  if (destination === "algeria") {
    const customsDuty = basePrice * 0.15;
    const vat = (basePrice + customsDuty) * 0.19;
    const shipping = 800;
    return { dutiesAndTax: customsDuty + vat, shipping, total: basePrice + customsDuty + vat + shipping };
  }
  const dutiesAndTax = basePrice * 0.2;
  const shipping = 1200;
  return { dutiesAndTax, shipping, total: basePrice + dutiesAndTax + shipping };
}

export default function CustomsCalculator({ basePrice }: { basePrice: number }) {
  const [destination, setDestination] = useState<Destination>("algeria");
  const { dutiesAndTax, shipping, total } = estimate(basePrice, destination);

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
        Estimated Customs &amp; Duties Calculator
      </h2>

      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Destination Country</span>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value as Destination)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
        >
          <option value="algeria">Algeria</option>
          <option value="other">Other / General International</option>
        </select>
      </label>

      <dl className="mt-5 space-y-3 border-t border-slate-200 pt-4">
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Base Car Price</dt>
          <dd className="font-medium text-slate-900">{formatUSD(basePrice)}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Estimated Customs &amp; Duties</dt>
          <dd className="font-medium text-slate-900">{formatUSD(dutiesAndTax)}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Estimated Shipping &amp; Port Fees</dt>
          <dd className="font-medium text-slate-900">{formatUSD(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
          <dt className="font-semibold text-slate-900">Estimated Total Delivered Price</dt>
          <dd className="font-bold text-amber-500">{formatUSD(total)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-slate-500">
        Disclaimer: This is a rough estimate for informational purposes. Exact customs clearing
        fees may vary depending on local regulations and engine specifications.
      </p>
    </div>
  );
}
