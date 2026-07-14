"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const DEFAULT_MIN = 150;
const DEFAULT_MAX = 250;

const FUEL_OPTIONS = [
  { label: "All Fuels", value: "" },
  { label: "PHEV",      value: "PHEV" },
  { label: "Essence",   value: "Petrol" },
  { label: "Hybrid",    value: "Hybrid" },
  { label: "EV",        value: "EV" },
  { label: "Diesel",    value: "Diesel" },
];

export default function FilterBar({
  initialMin = DEFAULT_MIN,
  initialMax = DEFAULT_MAX,
  initialWasla = false,
  initialFuel = "",
  currentParams = {},
}: {
  initialMin?: number;
  initialMax?: number;
  initialWasla?: boolean;
  initialFuel?: string;
  currentParams?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [minMc, setMinMc] = useState(initialMin);
  const [maxMc, setMaxMc] = useState(initialMax);
  const [wasla, setWasla] = useState(initialWasla);
  const [fuel, setFuel] = useState(initialFuel);

  function push(min: number, max: number, w: boolean, f: string) {
    const params = new URLSearchParams(currentParams);
    params.set("minMc", String(min));
    params.set("maxMc", String(max));
    if (w) params.set("wasla", "1"); else params.delete("wasla");
    if (f) params.set("fuel", f); else params.delete("fuel");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}#inventory`);
  }

  function apply(min = minMc, max = maxMc, w = wasla, f = fuel) {
    push(min, max, w, f);
  }

  function toggleWasla() {
    const next = !wasla;
    setWasla(next);
    apply(minMc, maxMc, next, fuel);
  }

  function selectFuel(f: string) {
    setFuel(f);
    apply(minMc, maxMc, wasla, f);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") apply();
  }

  const isDefault =
    minMc === DEFAULT_MIN && maxMc === DEFAULT_MAX && !wasla && !fuel;

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]">
      {/* Row 1: Price range + Wasla */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-slate-400">
          Budget
        </span>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <PriceInput
            value={minMc}
            onChange={setMinMc}
            onBlur={() => apply()}
            onKeyDown={handleKey}
            label="Min"
          />

          <div className="flex items-center gap-1">
            <div className="h-px w-4 bg-slate-200" />
            <span className="text-xs text-slate-300">to</span>
            <div className="h-px w-4 bg-slate-200" />
          </div>

          <PriceInput
            value={maxMc}
            onChange={setMaxMc}
            onBlur={() => apply()}
            onKeyDown={handleKey}
            label="Max"
          />

          <span className="text-xs font-semibold text-slate-400">M centimes</span>

          {!isDefault && (
            <button
              type="button"
              onClick={() => {
                setMinMc(DEFAULT_MIN);
                setMaxMc(DEFAULT_MAX);
                setWasla(false);
                setFuel("");
                apply(DEFAULT_MIN, DEFAULT_MAX, false, "");
              }}
              className="text-xs text-amber-500 underline underline-offset-2 hover:text-amber-400"
            >
              Reset
            </button>
          )}
        </div>

        {/* Wasla */}
        <button
          type="button"
          onClick={toggleWasla}
          className={`group flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            wasla
              ? "bg-sky-500 text-white shadow-lg shadow-sky-200/60"
              : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
          }`}
        >
          <span className={`text-base transition-transform duration-300 ${wasla ? "" : "group-hover:-rotate-12"}`}>
            🚢
          </span>
          <span>Wasla</span>
          <span
            className={`overflow-hidden text-xs font-normal transition-all duration-200 ${
              wasla ? "max-w-[120px] opacity-70" : "max-w-0 opacity-0"
            }`}
          >
            · Shipping incl.
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Row 2: Fuel type */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-slate-400">
          Fuel
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FUEL_OPTIONS.map((opt) => {
            const active = fuel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectFuel(opt.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-amber-500 text-black shadow-md shadow-amber-200/60"
                    : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  label: string;
}) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-colors group-focus-within:text-amber-400">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="w-28 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)]"
      />
    </div>
  );
}
