export type Country = "international" | "algeria" | "uae";

export const AED_PER_USD = 3.67;

export const COUNTRY_CONFIG = {
  international: { label: "International", flag: "🌍", currency: "USD" },
  algeria:       { label: "Algeria",       flag: "🇩🇿", currency: "DZD" },
  uae:           { label: "UAE",           flag: "🇦🇪", currency: "AED" },
} as const;

export const FILTER_BOUNDS: Record<Country, { max: number; step: number }> = {
  international: { max: 80_000,  step: 500   },
  algeria:       { max: 2_000,   step: 10    },
  uae:           { max: 300_000, step: 2_000 },
};
