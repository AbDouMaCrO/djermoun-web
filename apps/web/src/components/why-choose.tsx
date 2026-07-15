"use client";

import { ShieldCheck, MapPin, Wrench, Headphones, FileCheck, Wallet } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";

export default function WhyChoose() {
  const { dict } = useLanguage();

  const FEATURES = [
    {
      icon: ShieldCheck,
      title: dict.home.secureTransactions as string,
      description: dict.home.secureTransactionsDesc as string,
    },
    {
      icon: MapPin,
      title: dict.home.globalShipping as string,
      description: dict.home.globalShippingDesc as string,
    },
    {
      icon: Wrench,
      title: dict.home.fullInspections as string,
      description: dict.home.fullInspectionsDesc as string,
    },
    {
      icon: Headphones,
      title: dict.home.dedicatedSupport as string,
      description: dict.home.dedicatedSupportDesc as string,
    },
    {
      icon: FileCheck,
      title: dict.home.transparentPaperwork as string,
      description: dict.home.transparentPaperworkDesc as string,
    },
    {
      icon: Wallet,
      title: dict.home.fairPricing as string,
      description: dict.home.fairPricingDesc as string,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
          {dict.home.whyChooseUs as string}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          {dict.home.whyChooseDjermoun as string}
        </h2>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <Icon className="text-amber-500" size={28} />
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
