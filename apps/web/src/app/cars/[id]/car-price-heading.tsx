"use client";

import { useCountry } from "@/country/country-context";

export default function CarPriceHeading({ totalUSD }: { totalUSD: number }) {
  const { formatPrice } = useCountry();
  return (
    <p className="mt-2 text-2xl font-bold text-amber-500">
      {formatPrice(totalUSD)}
    </p>
  );
}
