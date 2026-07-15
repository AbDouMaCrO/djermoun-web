"use client";

import { useExchangeRate } from "@/currency/exchange-rate-context";
import { useCountry } from "@/country/country-context";
import { AUTOCANGO_FEES_TOTAL } from "@/lib/fees";


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
          <dd className="font-medium text-slate-900">{fmt(fobPrice + AUTOCANGO_FEES_TOTAL)}</dd>
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

      {country === "algeria" && (
        <p className="mt-3 text-right text-xs text-slate-400">Taux : 1 USD = {rate} DZD</p>
      )}
    </div>
  );
}
