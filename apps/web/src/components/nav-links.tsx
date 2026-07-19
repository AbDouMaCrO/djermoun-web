"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { languages, type Language } from "@/i18n/dictionaries";
import { useLanguage } from "@/i18n/language-context";
import CountrySelector from "@/components/country-selector";
import type { UserRole } from "@/utils/supabase/roles";

export default function NavLinks({
  isLoggedIn,
  role,
}: {
  isLoggedIn: boolean;
  role: UserRole | null;
}) {
  const { lang, setLang, dict } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = [
    { id: "inventory",    label: dict.nav.inventory,   href: "/"             },
    { id: "how-it-works", label: dict.nav.howItWorks,  href: "/how-it-works" },
    { id: "about-us",     label: dict.nav.aboutUs,     href: "/about-us"     },
    { id: "contact",      label: dict.nav.contact,     href: "/contact"      },
    { id: "terms",        label: "Terms",              href: "/terms"        },
  ];

  if (role === "supervisor" || role === "admin") {
    links.push({ id: "operations", label: "Operations", href: "/admin/dashboard" });
  }
  if (role === "admin") {
    links.push({ id: "system-settings", label: "System Settings", href: "/admin/settings" });
  }

  const accountHref = role === "admin" || role === "supervisor" ? "/admin" : "/account";

  return (
    <>
      {/* ── Desktop nav ─────────────────────────────────── */}
      <div className="hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="text-sm font-medium text-slate-600 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors duration-150"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* ── Desktop controls ────────────────────────────── */}
      <div className="hidden items-center gap-3 md:flex">
        <CountrySelector />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          aria-label="Language"
          className="rounded-md border border-slate-300 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:[&>option]:bg-[#0A0F1E] px-2 py-1 text-sm font-medium"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <Link
          href={isLoggedIn ? accountHref : "/login"}
          className="press-scale rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
        >
          {isLoggedIn ? dict.nav.account : dict.common.loginSignup}
        </Link>
      </div>

      {/* ── Mobile: always-visible controls + hamburger ─── */}
      <div className="flex items-center gap-2 md:hidden">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          aria-label="Language"
          className="rounded-md border border-slate-300 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:[&>option]:bg-[#0A0F1E] px-2 py-1 text-xs font-medium"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <Link
          href={isLoggedIn ? accountHref : "/login"}
          className="press-scale rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-black transition-colors duration-150 hover:bg-amber-400"
        >
          {isLoggedIn ? dict.nav.account : dict.common.loginSignup}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile backdrop ──────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl dark:bg-[#0A0F1E] md:hidden transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
          <span className="text-base font-black text-slate-900 dark:text-white">DJERMOUN AUTO</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-600 dark:text-slate-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-slate-100 px-5 py-5 dark:border-white/5">
          <CountrySelector className="w-full" />
        </div>
      </div>
    </>
  );
}
