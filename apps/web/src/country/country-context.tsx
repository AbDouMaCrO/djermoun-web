"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useExchangeRate } from "@/currency/exchange-rate-context";

export type Country = "international" | "algeria" | "uae";

export const AED_PER_USD = 3.67;

export const COUNTRY_CONFIG = {
  international: { label: "International", flag: "🌍", currency: "USD" },
  algeria:       { label: "Algeria",       flag: "🇩🇿", currency: "DZD" },
  uae:           { label: "UAE",           flag: "🇦🇪", currency: "AED" },
} as const;

// Filter slider bounds per country (display units)
export const FILTER_BOUNDS: Record<Country, { max: number; step: number }> = {
  international: { max: 80_000,  step: 500   },
  algeria:       { max: 2_000,   step: 10    },
  uae:           { max: 300_000, step: 2_000 },
};

type CountryContextValue = {
  country: Country;
  setCountry: (c: Country) => void;
  formatPrice: (usdPrice: number | null) => string;
  // filter bar helpers (M centimes ↔ display unit)
  mcToDisplay: (mc: number) => number;
  displayToMc: (v: number) => number;
  filterBounds: { max: number; step: number };
  filterUnit: string;
};

const CountryContext = createContext<CountryContextValue | null>(null);
const STORAGE_KEY = "djermoun-country";

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country>("algeria");
  const { rate: dzdRate } = useExchangeRate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Country | null;
    if (stored && stored in COUNTRY_CONFIG) setCountryState(stored);
  }, []);

  function setCountry(c: Country) {
    setCountryState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }

  function formatPrice(usd: number | null): string {
    if (usd == null) return "Price on request";
    if (country === "international") {
      return new Intl.NumberFormat(undefined, {
        style: "currency", currency: "USD", maximumFractionDigits: 0,
      }).format(usd);
    }
    if (country === "uae") {
      return new Intl.NumberFormat(undefined, {
        style: "currency", currency: "AED", maximumFractionDigits: 0,
      }).format(Math.round(usd * AED_PER_USD));
    }
    // algeria: M centimes
    return `~${Math.floor((usd * dzdRate) / 10_000)} M centimes`;
  }

  // M centimes → display unit
  function mcToDisplay(mc: number): number {
    if (country === "international") return Math.round((mc * 10_000) / dzdRate);
    if (country === "uae") return Math.round((mc * 10_000 * AED_PER_USD) / dzdRate);
    return mc;
  }

  // display unit → M centimes
  function displayToMc(v: number): number {
    if (country === "international") return Math.round((v * dzdRate) / 10_000);
    if (country === "uae") return Math.round((v * dzdRate) / (AED_PER_USD * 10_000));
    return v;
  }

  const filterBounds = FILTER_BOUNDS[country];
  const filterUnit = country === "international" ? "USD" : country === "uae" ? "AED" : "M centimes";

  return (
    <CountryContext.Provider value={{ country, setCountry, formatPrice, mcToDisplay, displayToMc, filterBounds, filterUnit }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
