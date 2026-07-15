#!/usr/bin/env tsx
/**
 * Djermoun Auto — Marketing Content Generator
 *
 * Usage:
 *   npm run marketing:generate              # all available cars
 *   npm run marketing:generate -- --car-id <uuid>   # single car
 *
 * Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env (see .env.example)
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const FALLBACK_DZD_RATE = Number(process.env.DZD_RATE ?? 253);
const OUTPUT_DIR = process.env.MARKETING_OUTPUT_DIR ?? "marketing-output";
const WA = process.env.WHATSAPP_NUMBER ?? "";

// Matches lib/fees.ts — both must stay in sync
const AUTOCANGO_FEES_TOTAL = 1695;

// ── Types ─────────────────────────────────────────────────────────────────────

type Lang = "en" | "fr" | "ar";
type Platform = "site" | "facebook" | "ouedkniss";

type Car = {
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

type Prices = {
  totalUSD: number;
  totalMc: number;    // millions of centimes
  totalDZD: number;
  customsMc: number | null;
};

// ── Fuel translations ─────────────────────────────────────────────────────────

const FUEL_MAP: Record<string, Record<Lang, string>> = {
  Petrol:   { en: "Petrol",           fr: "Essence",               ar: "بنزين" },
  Gasoline: { en: "Gasoline",         fr: "Essence",               ar: "بنزين" },
  Diesel:   { en: "Diesel",           fr: "Diesel",                ar: "ديزل" },
  Hybrid:   { en: "Hybrid",           fr: "Hybride",               ar: "هجين" },
  PHEV:     { en: "Plug-in Hybrid",   fr: "Hybride rechargeable",  ar: "هجين قابل للشحن" },
  EV:       { en: "Electric",         fr: "Électrique",            ar: "كهربائية" },
};

const COND_MAP: Record<string, Record<Lang, string>> = {
  new:  { en: "Brand New",  fr: "Neuve",    ar: "جديدة" },
  used: { en: "Pre-Owned",  fr: "Occasion", ar: "مستعملة" },
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

// ── Price calculation ─────────────────────────────────────────────────────────

function prices(car: Car, rate: number): Prices {
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

// ── Templates ─────────────────────────────────────────────────────────────────

function siteTpl(car: Car, lang: Lang, rate: number): string {
  const p   = prices(car, rate);
  const km  = car.mileage != null ? `${n(car.mileage)} km` : lang === "ar" ? "0 كم / جديدة" : lang === "fr" ? "0 km / Neuve" : "0 km / Brand New";
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

للتواصل: wa.me/${WA}
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

WhatsApp : wa.me/${WA}
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

WhatsApp: wa.me/${WA}
`;
}

function facebookTpl(car: Car, lang: Lang, rate: number): string {
  const p  = prices(car, rate);
  const km = car.mileage != null ? `${n(car.mileage)} km` : "0 km";

  if (lang === "ar") return `\
🚗 ${car.year} ${car.make} ${car.model} | ${cond(car.condition, lang)}

💰 السعر: ~${n(p.totalMc)} مليون سنتيم (شامل الشحن)
📍 ${km} · ${fuel(car.fuel, lang)} · ${car.transmission ?? "تلقائي"}

استيراد مباشر من الصين 🇨🇳 · تفتيش شامل
راسلنا للتفاصيل 💬 wa.me/${WA}`;

  if (lang === "fr") return `\
🚗 ${car.year} ${car.make} ${car.model} | ${cond(car.condition, lang)}

💰 Prix : ~${n(p.totalMc)} millions centimes (livraison incluse)
📍 ${km} · ${fuel(car.fuel, lang)} · ${car.transmission ?? "Automatique"}

Import direct Chine 🇨🇳 · Inspection complète incluse
Envoyez un message pour plus de détails 💬 wa.me/${WA}`;

  return `\
🚗 ${car.year} ${car.make} ${car.model} | ${cond(car.condition, lang)}

💰 Price: ~${n(p.totalMc)}M centimes (~$${n(p.totalUSD)} USD, shipping included)
📍 ${km} · ${fuel(car.fuel, lang)} · ${car.transmission ?? "Automatic"}

Direct import from China 🇨🇳 · Full inspection report included
DM for details 💬 wa.me/${WA}`;
}

function ouedknissTpl(car: Car, lang: Lang, rate: number): string {
  const p   = prices(car, rate);
  const km  = car.mileage != null ? n(car.mileage) : "0";
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
المشترون الجادون فقط. واتساب: wa.me/${WA}`;

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
Acheteurs sérieux uniquement. WhatsApp : wa.me/${WA}`;

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
Serious buyers only. WhatsApp: wa.me/${WA}`;
}

// ── Content assembly ──────────────────────────────────────────────────────────

type ContentOutput = {
  title: string;
  generated_at: string;
  dzd_rate: number;
  car: Car;
  platforms: Record<Platform, Record<Lang, string>>;
};

function generateContent(car: Car, rate: number): ContentOutput {
  const km    = car.mileage != null ? `${n(car.mileage)} km` : "0 km";
  const title = `${car.year} ${car.make} ${car.model} — ${car.condition}, ${km}, ${car.fuel ?? "N/A"}`;
  const langs: Lang[] = ["en", "fr", "ar"];
  const make = <T,>(tpl: (c: Car, l: Lang, r: number) => T) =>
    Object.fromEntries(langs.map((l) => [l, tpl(car, l, rate)])) as Record<Lang, T>;

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

// ── File output ───────────────────────────────────────────────────────────────

function writeOutput(content: ContentOutput): void {
  const dir = join(OUTPUT_DIR, content.car.id);
  mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, "content.json"), JSON.stringify(content, null, 2), "utf8");

  const platforms: Platform[] = ["site", "facebook", "ouedkniss"];
  const langs: Lang[] = ["en", "fr", "ar"];
  for (const platform of platforms) {
    for (const lang of langs) {
      writeFileSync(
        join(dir, `${platform}.${lang}.txt`),
        content.platforms[platform][lang],
        "utf8",
      );
    }
  }
}

// ── CLI ───────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
    process.exit(1);
  }

  // Parse --car-id (both --car-id=<uuid> and --car-id <uuid>)
  const argv = process.argv.slice(2);
  const eqIdx = argv.findIndex((a) => a.startsWith("--car-id="));
  const spIdx = argv.indexOf("--car-id");
  const carId = eqIdx !== -1
    ? argv[eqIdx].split("=")[1]
    : spIdx !== -1
    ? argv[spIdx + 1]
    : null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Prefer admin-set rate from DB, fall back to env/default
  const { data: settings } = await supabase
    .from("site_settings")
    .select("usd_to_dzd_rate")
    .eq("id", 1)
    .single();
  const rate = Number(settings?.usd_to_dzd_rate) || FALLBACK_DZD_RATE;
  console.log(`Exchange rate: 1 USD = ${rate} DZD`);

  // Fetch cars
  let query = supabase
    .from("cars")
    .select(
      "id, make, model, year, mileage, fuel, transmission, engine, " +
      "exterior_color, accessories, primary_image, images, condition, " +
      "price_cny, commission, shipping_cost, customs_duty_dzd, title"
    )
    .eq("status", "available")
    .eq("is_visible", true);

  if (carId) query = (query as typeof query).eq("id", carId);

  const { data: cars, error } = await query;
  if (error) { console.error("Supabase error:", error.message); process.exit(1); }
  if (!cars?.length) { console.log("No cars found."); return; }

  console.log(`\nGenerating content for ${cars.length} car(s)…\n`);

  for (const car of cars as Car[]) {
    const content = generateContent(car, rate);
    writeOutput(content);
    console.log(`  ✓  ${content.title}`);
    console.log(`     → ${join(OUTPUT_DIR, car.id)}/`);
  }

  const fileCount = cars.length * 10; // content.json + 9 txt files
  console.log(`\n✅  Done. ${cars.length} car(s), ${fileCount} files → ${OUTPUT_DIR}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
