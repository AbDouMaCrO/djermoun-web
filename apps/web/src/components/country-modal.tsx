"use client";

import { useEffect, useState } from "react";
import { useCountry, COUNTRY_CONFIG, type Country } from "@/country/country-context";

const MODAL_KEY = "djermoun-country-selected";

export default function CountryModal() {
  const [open, setOpen] = useState(false);
  const { setCountry, enabledCountries } = useCountry();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabledCountries.length > 1 && !localStorage.getItem(MODAL_KEY)) setOpen(true);
  }, [enabledCountries.length]);

  function pick(c: Country) {
    setCountry(c);
    localStorage.setItem(MODAL_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-900">Welcome to Djermoun Auto</h2>
        <p className="mt-2 text-sm text-slate-500">
          Select your region to see prices in your local currency.
        </p>
        <div className="mt-6 grid gap-3">
          {enabledCountries.map((key) => {
            const cfg = COUNTRY_CONFIG[key];
            return (
              <button
                key={key}
                onClick={() => pick(key)}
                className="flex items-center gap-4 rounded-xl border-2 border-slate-200 p-4 text-left transition-all duration-150 hover:border-amber-500 hover:bg-amber-50"
              >
                <span className="text-4xl leading-none">{cfg.flag}</span>
                <div>
                  <p className="font-semibold text-slate-900">{cfg.label}</p>
                  <p className="text-xs text-slate-500">Prices in {cfg.currency}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
