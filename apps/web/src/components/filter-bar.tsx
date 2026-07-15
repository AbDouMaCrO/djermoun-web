"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const PRICE_MIN = 0;
const PRICE_MAX = 500;
const PRICE_STEP = 5;
const PRICE_DEFAULT_MIN = 150;
const PRICE_DEFAULT_MAX = 250;

const MLG_MIN = 0;
const MLG_MAX = 300_000;
const MLG_STEP = 5_000;
const MLG_DEFAULT = 300_000; // no filter

const FUEL_OPTIONS = [
  { label: "All",    value: ""       },
  { label: "PHEV",   value: "PHEV"   },
  { label: "Petrol", value: "Petrol" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "EV",     value: "EV"     },
  { label: "Diesel", value: "Diesel" },
];

// ─── Dual range slider ───────────────────────────────────────────────────────

// pointer-events-none on the track; only the thumb is interactive
const thumbCls = [
  "pointer-events-none",
  "[&::-webkit-slider-thumb]:pointer-events-auto",
  "[&::-webkit-slider-thumb]:appearance-none",
  "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
  "[&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:bg-white",
  "[&::-webkit-slider-thumb]:border-[2.5px] [&::-webkit-slider-thumb]:border-amber-500",
  "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab",
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5",
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white",
  "[&::-moz-range-thumb]:border-[2.5px] [&::-moz-range-thumb]:border-amber-500",
  "[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab",
  "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:border-solid",
].join(" ");

function DualRange({
  min, max, step, lo, hi,
  onLo, onHi,
}: {
  min: number; max: number; step: number;
  lo: number; hi: number;
  onLo: (v: number) => void; onHi: (v: number) => void;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="relative flex h-5 items-center">
      {/* Background track */}
      <div className="pointer-events-none absolute h-1.5 w-full rounded-full bg-slate-200">
        <div
          className="absolute h-1.5 rounded-full bg-amber-400"
          style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
        />
      </div>
      {/* Both inputs span full width; only thumbs are interactive so no z-index conflict */}
      <input
        type="range" min={min} max={max} step={step} value={lo}
        onChange={e => onLo(Math.min(+e.target.value, hi - step))}
        className={`absolute w-full appearance-none bg-transparent ${thumbCls}`}
      />
      <input
        type="range" min={min} max={max} step={step} value={hi}
        onChange={e => onHi(Math.max(+e.target.value, lo + step))}
        className={`absolute w-full appearance-none bg-transparent ${thumbCls}`}
      />
    </div>
  );
}

function SingleRange({
  min, max, step, value, onChange,
}: {
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative flex h-5 items-center">
      <div className="pointer-events-none absolute h-1.5 w-full rounded-full bg-slate-200">
        <div className="absolute h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className={`absolute w-full cursor-pointer appearance-none bg-transparent ${thumbCls}`}
      />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function FilterBar({
  initialMin = PRICE_DEFAULT_MIN,
  initialMax = PRICE_DEFAULT_MAX,
  initialWasla = false,
  initialFuel = "",
  initialMaxMileage = MLG_DEFAULT,
  currentParams = {},
}: {
  initialMin?: number;
  initialMax?: number;
  initialWasla?: boolean;
  initialFuel?: string;
  initialMaxMileage?: number;
  currentParams?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [minMc, setMinMc] = useState(initialMin);
  const [maxMc, setMaxMc] = useState(initialMax);
  const [wasla, setWasla] = useState(initialWasla);
  const [fuel, setFuel] = useState(initialFuel);
  const [maxMileage, setMaxMileage] = useState(initialMaxMileage);

  function push(mn: number, mx: number, w: boolean, f: string, mlg: number) {
    const params = new URLSearchParams(currentParams);
    params.set("minMc", String(mn));
    params.set("maxMc", String(mx));
    if (w) params.set("wasla", "1"); else params.delete("wasla");
    if (f) params.set("fuel", f); else params.delete("fuel");
    if (mlg < MLG_DEFAULT) params.set("maxMileage", String(mlg)); else params.delete("maxMileage");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}#inventory`);
  }

  const isDefault =
    minMc === PRICE_DEFAULT_MIN &&
    maxMc === PRICE_DEFAULT_MAX &&
    !wasla && !fuel &&
    maxMileage === MLG_DEFAULT;

  function reset() {
    setMinMc(PRICE_DEFAULT_MIN);
    setMaxMc(PRICE_DEFAULT_MAX);
    setWasla(false);
    setFuel("");
    setMaxMileage(MLG_DEFAULT);
    push(PRICE_DEFAULT_MIN, PRICE_DEFAULT_MAX, false, "", MLG_DEFAULT);
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]">
      {/* ── Sliders row ─────────────────────────────────── */}
      <div className="grid gap-6 px-6 pt-6 pb-5 sm:grid-cols-2">

        {/* Budget */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Budget</span>
            <span className="text-xs font-semibold text-slate-600">
              {minMc} – {maxMc}
              <span className="ml-1 text-slate-400">M centimes</span>
            </span>
          </div>
          <DualRange
            min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
            lo={minMc} hi={maxMc}
            onLo={v => { setMinMc(v); push(v, maxMc, wasla, fuel, maxMileage); }}
            onHi={v => { setMaxMc(v); push(minMc, v, wasla, fuel, maxMileage); }}
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-300">
            <span>{PRICE_MIN} M</span><span>{PRICE_MAX} M</span>
          </div>
        </div>

        {/* Mileage */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Max Mileage</span>
            <span className="text-xs font-semibold text-slate-600">
              {maxMileage >= MLG_DEFAULT
                ? <span className="text-slate-400">Any</span>
                : <>{(maxMileage / 1000).toFixed(0)}k <span className="text-slate-400">km</span></>
              }
            </span>
          </div>
          <SingleRange
            min={MLG_MIN} max={MLG_MAX} step={MLG_STEP}
            value={maxMileage}
            onChange={v => { setMaxMileage(v); push(minMc, maxMc, wasla, fuel, v); }}
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-300">
            <span>0 km</span><span>300k km</span>
          </div>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div className="h-px bg-slate-100" />

      {/* ── Fuel + Wasla + Reset row ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-slate-400">Fuel</span>

        <div className="flex flex-1 flex-wrap gap-1.5">
          {FUEL_OPTIONS.map(({ label, value }) => {
            const active = fuel === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => { setFuel(value); push(minMc, maxMc, wasla, value, maxMileage); }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-amber-500 text-black shadow-md shadow-amber-200/60"
                    : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-amber-300 hover:text-amber-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Wasla */}
        <button
          type="button"
          onClick={() => { const next = !wasla; setWasla(next); push(minMc, maxMc, next, fuel, maxMileage); }}
          className={`group flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            wasla
              ? "bg-sky-500 text-white shadow-lg shadow-sky-200/60"
              : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
          }`}
        >
          <span className={`text-base transition-transform duration-300 ${wasla ? "" : "group-hover:-rotate-12"}`}>🚢</span>
          <span>Wasla</span>
          <span className={`overflow-hidden text-xs font-normal transition-all duration-200 ${wasla ? "max-w-[120px] opacity-70" : "max-w-0 opacity-0"}`}>
            · Shipping incl.
          </span>
        </button>

        {!isDefault && (
          <button type="button" onClick={reset} className="text-xs text-amber-500 underline underline-offset-2 hover:text-amber-400">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
