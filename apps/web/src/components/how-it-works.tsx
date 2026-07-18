import {
  Search,
  Mail,
  Handshake,
  CreditCard,
  Ship,
  Car,
  Sparkles,
  Receipt,
  MessagesSquare,
  Globe,
  Truck,
  BadgeDollarSign,
} from "lucide-react";

const STEPS = [
  { label: "Search",    Icon: Search     },
  { label: "Inquire",   Icon: Mail       },
  { label: "Negotiate", Icon: Handshake  },
  { label: "Payment",   Icon: CreditCard },
  { label: "Shipment",  Icon: Ship       },
  { label: "Pickup",    Icon: Car        },
];

const FEATURES = [
  {
    Icon: Sparkles,
    title: "Effortless Car Sourcing",
    desc: "Smooth experience from search to delivery.",
  },
  {
    Icon: Receipt,
    title: "Transparent Price Breakdown",
    desc: "Clear, detailed pricing with no hidden fees.",
  },
  {
    Icon: MessagesSquare,
    title: "Pro Negotiation",
    desc: "Save big with our expert negotiation.",
  },
  {
    Icon: Globe,
    title: "Nationwide Network",
    desc: "Fast response times with extensive coverage and expert sourcing team at Djermoun Auto.",
  },
  {
    Icon: Truck,
    title: "Source Any Vehicle",
    desc: "We support all types of cars.",
  },
  {
    Icon: BadgeDollarSign,
    title: "Fair Service Fees",
    desc: "Reliable support at a competitive price.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#050B18] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Our Process
          </p>
          <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Professional Used Car Export Services
          </h2>
        </div>

        {/* Steps */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-0">
          {STEPS.map(({ label, Icon }, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-2 px-3 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-amber-500/60">
                  Step{i + 1}
                </span>
                <div className="w-16 h-16 rounded-full border-2 border-amber-500/40 bg-[#0A0F1E] flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                  <Icon className="text-amber-500" size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-300">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <svg
                  className="mx-1 shrink-0 text-amber-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-[#0A0F1E] p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Icon className="text-amber-500" size={22} />
              </div>
              <h3 className="mt-4 font-bold text-white">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
