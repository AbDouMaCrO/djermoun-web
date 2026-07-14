"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Gauge, Fuel } from "lucide-react";
import { useExchangeRate } from "@/currency/exchange-rate-context";

export type CarCardData = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number | null;
  fuel: string | null;
  price_cny: number | null;
  commission: number | null;
  shipping_cost: number | null;
  primary_image: string | null;
  created_at: string;
  condition: string;
};

function formatUSD(price: number | null) {
  if (price == null) return "Price on request";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDZD(price: number) {
  return `${Math.round(price).toLocaleString()} DZD`;
}

function totalPrice(car: CarCardData): number | null {
  return car.price_cny;
}

const NEW_LISTING_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export default function CarCard({ car }: { car: CarCardData }) {
  const { rate } = useExchangeRate();
  const [now] = useState(() => Date.now());
  const isNew = now - new Date(car.created_at).getTime() < NEW_LISTING_WINDOW_MS;
  const total = totalPrice(car);

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-transform duration-200 ease-[var(--ease-out-strong)] hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={car.primary_image ?? "/placeholder-car.svg"}
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold text-black ${
              car.condition === "new" ? "bg-sky-400/90" : "bg-emerald-500/90"
            }`}
          >
            {car.condition === "new" ? "New" : "Used"}
          </span>
          {isNew && (
            <span className="rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-black">
              Recent
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-slate-900">
          {car.year} {car.make} {car.model}
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-500" />
            {car.year}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge size={14} className="text-slate-500" />
            {car.mileage != null ? `${car.mileage.toLocaleString()} km` : "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel size={14} className="text-slate-500" />
            {car.fuel ?? "—"}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-slate-900">{formatUSD(total)}</p>
            {total != null && (
              <p className="text-xs text-slate-500">
                ~{Math.floor((total * rate) / 10_000)} M centimes
              </p>
            )}
          </div>
          <span className="press-scale rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-colors duration-150 group-hover:bg-amber-400">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
