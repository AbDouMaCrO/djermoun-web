"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useCountry } from "@/country/country-context";

const MC_MIN = 0;
const MC_MAX = 2000;
const MC_DEFAULT_MIN = 0;
const MC_DEFAULT_MAX = 2000;

const MLG_MIN = 0;
const MLG_MAX = 300_000;
const MLG_STEP = 5_000;
const MLG_DEFAULT = 300_000;

const FUEL_OPTIONS = [
  { label: "All",    value: ""       },
  { label: "PHEV",   value: "PHEV"   },
  { label: "Petrol", value: "Petrol" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "EV",     value: "EV"     },
  { label: "Diesel", value: "Diesel" },
];

// ─── Dual range slider ───────────────────────────────────────────────────────

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
      <div className="pointer-events-none absolute h-1.5 w-full rounded-full bg-slate-200">
        <div
          className="absolute h-1.5 rounded-full bg-amber-400"
          style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
        />
      </div>
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
  initialMin = MC_DEFAULT_MIN,
  initialMax = MC_DEFAULT_MAX,
  initialFuel = "",
  initialMaxMileage = MLG_DEFAULT,
  currentParams = {},
}: {
  initialMin?: number;
  initialMax?: number;
  initialFuel?: string;
  initialMaxMileage?: number;
  currentParams?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { mcToDisplay, displayToMc, filterBounds, filterUnit } = useCountry();

  // Internal state in M centimes (URL format), display shows converted values
  const [minMc, setMinMc] = useState(initialMin);
  const [maxMc, setMaxMc] = useState(initialMax);
  const [fuel, setFuel] = useState(initialFuel);
  const [maxMileage, setMaxMileage] = useState(initialMaxMileage);

  function push(mn: number, mx: number, f: string, mlg: number) {
    const params = new URLSearchParams(currentParams);
    params.set("minMc", String(mn));
    params.set("maxMc", String(mx));
    if (f) params.set("fuel", f); else params.delete("fuel");
    if (mlg < MLG_DEFAULT) params.set("maxMileage", String(mlg)); else params.delete("maxMileage");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}#inventory`);
  }

  const isDefault =
    minMc === MC_DEFAULT_MIN &&
    maxMc === MC_DEFAULT_MAX &&
    !fuel &&
    maxMileage === MLG_DEFAULT;

  function reset() {
    setMinMc(MC_DEFAULT_MIN);
    setMaxMc(MC_DEFAULT_MAX);
    setFuel("");
    setMaxMileage(MLG_DEFAULT);
    push(MC_DEFAULT_MIN, MC_DEFAULT_MAX, "", MLG_DEFAULT);
  }

  // Display values converted from M centimes
  const displayMin = mcToDisplay(minMc);
  const displayMax = mcToDisplay(maxMc);
  const { max: sliderMax, step: sliderStep } = filterBounds;

  function onDisplayLo(displayVal: number) {
    const mc = displayToMc(displayVal);
    setMinMc(mc);
    push(mc, maxMc, fuel, maxMileage);
  }

  function onDisplayHi(displayVal: number) {
    const mc = displayToMc(displayVal);
    setMaxMc(mc);
    push(minMc, mc, fuel, maxMileage);
  }

  function formatDisplayValue(v: number): string {
    if (filterUnit === "USD") return `$${v.toLocaleString()}`;
    if (filterUnit === "AED") return `${v.toLocaleString()} AED`;
    return `${v} M`;
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
              {formatDisplayValue(displayMin)} – {formatDisplayValue(displayMax)}
              <span className="ml-1 text-slate-400">{filterUnit}</span>
            </span>
          </div>
          <DualRange
            min={0} max={sliderMax} step={sliderStep}
            lo={displayMin} hi={displayMax}
            onLo={onDisplayLo}
            onHi={onDisplayHi}
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-300">
            <span>0</span><span>{formatDisplayValue(sliderMax)}</span>
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
            onChange={v => { setMaxMileage(v); push(minMc, maxMc, fuel, v); }}
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-300">
            <span>0 km</span><span>300k km</span>
          </div>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────── */}
      <div className="h-px bg-slate-100" />

      {/* ── Fuel + Reset row ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-slate-400">Fuel</span>

        <div className="flex flex-1 flex-wrap gap-1.5">
          {FUEL_OPTIONS.map(({ label, value }) => {
            const active = fuel === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => { setFuel(value); push(minMc, maxMc, value, maxMileage); }}
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

        {!isDefault && (
          <button type="button" onClick={reset} className="text-xs text-amber-500 underline underline-offset-2 hover:text-amber-400">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
