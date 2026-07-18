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
    <section className="bg-[#0A0F1E] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            {dict.home.whyChooseUs as string}
          </p>
          <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            {dict.home.whyChooseDjermoun as string}
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/5 bg-[#111827] p-7 transition-all duration-300 hover:border-amber-500/20 hover:bg-[#141C2F]"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5 group-hover:bg-amber-500/20 transition-colors">
                <Icon className="text-amber-500" size={24} />
              </div>
              <h3 className="text-white font-bold mt-4">{title}</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
