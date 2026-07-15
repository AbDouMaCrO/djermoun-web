"use client";

import { ShieldCheck, Globe2, Car as CarIcon } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";

export default function Hero({
  makes,
  years,
  defaultMake,
  defaultModel,
  defaultYear,
}: {
  makes: string[];
  years: number[];
  defaultMake?: string;
  defaultModel?: string;
  defaultYear?: string;
}) {
  const { dict } = useLanguage();
  const STATS = [
    { icon: CarIcon, label: dict.home.statsVehicles as string },
    { icon: Globe2, label: dict.home.statsBrands as string },
    { icon: ShieldCheck, label: dict.home.statsSecure as string },
  ];

  const heroTitle = dict.home.heroTitle as string[];

  return (
    <section className="relative border-b border-slate-200 bg-[url('/hero-car.jpg')] bg-cover bg-center bg-no-repeat">
      {/* Light overlay so dark text stays readable over the hero image. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/80 to-slate-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-32 pt-24 text-center sm:pt-32">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          {heroTitle[0]}
          <span className="text-amber-500">{heroTitle[1]}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          {dict.home.heroSubtitle as string}
        </p>
        <a
          href="#inventory"
          className="press-scale mt-8 inline-block rounded-full bg-amber-500 px-8 py-3 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
        >
          {dict.home.browseInventory as string}
        </a>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {STATS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-900">
              <Icon className="text-amber-500" size={20} />
              <span className="text-sm font-semibold sm:text-base">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating glass quick-search, overlapping the hero bottom edge. */}
      <form
        action="/"
        method="GET"
        className="absolute inset-x-0 bottom-0 z-50 mx-auto w-[92%] max-w-4xl translate-y-1/2 rounded-2xl border border-slate-300/60 bg-white/80 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-medium text-slate-600">
              {dict.home.searchMake as string}
            </span>
            <select
              name="make"
              defaultValue={defaultMake ?? ""}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
            >
              <option value="">{dict.home.searchAllMakes as string}</option>
              {makes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-medium text-slate-600">
              {dict.home.searchModel as string}
            </span>
            <input
              name="model"
              defaultValue={defaultModel ?? ""}
              placeholder={dict.home.searchAnyModel as string}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-amber-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-medium text-slate-600">
              {dict.home.searchYear as string}
            </span>
            <select
              name="year"
              defaultValue={defaultYear ?? ""}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
            >
              <option value="">{dict.home.searchAnyYear as string}</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="press-scale self-end rounded-md bg-amber-500 px-4 py-2 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
          >
            {dict.home.searchButton as string}
          </button>
        </div>
      </form>
    </section>
  );
}