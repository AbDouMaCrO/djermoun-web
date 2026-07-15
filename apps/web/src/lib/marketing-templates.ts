import { AUTOCANGO_FEES_TOTAL } from "./fees";

export type Lang = "en" | "fr" | "ar";
export type Platform = "site" | "facebook" | "ouedkniss";

export type MarketingCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number | null;
  fuel: string | null;
  transmission: string | null;
  engine: string | null;
  exterior_color: string | null;
  accessories: string[] | null;
  primary_image: string | null;
  images: string[] | null;
  condition: string;
  price_cny: number | null;
  commission: number | null;
  shipping_cost: number | null;
  customs_duty_dzd: number | null;
  title: string | null;
};

export type Prices = {
  totalUSD: number;
  totalMc: number;
  totalDZD: number;
  customsMc: number | null;
};

export type ContentOutput = {
  title: string;
  generated_at: string;
  dzd_rate: number;
  car: MarketingCar;
  platforms: Record<Platform, Record<Lang, string>>;
};

const FUEL_MAP: Record<string, Record<Lang, string>> = {
  Petrol:   { en: "Petrol",         fr: "Essence",              ar: "بنزين" },
  Gasoline: { en: "Gasoline",       fr: "Essence",              ar: "بنزين" },
  Diesel:   { en: "Diesel",         fr: "Diesel",               ar: "ديزل" },
  Hybrid:   { en: "Hybrid",         fr: "Hybride",              ar: "هجين" },
  PHEV:     { en: "Plug-in Hybrid", fr: "Hybride rechargeable", ar: "هجين قابل للشحن" },
  EV:       { en: "Electric",       fr: "Électrique",           ar: "كهربائية" },
};

const COND_MAP: Record<string, Record<Lang, string>> = {
  new:  { en: "Brand New", fr: "Neuve",    ar: "جديدة" },
  used: { en: "Pre-Owned", fr: "Occasion", ar: "مستعملة" },
};

function fuel(f: string | null, lang: Lang): string {
  if (!f) return lang === "ar" ? "غير محدد" : lang === "fr" ? "Non précisé" : "N/A";
  return FUEL_MAP[f]?.[lang] ?? f;
}

function cond(c: string, lang: Lang): string {
  return COND_MAP[c]?.[lang] ?? c;
}

function n(v: number): string {
  return v.toLocaleString("en-US");
}

export function calcPrices(car: MarketingCar, rate: number): Prices {
  const fob        = Number(car.price_cny ?? 0);
  const commission = Number(car.commission ?? 0);
  const shipping   = Number(car.shipping_cost) || 1900;
  const totalUSD   = fob + AUTOCANGO_FEES_TOTAL + commission + shipping;
  return {
    totalUSD,
    totalMc:   Math.floor((totalUSD * rate) / 10_000),
    totalDZD:  Math.round(totalUSD * rate),
    customsMc: car.customs_duty_dzd != null
      ? Math.floor(Number(car.customs_duty_dzd) / 10_000)
      : null,
  };
}

function siteTpl(car: MarketingCar, lang: Lang, rate: number, wa: string): string {
  const p = calcPrices(car, rate);
  const km = car.mileage != null
    ? `${n(car.mileage)} km`
    : lang === "ar" ? "0 كم / جديدة" : lang === "fr" ? "0 km / Neuve" : "0 km / Brand New";
  const acc = car.accessories?.join(", ") ?? "";
  const customs = p.customsMc != null;

  if (lang === "ar") return `\
${car.year} ${car.make} ${car.model} — استيراد مباشر من الصين | جيرمون أوتو

السعر الإجمالي: ~${n(p.totalMc)} مليون سنتيم (الشحن مشمول)
ما يعادل: ~${n(p.totalDZD)} دج / ~${n(p.totalUSD)} دولار

─── المواصفات ───────────────────────────────
• الحالة        : ${cond(car.condition, lang)}
• الكيلومترات   : ${km}
• الوقود        : ${fuel(car.fuel, lang)}
• ناقل الحركة  : ${car.transmission ?? "تلقائي"}
• المحرك        : ${car.engine ?? "—"}
• اللون         : ${car.exterior_color ?? "—"}
${acc ? `• التجهيزات     : ${acc}` : ""}
─── لماذا تختار جيرمون؟ ──────────────────────
✅ تفتيش شامل قبل الشحن مع تقرير مفصل
✅ شحن مباشر من ميناء غوانغتشو، الصين
✅ سعر شامل لا رسوم مخفية
${customs ? `🏛️ الجمارك المقدرة: ~${n(p.customsMc!)} مليون سنتيم (تقديري)` : ""}
للتواصل: wa.me/${wa}
`;

  if (lang === "fr") return `\
${car.year} ${car.make} ${car.model} — Import Direct Chine | Djermoun Auto

Prix total estimé : ~${n(p.totalMc)} millions de centimes (livraison incluse)
Soit : ~${n(p.totalDZD)} DZD / ~${n(p.totalUSD)} USD

─── Fiche Technique ──────────────────────────
• État             : ${cond(car.condition, lang)}
• Kilométrage      : ${km}
• Carburant        : ${fuel(car.fuel, lang)}
• Boîte de vitesse : ${car.transmission ?? "Automatique"}
• Moteur           : ${car.engine ?? "—"}
• Couleur          : ${car.exterior_color ?? "—"}
${acc ? `• Options          : ${acc}` : ""}
─── Pourquoi Djermoun ? ───────────────────────
✅ Rapport d'inspection complet fourni avant expédition
✅ Expédié depuis le port de Guangzhou, Chine
✅ Prix tout inclus — aucun frais caché
${customs ? `🏛️ Droits de douane estimés : ~${n(p.customsMc!)} millions de centimes` : ""}
WhatsApp : wa.me/${wa}
`;

  return `\
${car.year} ${car.make} ${car.model} — Direct Import from China | Djermoun Auto

Estimated All-In Price: ~${n(p.totalMc)}M centimes (shipping included)
Equivalent: ~$${n(p.totalUSD)} USD / ${n(p.totalDZD)} DZD

─── Specifications ───────────────────────────
• Condition    : ${cond(car.condition, lang)}
• Mileage      : ${km}
• Fuel         : ${fuel(car.fuel, lang)}
• Transmission : ${car.transmission ?? "Automatic"}
• Engine       : ${car.engine ?? "—"}
• Color        : ${car.exterior_color ?? "—"}
${acc ? `• Features     : ${acc}` : ""}
─── Why Djermoun? ────────────────────────────
✅ Full pre-shipment inspection report included
✅ Shipped from Guangzhou port, China
✅ All-inclusive pricing — no hidden fees
${customs ? `🏛️ Estimated customs duty: ~${n(p.customsMc!)}M centimes` : ""}
WhatsApp: wa.me/${wa}
`;
}

function facebookTpl(car: MarketingCar, lang: Lang, rate: number, wa: string): string {
  const p = calcPrices(car, rate);
  const km = car.mileage != null ? `${n(car.mileage)} km` : "0 km";

  if (lang === "ar") return `\
🚗 ${car.year} ${car.make} ${car.model} | ${cond(car.condition, lang)}

💰 السعر: ~${n(p.totalMc)} مليون سنتيم (شامل الشحن)
📍 ${km} · ${fuel(car.fuel, lang)} · ${car.transmission ?? "تلقائي"}

استيراد مباشر من الصين 🇨🇳 · تفتيش شامل
راسلنا للتفاصيل 💬 wa.me/${wa}`;

  if (lang === "fr") return `\
🚗 ${car.year} ${car.make} ${car.model} | ${cond(car.condition, lang)}

💰 Prix : ~${n(p.totalMc)} millions centimes (livraison incluse)
📍 ${km} · ${fuel(car.fuel, lang)} · ${car.transmission ?? "Automatique"}

Import direct Chine 🇨🇳 · Inspection complète incluse
Envoyez un message pour plus de détails 💬 wa.me/${wa}`;

  return `\
🚗 ${car.year} ${car.make} ${car.model} | ${cond(car.condition, lang)}

💰 Price: ~${n(p.totalMc)}M centimes (~$${n(p.totalUSD)} USD, shipping included)
📍 ${km} · ${fuel(car.fuel, lang)} · ${car.transmission ?? "Automatic"}

Direct import from China 🇨🇳 · Full inspection report included
DM for details 💬 wa.me/${wa}`;
}

function ouedknissTpl(car: MarketingCar, lang: Lang, rate: number, wa: string): string {
  const p = calcPrices(car, rate);
  const km = car.mileage != null ? n(car.mileage) : "0";
  const acc = car.accessories?.join(", ") ?? "—";

  if (lang === "ar") return `\
${car.year} ${car.make} ${car.model} — ${cond(car.condition, lang)}

السعر    : ${n(p.totalMc)} مليون سنتيم
          (${n(p.totalUSD)} دولار / ${n(p.totalDZD)} دج)
الحالة   : ${cond(car.condition, lang)}
الكيلومترات: ${km} كم
الوقود   : ${fuel(car.fuel, lang)}
ناقل الحركة: ${car.transmission ?? "تلقائي"}
المحرك   : ${car.engine ?? "—"}
اللون    : ${car.exterior_color ?? "—"}
التجهيزات: ${acc}

الشحن مشمول — استيراد مباشر من الصين.
المشترون الجادون فقط. واتساب: wa.me/${wa}`;

  if (lang === "fr") return `\
${car.year} ${car.make} ${car.model} — ${cond(car.condition, lang)}

Prix        : ${n(p.totalMc)} millions centimes
              (${n(p.totalUSD)} USD / ${n(p.totalDZD)} DZD)
État        : ${cond(car.condition, lang)}
Kilométrage : ${km} km
Carburant   : ${fuel(car.fuel, lang)}
Boîte       : ${car.transmission ?? "Automatique"}
Moteur      : ${car.engine ?? "—"}
Couleur     : ${car.exterior_color ?? "—"}
Options     : ${acc}

Livraison incluse — import direct Chine.
Acheteurs sérieux uniquement. WhatsApp : wa.me/${wa}`;

  return `\
${car.year} ${car.make} ${car.model} — ${cond(car.condition, lang)}

Price       : ${n(p.totalMc)}M centimes (${n(p.totalUSD)} USD / ${n(p.totalDZD)} DZD)
Condition   : ${cond(car.condition, lang)}
Mileage     : ${km} km
Fuel        : ${fuel(car.fuel, lang)}
Transmission: ${car.transmission ?? "Automatic"}
Engine      : ${car.engine ?? "—"}
Color       : ${car.exterior_color ?? "—"}
Options     : ${acc}

Shipping included — direct import from China.
Serious buyers only. WhatsApp: wa.me/${wa}`;
}

export function generateContent(car: MarketingCar, rate: number, wa: string): ContentOutput {
  const km = car.mileage != null ? `${n(car.mileage)} km` : "0 km";
  const title = `${car.year} ${car.make} ${car.model} — ${car.condition}, ${km}, ${car.fuel ?? "N/A"}`;
  const langs: Lang[] = ["en", "fr", "ar"];
  const make = (tpl: (c: MarketingCar, l: Lang, r: number, w: string) => string) =>
    Object.fromEntries(langs.map((l) => [l, tpl(car, l, rate, wa)])) as Record<Lang, string>;

  return {
    title,
    generated_at: new Date().toISOString(),
    dzd_rate: rate,
    car,
    platforms: {
      site:      make(siteTpl),
      facebook:  make(facebookTpl),
      ouedkniss: make(ouedknissTpl),
    },
  };
}
