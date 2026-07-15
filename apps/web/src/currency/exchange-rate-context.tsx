"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ExchangeRateContextValue = {
  rate: number;
};

const ExchangeRateContext = createContext<ExchangeRateContextValue | null>(null);

export function ExchangeRateProvider({ children, defaultRate }: { children: ReactNode; defaultRate: number }) {
  const [rate] = useState(defaultRate);
  return (
    <ExchangeRateContext.Provider value={{ rate }}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  const ctx = useContext(ExchangeRateContext);
  if (!ctx) throw new Error("useExchangeRate must be used within ExchangeRateProvider");
  return ctx;
}
