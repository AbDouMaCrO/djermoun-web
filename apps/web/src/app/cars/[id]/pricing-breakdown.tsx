"use client";

import { useState } from "react";
import { useExchangeRate } from "@/currency/exchange-rate-context";
import { useCountry, AED_PER_USD } from "@/country/country-context";

const AUTOCANGO_FEES = [
  { label: "Inspection Fee",         amount: 65  },
  { label: "Export Handling Fee",    amount: 450 },
  { label: "Domestic Transport Fee", amount: 330 },
  { label: "Port Local Fee",         amount: 400, note: "Guangzhou, CN" },
  { label: "Service Fee",            amount: 400 },
  { label: "Banking Transfer Fee",   amount: 50  },
] as const;

const AUTOCANGO_FEES_TOTAL = AUTOCANGO_FEES.reduce((s, f) => s + f.amount, 0);

function fmtUSD(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(n);
}

function fmtAED(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency", currency: "AED", maximumFractionDigits: 0,
  }).format(Math.round(n));
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
  const { rate } = useExchangeRate();
  const { country, formatPrice } = useCountry();
  const [feesOpen, setFeesOpen] = useState(false);

  const totalUSD = fobPrice + AUTOCANGO_FEES_TOTAL + commission + shipping;

  // Single source of truth: formatPrice is the exact same function used on the card and title.
  // For Algeria it returns "~X M centimes"; for UAE "AED X"; for international "$X".
  const fmt = (usd: number) => formatPrice(usd);

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
        Transparent Pricing
      </h2>
      <dl className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Vehicle Price (FOB China)</dt>
          <dd className="font-medium text-slate-900">{fmt(fobPrice)}</dd>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setFeesOpen((o) => !o)}
            className="flex w-full items-center justify-between text-sm text-slate-600 hover:text-slate-800"
          >
            <span>
              Standard Fees
              <span className="ml-1.5 text-xs text-slate-400">(click to {feesOpen ? "hide" : "show"})</span>
            </span>
            <span className="font-medium text-slate-900">{fmt(AUTOCANGO_FEES_TOTAL)}</span>
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
                  <dd>{fmt(f.amount)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          Shipping port: <span className="font-medium text-slate-700">Guangzhou, CN</span>
        </p>

        {commission > 0 && (
          <div className="flex justify-between text-sm">
            <dt className="text-slate-600">DJERMOUN Brokerage Fee</dt>
            <dd className="font-medium text-slate-900">{fmt(commission)}</dd>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <dt className="text-slate-600">Global Shipping</dt>
          <dd className="font-medium text-slate-900">{fmt(shipping)}</dd>
        </div>

        <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
          <dt className="font-semibold text-slate-900">Total Price</dt>
          <dd className="font-bold text-amber-500">{fmt(totalUSD)}</dd>
        </div>
      </dl>

      {/* Summary box — same value as Total Price line above, just highlighted */}
      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          {country === "algeria" && (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500">Total en Centimes</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(totalUSD)}</p>
              <p className="mt-0.5 text-xs text-slate-500">Taux utilisé : 1 USD = {rate} DZD</p>
            </>
          )}
          {country === "uae" && (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500">Total in AED</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmtAED(totalUSD * AED_PER_USD)}</p>
              <p className="mt-0.5 text-xs text-slate-500">1 USD = {AED_PER_USD} AED (fixed peg)</p>
            </>
          )}
          {country === "international" && (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500">Total in USD</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmtUSD(totalUSD)}</p>
              <p className="mt-0.5 text-xs text-slate-500">FOB price — shipping to your port</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
