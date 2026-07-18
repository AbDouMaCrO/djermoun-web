"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Gauge, Fuel, Cog } from "lucide-react";
import { useCountry } from "@/country/country-context";
import { AUTOCANGO_FEES_TOTAL } from "@/lib/fees";

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
  paint_condition: string | null;
  transmission: string | null;
  engine: string | null;
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

  const totalUSD =
    car.price_cny != null
      ? car.price_cny + AUTOCANGO_FEES_TOTAL + (car.commission ?? 0) + (Number(car.shipping_cost) || 1900)
      : null;

  const detailHref = `/cars/${car.id}`;
  const carPageUrl = typeof window !== "undefined"
    ? `${window.location.origin}${detailHref}`
    : detailHref;

  const priceLabel =
    country === "international"
      ? "All-in USD estimate"
      : country === "uae"
      ? "All-in estimate incl. shipping"
      : "Estimation totale incl. transport";

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/5 bg-[#111827] transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5">
      {/* Clickable image + info */}
      <Link href={detailHref} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0A0F1E]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={car.primary_image ?? "/placeholder-car.svg"}
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111827] to-transparent" />
          {/* Top badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                car.condition === "new"
                  ? "bg-amber-500/90 text-black"
                  : "bg-white/10 backdrop-blur-sm text-white"
              }`}
            >
              {car.condition === "new" ? "New" : "Used"}
            </span>
            {isNew && (
              <span className="rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-amber-300">
                Recent
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <h3 className="text-white font-bold text-base text-center">
            {car.year} {car.make} {car.model}{car.engine ? ` — ${car.engine}` : ""}
          </h3>

          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-slate-500" />
              {car.year}
            </span>
            <span className="flex items-center gap-1">
              <Gauge size={13} className="text-slate-500" />
              {car.mileage != null ? `${car.mileage.toLocaleString()} km` : "—"}
            </span>
            <span className="flex items-center gap-1">
              <Fuel size={13} className="text-slate-500" />
              {car.fuel ?? "—"}
            </span>
            {car.transmission && (
              <span className="flex items-center gap-1">
                <Cog size={13} className="text-slate-500" />
                {car.transmission}
              </span>
            )}
            {car.paint_condition && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-black ${
                car.paint_condition === "original_paint"
                  ? "bg-green-400/80"
                  : "bg-orange-400/80"
              }`}>
                {car.paint_condition === "original_paint" ? "Original Paint" : "Minor Accident"}
              </span>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-2xl font-black text-amber-400">{formatPrice(totalUSD)}</p>
            <p className="text-xs text-slate-500">{priceLabel}</p>
          </div>
        </div>
      </Link>

      {/* Action buttons — outside the Link to avoid nested <a> */}
      <div className="flex gap-2 px-5 pb-5 pt-2">
        <Link
          href={detailHref}
          className="press-scale flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-center text-sm font-bold text-black transition-colors duration-150"
        >
          View Details
        </Link>
        {WA_NUMBER && (
          <a
            href={waLink(car, carPageUrl)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ask about this car on WhatsApp"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-green-500/10 hover:border-green-500/30 px-3 py-2.5 text-sm font-semibold text-green-400 transition-colors"
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
