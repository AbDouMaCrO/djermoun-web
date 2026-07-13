"use client";

import { useState } from "react";
import { useExchangeRate } from "@/currency/exchange-rate-context";

const AUTOCANGO_FEES = [
  { label: "Inspection Fee",         amount: 65  },
  { label: "Export Handling Fee",    amount: 450 },
  { label: "Domestic Transport Fee", amount: 330 },
  { label: "Port Local Fee",         amount: 400, note: "Guangzhou, CN" },
  { label: "AutoCango Service Fee",  amount: 300 },
  { label: "Banking Transfer Fee",   amount: 50  },
] as const;

const AUTOCANGO_FEES_TOTAL = AUTOCANGO_FEES.reduce((s, f) => s + f.amount, 0); // 1595

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
  const [feesOpen, setFeesOpen] = useState(false);

  const totalUSD = fobPrice + AUTOCANGO_FEES_TOTAL + commission + shipping;
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
        {/* Vehicle price */}
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Vehicle Price (FOB China)</dt>
          <dd className="font-medium text-slate-900">{formatUSD(fobPrice)}</dd>
        </div>

        {/* AutoCango standard fees — collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setFeesOpen((o) => !o)}
            className="flex w-full items-center justify-between text-sm text-slate-600 hover:text-slate-800"
          >
            <span>
              AutoCango Standard Fees
              <span className="ml-1.5 text-xs text-slate-400">(click to {feesOpen ? "hide" : "show"})</span>
            </span>
            <span className="font-medium text-slate-900">{formatUSD(AUTOCANGO_FEES_TOTAL)}</span>
          </button>

          {feesOpen && (
            <dl className="mt-2 space-y-1.5 rounded-lg bg-slate-50 px-4 py-3">
              {AUTOCANGO_FEES.map((f) => (
                <div key={f.label} className="flex justify-between text-xs text-slate-500">
                  <dt>
                    {f.label}
                    {"note" in f && (
                      <span className="ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {f.note}
                      </span>
                    )}
                  </dt>
                  <dd>{formatUSD(f.amount)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Shipping port notice */}
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          Shipping port: <span className="font-medium text-slate-700">Guangzhou, CN</span>
        </p>

        {commission > 0 && (
          <div className="flex justify-between text-sm">
            <dt className="text-slate-600">DJERMOUN Brokerage Fee</dt>
            <dd className="font-medium text-slate-900">{formatUSD(commission)}</dd>
          </div>
        )}
        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <dt className="text-slate-600">Global Shipping</dt>
            <dd className="font-medium text-slate-900">{formatUSD(shipping)}</dd>
          </div>
        )}

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
