"use client";

import { useCountry } from "@/country/country-context";

export default function CarPriceHeading({ totalUSD }: { totalUSD: number }) {
  const { formatPrice } = useCountry();
  return (
    <span className="whitespace-nowrap text-2xl font-bold text-amber-500 shrink-0">
      {formatPrice(totalUSD)}
    </span>
  );
}
