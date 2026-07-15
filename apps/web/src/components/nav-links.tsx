"use client";

import Link from "next/link";
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
      <div className="hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="text-sm font-medium text-slate-900 transition-colors duration-150 hover:text-amber-500"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <CountrySelector />

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          aria-label="Language"
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium text-slate-900"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        <Link
          href={isLoggedIn ? accountHref : "/login"}
          className="press-scale rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
        >
          {isLoggedIn ? dict.nav.account : "Login / Sign Up"}
        </Link>
      </div>
    </>
  );
}
