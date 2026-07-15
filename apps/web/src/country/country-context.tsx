"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useExchangeRate } from "@/currency/exchange-rate-context";
import { AED_PER_USD, COUNTRY_CONFIG, FILTER_BOUNDS, type Country } from "@/country/country-config";

export type { Country };
export { COUNTRY_CONFIG, FILTER_BOUNDS, AED_PER_USD };

type CountryContextValue = {
  country: Country;
  setCountry: (c: Country) => void;
  enabledCountries: Country[];
  formatPrice: (usdPrice: number | null) => string;
  mcToDisplay: (mc: number) => number;
  displayToMc: (v: number) => number;
  filterBounds: { max: number; step: number };
  filterUnit: string;
};

const CountryContext = createContext<CountryContextValue | null>(null);
const STORAGE_KEY = "djermoun-country";

export function CountryProvider({ children, enabledCountries = ["algeria"] }: { children: ReactNode; enabledCountries?: Country[] }) {
  const [country, setCountryState] = useState<Country>("algeria");
  const { rate: dzdRate } = useExchangeRate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Country | null;
    const fallback = enabledCountries[0] ?? "algeria";
    if (stored && enabledCountries.includes(stored)) setCountryState(stored);
    else setCountryState(fallback);
  }, [enabledCountries.join(",")]);

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
    return `~${Math.floor((usd * dzdRate) / 10_000)} M centimes`;
  }

  function mcToDisplay(mc: number): number {
    if (country === "international") return Math.round((mc * 10_000) / dzdRate);
    if (country === "uae") return Math.round((mc * 10_000 * AED_PER_USD) / dzdRate);
    return mc;
  }

  function displayToMc(v: number): number {
    if (country === "international") return Math.round((v * dzdRate) / 10_000);
    if (country === "uae") return Math.round((v * dzdRate) / (AED_PER_USD * 10_000));
    return v;
  }

  const filterBounds = FILTER_BOUNDS[country];
  const filterUnit = country === "international" ? "USD" : country === "uae" ? "AED" : "M centimes";

  return (
    <CountryContext.Provider value={{ country, setCountry, enabledCountries, formatPrice, mcToDisplay, displayToMc, filterBounds, filterUnit }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
