import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import CountrySelector from "@/components/country-selector";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const FB = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "";
const IG = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";

const SOCIALS = [
  {
    label: "WA",
    href: WA ? `https://wa.me/${WA}` : "#",
    title: "WhatsApp",
    color: "hover:border-green-500 hover:text-green-400",
  },
  {
    label: "FB",
    href: FB || "#",
    title: "Facebook",
    color: "hover:border-blue-500 hover:text-blue-400",
  },
  {
    label: "IG",
    href: IG || "#",
    title: "Instagram",
    color: "hover:border-pink-500 hover:text-pink-400",
  },
];

const QUICK_LINKS = [
  { label: "Inventory", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050B18]">
      {/* Newsletter */}
      <div className="border-b border-white/5 bg-[#0A0F1E]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div>
            <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
            <p className="mt-1 text-sm text-slate-400">
              New arrivals and export deals, straight to your inbox.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2 sm:w-auto">
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-500 sm:w-64"
            />
            <button
              type="submit"
              className="press-scale shrink-0 rounded-md bg-amber-500 px-5 py-2 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-black tracking-widest text-white">
            DJERMOUN <span className="text-amber-400">AUTO</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            A premier global exporter of premium vehicles — transparent pricing, full
            inspections, and seamless shipping to your port.
          </p>
          <div className="mt-5 flex gap-3">
            {SOCIALS.map(({ label, href, title, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={title}
                title={title}
                className={`press-scale flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-slate-400 transition-colors duration-150 ${color}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors duration-150 hover:text-amber-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
            Contact Info
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-amber-500" />
              123 Export Avenue, Free Trade Zone
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-amber-500" />
              +1 (234) 567-890
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-amber-500" />
              sales@djermounauto.com
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar with country selector */}
      <div className="border-t border-white/5 bg-[#050B18] px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Djermoun Auto. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Region:</span>
            <CountrySelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
