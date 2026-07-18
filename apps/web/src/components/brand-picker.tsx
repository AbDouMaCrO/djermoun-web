"use client";

import { useState } from "react";
import Link from "next/link";

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
        className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white"
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
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Shop by Brand</p>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {BRANDS.map((brand) => {
          const active = currentMake === brand.make;
          return (
            <Link
              key={brand.make}
              href={href(brand.make)}
              className={`group relative flex shrink-0 flex-col items-center gap-2.5 rounded-2xl border px-5 py-4 transition-all duration-200 ${
                active
                  ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-slate-100 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
              }`}
            >
              <BrandLogo logo={brand.logo} name={brand.name} accent={brand.accent} />
              <span
                className={`text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-amber-600" : "text-slate-500 group-hover:text-slate-700"
                }`}
              >
                {brand.name}
              </span>
              {active && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black">
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
              className={`group relative flex shrink-0 flex-col items-center gap-2.5 rounded-2xl border px-5 py-4 transition-all duration-200 ${
                active
                  ? "border-slate-700 bg-slate-800 shadow-md shadow-slate-300"
                  : "border-slate-100 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-colors ${
                  active ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}
              >
                ···
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wide ${
                  active ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                }`}
              >
                Other
              </span>
              {active && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-600 text-[9px] font-black text-white">
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
