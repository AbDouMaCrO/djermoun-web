import Link from "next/link";
import { ArrowRight, ShieldCheck, Globe, Users } from "lucide-react";

const STATS = [
  { value: "4,800+", label: "Shipping Routes" },
  { value: "100%",   label: "Licensed & Authorized" },
  { value: "10+",    label: "Years Experience" },
  { value: "50+",    label: "Countries Served" },
];

export default function AboutSection() {
  return (
    <>
      {/* About panel */}
      <section className="border-t border-slate-100 bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              Who We Are
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900">
              About Djermoun Auto
            </h2>
            <p className="mt-2 text-lg font-semibold text-slate-500">
              Your Reliable Chinese Car Import Partner
            </p>
            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              Djermoun Auto connects buyers across North Africa and the Middle East with
              the full spectrum of vehicles available in China — new and used. We handle
              every step: sourcing, professional inspection, negotiation, export
              licensing, international shipping, and customs documentation.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Our team operates directly from China with decades of combined experience
              in automotive export, giving you unmatched access and competitive pricing
              that no local dealer can match.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { Icon: ShieldCheck, label: "State-Authorized Export License" },
                { Icon: Globe,       label: "CIF Worldwide Shipping"          },
                { Icon: Users,       label: "Dedicated Account Manager"       },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  <Icon size={14} className="text-amber-500" />
                  {label}
                </div>
              ))}
            </div>

            <Link
              href="/about-us"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
            >
              Learn More <ArrowRight size={15} />
            </Link>
          </div>

          {/* Right — stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center shadow-sm"
              >
                <p className="text-4xl font-black text-amber-500">{value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <div className="bg-slate-900 px-6 py-14 text-center">
        <h3 className="text-3xl font-black text-white">
          Start Your Journey Now{" "}
          <span className="text-amber-400">@Djermoun Auto</span>
        </h3>
        <p className="mt-2 text-slate-400">
          Discover China&rsquo;s Leading Auto Export Platform
        </p>
        <Link
          href="/#inventory"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
        >
          Browse Inventory <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
