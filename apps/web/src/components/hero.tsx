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
    <section className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white dark:bg-[#050B18] dark:from-[#050B18] dark:to-[#050B18] overflow-hidden flex flex-col justify-center">
      {/* Ambient gradient orbs — dark only */}
      <div className="hidden dark:block absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/8 blur-[120px] pointer-events-none" />
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none" />
      <div className="hidden dark:block absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-amber-300/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-48 pt-32 text-center sm:pt-40">
        {/* Eyebrow pill */}
        <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 px-4 py-1.5 mb-8">
          <span className="text-xs font-bold tracking-[0.3em] text-amber-400 uppercase">
            CHINA → YOUR DOOR
          </span>
        </div>

        {/* H1 */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
          {heroTitle[0]}
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            {heroTitle[1]}
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          {dict.home.heroSubtitle as string}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#inventory"
            className="press-scale inline-block rounded-md bg-amber-500 px-8 py-3 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
          >
            {dict.home.browseInventory as string} →
          </a>
          <a
            href="#how-it-works"
            className="press-scale inline-block rounded-md border border-slate-300 text-slate-700 hover:border-amber-400 dark:border-white/20 dark:text-white dark:hover:border-amber-500/50 px-8 py-3 text-sm font-bold transition-colors duration-150"
          >
            How It Works
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {STATS.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-6">
              {i > 0 && <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />}
              <div className="flex flex-col items-center gap-1">
                <Icon className="text-amber-500" size={22} />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating dark search bar */}
      <form
        action="/"
        method="GET"
        className="absolute inset-x-0 bottom-0 z-50 mx-auto w-[92%] max-w-4xl translate-y-1/2 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0F172A] p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {dict.home.searchMake as string}
            </span>
            <select
              name="make"
              defaultValue={defaultMake ?? ""}
              className="rounded-md border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-amber-500 [&>option]:bg-[#0F172A] px-3 py-2 text-sm"
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
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {dict.home.searchModel as string}
            </span>
            <input
              name="model"
              defaultValue={defaultModel ?? ""}
              placeholder={dict.home.searchAnyModel as string}
              className="rounded-md border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 outline-none focus:border-amber-500 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {dict.home.searchYear as string}
            </span>
            <select
              name="year"
              defaultValue={defaultYear ?? ""}
              className="rounded-md border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-amber-500 [&>option]:bg-[#0F172A] px-3 py-2 text-sm"
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
