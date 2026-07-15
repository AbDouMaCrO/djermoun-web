export const AUTOCANGO_FEES = [
  { label: "Inspection Fee",         amount: 65  },
  { label: "Export Handling Fee",    amount: 450 },
  { label: "Domestic Transport Fee", amount: 330 },
  { label: "Port Local Fee",         amount: 400, note: "Guangzhou, CN" },
  { label: "Service Fee",            amount: 400 },
  { label: "Banking Transfer Fee",   amount: 50  },
] as const;

// 65+450+330+400+400+50 = 1695
export const AUTOCANGO_FEES_TOTAL = AUTOCANGO_FEES.reduce((s, f) => s + f.amount, 0);
