"use client";

import { useLanguage } from "@/i18n/language-context";
import { Car, FileText, Ship, Key } from "lucide-react";

const steps = [
  {
    id: 1,
    Icon: Car,
    label: "Browse live inventory and reserve.",
    fr: "Parcourez et réservez.",
    ar: "تصفح واحجز.",
  },
  {
    id: 2,
    Icon: FileText,
    label: "Sign agreements and secure deposit.",
    fr: "Signez les contrats et payez l'acompte.",
    ar: "توقيع العقود ودفع العربون.",
  },
  {
    id: 3,
    Icon: Ship,
    label: "Export logistics and sea freight.",
    fr: "Logistique d'exportation et fret maritime.",
    ar: "الشحن البحري وإجراءات التصدير.",
  },
  {
    id: 4,
    Icon: Key,
    label: "Customs clearance and handover.",
    fr: "Dédouanement et remise des clés.",
    ar: "التخليص الجمركي واستلام المفاتيح.",
  },
];

export default function HowItWorksPage() {
  const { dict } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12">
      <main className="mx-auto max-w-6xl px-6">
        <section className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-500">
            How it works
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {dict.howItWorks.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600 sm:text-lg">
            {dict.howItWorks.stepLabel}
          </p>
        </section>

        <div className="relative">
          <div className="absolute left-8 top-6 bottom-6 hidden w-px bg-slate-100 md:block" />

          <div className="space-y-10">
            {steps.map((step, index) => {
              const Icon = step.Icon;
              return (
                <div key={step.id} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="md:absolute md:left-0 md:-ml-8 md:top-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg">
                      <Icon size={24} />
                    </div>
                  </div>

                  <div className="md:ml-20">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                        Step {step.id}
                      </span>
                      <span className="text-sm font-medium text-slate-600">{step.label}</span>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-3xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">EN</p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">{step.label}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">FR</p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">{step.fr}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 text-right" dir="rtl">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">AR</p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">{step.ar}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
