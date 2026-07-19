"use client";

import { MapPin, MessageCircle, Mail } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";

const WHATSAPP_NUMBER = "+213 555 123 456";
const EMAIL = "sales@djermounauto.com";

export default function ContactPage() {
  const { dict } = useLanguage();
  const c = dict.contact;

  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{c.heading}</h1>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <MapPin size={22} className="mt-1 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {c.officeLabel}
              </p>
              <p className="mt-1 text-slate-900 dark:text-slate-200">{c.officeValue}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin size={22} className="mt-1 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {c.portLabel}
              </p>
              <p className="mt-1 text-slate-900 dark:text-slate-200">{c.portValue}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail size={22} className="mt-1 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {c.emailLabel}
              </p>
              <p className="mt-1 text-slate-900 dark:text-slate-200">{EMAIL}</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="press-scale inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
          >
            <MessageCircle size={18} />
            {c.whatsappLabel}: {WHATSAPP_NUMBER}
          </a>
        </div>

        <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#111827]">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{c.form.name}</label>
            <input
              type="text"
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{c.form.email}</label>
            <input
              type="email"
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{c.form.phone}</label>
            <input
              type="tel"
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{c.form.message}</label>
            <textarea
              rows={4}
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-200"
            />
          </div>

          <button
            type="button"
            className="press-scale w-full rounded-md bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
          >
            {c.form.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
