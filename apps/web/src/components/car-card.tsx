"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Gauge, Fuel } from "lucide-react";
import { useCountry } from "@/country/country-context";

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

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

function waLink(car: CarCardData, pageUrl: string) {
  const msg = `Hi, I'm interested in the ${car.year} ${car.make} ${car.model} listed on your website.\n${pageUrl}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const NEW_LISTING_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export default function CarCard({ car }: { car: CarCardData }) {
  const { formatPrice, country } = useCountry();
  const [now] = useState(() => Date.now());
  const isNew = now - new Date(car.created_at).getTime() < NEW_LISTING_WINDOW_MS;
  const total = car.price_cny;
  const detailHref = `/cars/${car.id}`;
  const carPageUrl = typeof window !== "undefined"
    ? `${window.location.origin}${detailHref}`
    : detailHref;

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-md">
      {/* Clickable image + info */}
      <Link href={detailHref} className="block">
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

        <div className="px-5 pt-5">
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

          <div className="mt-4">
            <p className="text-xl font-bold text-slate-900">{formatPrice(total)}</p>
            {total != null && country !== "international" && (
              <p className="text-xs text-slate-500">
                {country === "uae"
                  ? `≈ $${total.toLocaleString()} USD`
                  : `≈ $${total.toLocaleString()} USD`}
              </p>
            )}
            {total != null && country === "international" && (
              <p className="text-xs text-slate-500">FOB price</p>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons — outside the Link to avoid nested <a> */}
      <div className="flex gap-2 px-5 pb-5 pt-3">
        <Link
          href={detailHref}
          className="press-scale flex-1 rounded-md bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black transition-colors duration-150 hover:bg-amber-400"
        >
          View Details
        </Link>
        {WA_NUMBER && (
          <a
            href={waLink(car, carPageUrl)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ask about this car on WhatsApp"
            className="flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Ask
          </a>
        )}
      </div>
    </div>
  );
}
