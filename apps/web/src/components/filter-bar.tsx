"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const DEFAULT_MIN = 150;
const DEFAULT_MAX = 250;

export default function FilterBar({
  initialMin = DEFAULT_MIN,
  initialMax = DEFAULT_MAX,
  initialWasla = false,
  currentParams = {},
}: {
  initialMin?: number;
  initialMax?: number;
  initialWasla?: boolean;
  currentParams?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [minMc, setMinMc] = useState(initialMin);
  const [maxMc, setMaxMc] = useState(initialMax);
  const [wasla, setWasla] = useState(initialWasla);

  function push(min: number, max: number, w: boolean) {
    const params = new URLSearchParams(currentParams);
    params.set("minMc", String(min));
    params.set("maxMc", String(max));
    if (w) params.set("wasla", "1");
    else params.delete("wasla");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}#inventory`);
  }

  function apply(min = minMc, max = maxMc, w = wasla) {
    push(min, max, w);
  }

  function toggleWasla() {
    const next = !wasla;
    setWasla(next);
    apply(minMc, maxMc, next);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") apply();
  }

  const isDefault = minMc === DEFAULT_MIN && maxMc === DEFAULT_MAX && !wasla;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-3.5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]">
      {/* Price label */}
      <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-slate-400">
        Budget
      </span>

      {/* Range inputs */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <PriceInput
          value={minMc}
          onChange={setMinMc}
          onBlur={() => apply()}
          onKeyDown={handleKey}
          label="Min"
        />

        <div className="flex items-center gap-1 text-slate-300">
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

        <span className="text-xs font-semibold text-slate-400">
          M centimes
        </span>

        {!isDefault && (
          <button
            type="button"
            onClick={() => {
              setMinMc(DEFAULT_MIN);
              setMaxMc(DEFAULT_MAX);
              setWasla(false);
              apply(DEFAULT_MIN, DEFAULT_MAX, false);
            }}
            className="text-xs text-amber-500 hover:text-amber-400 underline underline-offset-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Wasla toggle */}
      <button
        type="button"
        onClick={toggleWasla}
        className={`group flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          wasla
            ? "bg-sky-500 text-white shadow-lg shadow-sky-200/60"
            : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
        }`}
      >
        <span
          className={`text-base transition-transform duration-300 ${wasla ? "rotate-0" : "group-hover:-rotate-12"}`}
        >
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
        className="w-28 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-bold text-slate-800 outline-none transition-colors focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,191,36,0.12)]"
      />
    </div>
  );
}
