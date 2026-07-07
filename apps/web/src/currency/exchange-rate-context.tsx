"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "djermoun-usd-dzd-rate";

// Database prices (Base, Commission, Shipping) are in USD. This is the
// parallel-market USD->DZD rate shown to shoppers, adjustable at checkout.
export const DEFAULT_USD_TO_DZD_RATE = 253;

type ExchangeRateContextValue = {
  rate: number;
  setRate: (rate: number) => void;
};

const ExchangeRateContext = createContext<ExchangeRateContextValue | null>(null);

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [rate, setRateState] = useState(DEFAULT_USD_TO_DZD_RATE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) setRateState(parsed);
  }, []);

  const setRate = (next: number) => {
    if (!Number.isFinite(next) || next <= 0) return;
    setRateState(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <ExchangeRateContext.Provider value={{ rate, setRate }}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  const ctx = useContext(ExchangeRateContext);
  if (!ctx) throw new Error("useExchangeRate must be used within ExchangeRateProvider");
  return ctx;
}
