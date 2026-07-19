"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Globe, Users } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";

const STAT_VALUES = ["4,800+", "100%", "10+", "50+"];
const BADGE_ICONS = [ShieldCheck, Globe, Users];

export default function AboutSection() {
  const { dict } = useLanguage();
  const a = dict.aboutUs;

  return (
    <>
      {/* About panel */}
      <section className="bg-white dark:bg-[#0A0F1E] border-t border-slate-100 dark:border-white/5 px-6 py-24">
        <div className="mx-auto max-w-7xl grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              {a.whoWeAreEyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {a.whoWeAreHeading}
            </h2>
            <p className="mt-2 text-lg font-medium text-slate-500 dark:text-slate-400">
              {a.whoWeAreSubtitle}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {a.whoWeAreDesc1}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {a.whoWeAreDesc2}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {(a.badges as string[]).map((label, i) => {
                const Icon = BADGE_ICONS[i];
                return (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400"
                  >
                    <Icon size={14} className="text-amber-500" />
                    {label}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center lg:justify-start">
              <Link
                href="/about-us"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
              >
                {a.learnMore} <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right — stats */}
          <div className="grid grid-cols-2 gap-4">
            {STAT_VALUES.map((value, i) => (
              <div
                key={value}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center dark:border-white/5 dark:bg-[#111827]"
              >
                <p className="text-4xl font-black text-amber-600 dark:text-amber-400">{value}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {(a.statLabels as string[])[i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-16 text-center">
        <h3 className="text-3xl font-black text-black">
          {a.ctaTitle}{" "}
          <span className="opacity-70">@Djermoun Auto</span>
        </h3>
        <p className="mt-2 text-black/70">{a.ctaSubtitle}</p>
        <Link
          href="/#inventory"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-black/80"
        >
          {a.ctaBrowse} <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
