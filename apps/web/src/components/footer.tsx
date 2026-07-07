import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

// lucide-react dropped brand/logo icons (trademark reasons) — lettered badges instead.
const SOCIALS = ["FB", "IG", "X"];

const QUICK_LINKS = [
  { label: "Inventory", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      {/* Newsletter */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Stay Updated</h3>
            <p className="mt-1 text-sm text-slate-600">
              New arrivals and export deals, straight to your inbox.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2 sm:w-auto">
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-amber-500 sm:w-64"
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
          <p className="text-lg font-extrabold tracking-wide text-slate-900">
            DJERMOUN <span className="text-amber-500">AUTO</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-slate-600">
            A premier global exporter of premium vehicles — transparent pricing, full
            inspections, and seamless shipping to your port.
          </p>
          <div className="mt-5 flex gap-3">
            {SOCIALS.map((label) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="press-scale flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600 transition-colors duration-150 hover:border-amber-500 hover:text-amber-500"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-600 transition-colors duration-150 hover:text-amber-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Contact Info
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
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

      <div className="border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Djermoun Auto. All rights reserved.
      </div>
    </footer>
  );
}
