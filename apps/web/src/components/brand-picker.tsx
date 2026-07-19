"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-context";

const BRANDS = [
  { name: "Geely",       make: "GEELY",       logo: "/brands/geely.svg",      accent: "#0070b2" },
  { name: "Livan",       make: "LIVAN",        logo: "/brands/livan.svg",      accent: "#E31937" },
  { name: "KIA",         make: "KIA",          logo: "/brands/kia.svg",        accent: "#131E29" },
  { name: "HAVAL",       make: "HAVAL",        logo: "/brands/haval.svg",      accent: "#CC0000" },
  { name: "BYD",         make: "BYD",          logo: "/brands/byd.svg",        accent: "#d70c19" },
  { name: "Chery",       make: "CHERY",        logo: "/brands/chery.svg",      accent: "#003080" },
  { name: "Volkswagen",  make: "VOLKSWAGEN",   logo: "/brands/volkswagen.svg", accent: "#001E50" },
  { name: "ChangAn",     make: "CHANGAN",      logo: "/brands/changan.svg",    accent: "#003366" },
  { name: "MG",          make: "MG",           logo: "/brands/mg.svg",         accent: "#FF0000" },
  { name: "Jetour",      make: "JETOUR",       logo: "/brands/jetour.svg",     accent: "#1A3A5C" },
  { name: "Toyota",      make: "TOYOTA",       logo: "/brands/toyota.svg",     accent: "#EB0A1E" },
  { name: "Roewe",       make: "ROEWE",        logo: "/brands/roewe.svg",      accent: "#CC0000" },
  { name: "Honda",       make: "HONDA",        logo: "/brands/honda.svg",      accent: "#CC0000" },
  { name: "Kaiyi",       make: "KAIYI",        logo: "/brands/kaiyi.svg",      accent: "#003080" },
  { name: "Audi",        make: "AUDI",         logo: "/brands/audi.svg",       accent: "#BB0A1E" },
  { name: "Beijing",     make: "BEIJING",      logo: "/brands/beijing.svg",    accent: "#003366" },
  { name: "Lynk & Co",  make: "LYNK&CO",      logo: "/brands/lynkco.svg",     accent: "#1A1A1A" },
  { name: "Skoda",       make: "SKODA",        logo: "/brands/skoda.svg",      accent: "#4BA82E" },
  { name: "Hyundai",     make: "HYUNDAI",      logo: "/brands/hyundai.svg",    accent: "#002C5F" },
  { name: "Hongqi",      make: "HONGQI",       logo: "/brands/hongqi.svg",     accent: "#CC0000" },
  { name: "Wuling",      make: "WULING",       logo: "/brands/wuling.svg",     accent: "#003366" },
  { name: "Mazda",       make: "MAZDA",        logo: "/brands/mazda.svg",      accent: "#BA0000" },
  { name: "GAC",         make: "GAC",          logo: "/brands/gac.svg",        accent: "#003366" },
];

// Include case variants so they don't appear in "Other" even without their own brand pill
export const KNOWN_MAKES = [
  ...BRANDS.map((b) => b.make),
  "Geely", "Volkswagen", "Honda", "Skoda", "Haval", "ChangAn",
];

function BrandLogo({ logo, name, accent }: { logo: string; name: string; accent: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-black text-white opacity-90"
        style={{ background: accent }}
      >
        {name[0]}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={name}
      onError={() => setErr(true)}
      className="h-16 w-16 object-contain"
      draggable={false}
    />
  );
}

export default function BrandPicker({
  currentMake,
  extraParams = {},
}: {
  currentMake?: string;
  extraParams?: Record<string, string>;
}) {
  const { dict } = useLanguage();

  function href(make: string) {
    const params = new URLSearchParams(extraParams);
    if (currentMake === make) {
      params.delete("make");
    } else {
      params.set("make", make);
    }
    params.delete("page");
    const qs = params.toString();
    return `/${qs ? `?${qs}` : ""}#inventory`;
  }

  return (
    <div className="mt-10">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{dict.brandPicker.shopByBrand}</p>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {BRANDS.map((brand) => {
          const active = currentMake === brand.make;
          return (
            <Link
              key={brand.make}
              href={href(brand.make)}
              className={`group relative flex shrink-0 flex-col items-center gap-3 rounded-2xl border px-5 py-5 transition-all duration-200 cursor-pointer ${
                active
                  ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100 dark:border-amber-500/60 dark:bg-amber-500/8 dark:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-white/5 dark:bg-[#111827] dark:hover:border-amber-500/25 dark:hover:bg-[#141C2F]"
              }`}
            >
              <BrandLogo logo={brand.logo} name={brand.name} accent={brand.accent} />
              <span
                className={`text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-amber-600 dark:text-amber-400" : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
                }`}
              >
                {brand.name}
              </span>
              {active && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black dark:bg-amber-500 dark:text-black text-[9px] font-black">
                  ✓
                </span>
              )}
            </Link>
          );
        })}

        {/* Other Cars */}
        {(() => {
          const active = currentMake === "__other__";
          return (
            <Link
              href={href("__other__")}
              className={`group relative flex shrink-0 flex-col items-center gap-3 rounded-2xl border px-5 py-5 transition-all duration-200 cursor-pointer ${
                active
                  ? "border-amber-400/50 bg-amber-50/50 dark:border-white/20 dark:bg-white/5"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-white/5 dark:bg-[#111827] dark:hover:border-amber-500/25 dark:hover:bg-[#141C2F]"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                  active ? "text-amber-600 dark:text-slate-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400"
                }`}
              >
                ···
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-amber-600 dark:text-slate-300" : "text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                }`}
              >
                {dict.brandPicker.other}
              </span>
              {active && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black dark:bg-amber-500 dark:text-black text-[9px] font-black">
                  ✓
                </span>
              )}
            </Link>
          );
        })()}
      </div>
    </div>
  );
}
