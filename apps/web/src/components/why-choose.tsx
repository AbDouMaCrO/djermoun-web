import { ShieldCheck, MapPin, Wrench, Headphones, FileCheck, Wallet } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Secure Transactions",
    description: "Every deposit and payment is tracked and protected end-to-end.",
  },
  {
    icon: MapPin,
    title: "Global Shipping",
    description: "We export to ports worldwide with full customs documentation.",
  },
  {
    icon: Wrench,
    title: "Full Inspections",
    description: "Every vehicle passes a complete multi-point inspection before listing.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "A sales rep is with you from reservation through delivery.",
  },
  {
    icon: FileCheck,
    title: "Transparent Paperwork",
    description: "Clear titles and export documents, no hidden fees or surprises.",
  },
  {
    icon: Wallet,
    title: "Fair Pricing",
    description: "Direct sourcing means competitive prices without markup layers.",
  },
];

export default function WhyChoose() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
          Why Choose Us
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Why Choose DJERMOUN AUTO
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
