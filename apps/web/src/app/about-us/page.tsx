"use client";

import { BadgeCheck, Landmark, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";

const TRUST_ICONS = [BadgeCheck, Landmark, ShieldCheck];

export default function AboutUsPage() {
  const { dict } = useLanguage();

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{dict.aboutUs.heading}</h1>
      </div>

      <section className="mt-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
          {dict.aboutUs.missionEyebrow}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700">
          {dict.aboutUs.missionText}
        </p>
      </section>

      <section className="mt-20">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-amber-500">
          {dict.aboutUs.trustEyebrow}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {dict.aboutUs.trustStats.map((stat, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <div
                key={stat}
                className="rounded-xl border border-slate-200 bg-white p-6 text-center"
              >
                <Icon className="mx-auto text-amber-500" size={28} />
                <p className="mt-4 font-semibold text-slate-900">{stat}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
