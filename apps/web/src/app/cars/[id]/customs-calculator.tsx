"use client";

import { useState } from "react";
import { useExchangeRate } from "@/currency/exchange-rate-context";

type Destination = "algeria" | "uae" | "tunisia";

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: "algeria", label: "Algeria" },
  { value: "uae", label: "UAE" },
  { value: "tunisia", label: "Tunisia" },
];

const DUTY_RATE: Record<Exclude<Destination, "algeria">, number> = {
  uae: 0.05,
  tunisia: 0.1,
};

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

export default function CustomsCalculator({
  basePrice,
  customsDutyDzd = null,
  defaultDestination = "algeria",
}: {
  basePrice: number;
  customsDutyDzd?: number | null;
  defaultDestination?: string;
}) {
  const { rate, setRate } = useExchangeRate();
  const [destination, setDestination] = useState<Destination>(
    (defaultDestination as Destination) ?? "algeria",
  );
  const [shippingInput, setShippingInput] = useState("800");
  const shippingUsd = Math.max(0, Number(shippingInput) || 0);

  const isAlgeria = destination === "algeria";

  // Algeria: all in DZD
  const basePriceDzd = basePrice * rate;
  const dutyDzd =
    customsDutyDzd != null
      ? customsDutyDzd
      : basePriceDzd * 0.15 + (basePriceDzd * 1.15) * 0.19;
  const shippingDzd = shippingUsd * rate;
  const totalDzd = basePriceDzd + dutyDzd + shippingDzd;

  // UAE / Tunisia: USD
  const dutyUsd = isAlgeria ? 0 : basePrice * DUTY_RATE[destination];
  const totalUsd = basePrice + dutyUsd + shippingUsd;

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
          {DESTINATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      {isAlgeria && (
        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">USD → DZD Rate</span>
          <input
            type="number"
            min={1}
            value={rate}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (n > 0) setRate(n);
            }}
            className="w-full max-w-[160px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
          />
        </label>
      )}

      <dl className="mt-5 space-y-3 border-t border-slate-200 pt-4">
        {/* Base price */}
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Base Car Price</dt>
          <dd className="font-medium text-slate-900">{formatUSD(basePrice)}</dd>
        </div>

        {/* Duties */}
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Estimated Customs &amp; Duties</dt>
          <dd className="font-medium text-slate-900">
            {isAlgeria ? formatDZD(dutyDzd) : formatUSD(dutyUsd)}
          </dd>
        </div>

        {/* Shipping — editable */}
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="shrink-0 text-slate-600">Estimated Shipping</dt>
          <dd className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">$</span>
            <input
              type="number"
              min={0}
              value={shippingInput}
              onChange={(e) => setShippingInput(e.target.value)}
              className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-amber-500"
            />
            {isAlgeria && (
              <span className="text-xs text-slate-500">= {formatDZD(shippingDzd)}</span>
            )}
          </dd>
        </div>

        {/* Total */}
        <div className="flex flex-col gap-0.5 border-t border-slate-200 pt-3">
          <div className="flex justify-between text-base">
            <dt className="font-semibold text-slate-900">
              Estimated Total Delivered Price
              <span className="ml-1.5 text-xs font-normal text-slate-400">(without port fees)</span>
            </dt>
            <dd className="font-bold text-amber-500">
              {isAlgeria ? formatDZD(totalDzd) : formatUSD(totalUsd)}
            </dd>
          </div>
        </div>
      </dl>

      <p className="mt-4 text-xs text-slate-500">
        Disclaimer: Rough estimate for informational purposes. Exact customs fees may vary by
        local regulations and engine specifications.
      </p>
    </div>
  );
}
