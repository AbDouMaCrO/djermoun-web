import Link from "next/link";
import {
  HelpCircle,
  CreditCard,
  Ship,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const SECTIONS = [
  {
    id: "general",
    Icon: HelpCircle,
    title: "General Questions",
    color: "bg-blue-50 text-blue-600",
    items: [
      {
        q: "Can I buy any car from China?",
        a: "Yes. We source virtually any make and model available on the Chinese market — new or used — including brands not exported through official channels.",
      },
      {
        q: "Is it legal to import a car from China?",
        a: "Absolutely. Djermoun Auto holds a state-authorized export license. Every vehicle is exported in full compliance with Chinese export regulations and your destination country's import requirements.",
      },
      {
        q: "How long does the whole process take?",
        a: "Typically 45–90 days from order confirmation to delivery at destination port, depending on vehicle availability, inspection schedule, and shipping route.",
      },
      {
        q: "Do you handle everything end-to-end?",
        a: "Yes. We cover sourcing, inspection, negotiation, export paperwork, shipping, and customs documentation. You receive a single point of contact throughout.",
      },
      {
        q: "What condition are the vehicles in?",
        a: "We offer both new (0–100 km) and used vehicles. All used vehicles undergo a professional pre-export inspection and receive a detailed English-language report.",
      },
      {
        q: "Can I request a specific color or trim level?",
        a: "Yes. We can source vehicles to your exact specification, including optional customization (language conversion, right-hand-drive adaptation, accessory installation).",
      },
    ],
  },
  {
    id: "payment",
    Icon: CreditCard,
    title: "Payment",
    color: "bg-emerald-50 text-emerald-600",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept international wire transfer (T/T), escrow services, and consolidated payments for multi-vehicle orders. We do not accept cryptocurrency or informal transfers.",
      },
      {
        q: "Is my money safe?",
        a: "We use escrow arrangements for all transactions. Funds are only released to the supplier after the vehicle passes inspection and loading is confirmed.",
      },
      {
        q: "When do I pay?",
        a: "A 30% deposit is required to confirm the order. The remaining 70% is due before the vehicle is loaded onto the vessel. For used vehicles, full payment may be required upfront depending on the source.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No. We provide a full price breakdown before you commit: FOB price, our service commission, inspection fees, and shipping cost. Nothing is added later.",
      },
      {
        q: "What currency do you use?",
        a: "All invoices are issued in USD. For Algerian clients we also provide DZD equivalents for reference, based on prevailing exchange rates.",
      },
    ],
  },
  {
    id: "logistics",
    Icon: Ship,
    title: "Logistics",
    color: "bg-amber-50 text-amber-600",
    items: [
      {
        q: "What shipping terms do you offer?",
        a: "We offer FOB (Free On Board) and CIF (Cost, Insurance, Freight). CIF is recommended for most clients — it includes marine insurance and freight to destination port.",
      },
      {
        q: "Which ports do you ship to?",
        a: "We ship to all major ports including Algiers, Oran, Jijel, Annaba (Algeria), Tunis, Radès (Tunisia), Jebel Ali (UAE), and many others on request.",
      },
      {
        q: "How do you ship the vehicles?",
        a: "Vehicles are shipped in sealed 40-foot containers (1–2 cars per container) or via RoRo (Roll-on/Roll-off) vessels depending on the route and client preference.",
      },
      {
        q: "Do you provide tracking?",
        a: "Yes. Once the vessel departs, we provide the Bill of Lading and vessel tracking details so you can monitor shipment progress in real time.",
      },
      {
        q: "What happens at the destination port?",
        a: "We prepare and send all customs clearance documents in advance. We can also recommend local clearing agents at most destination ports.",
      },
      {
        q: "Is the vehicle insured during shipping?",
        a: "Under CIF terms, marine cargo insurance is included. Under FOB terms, you are responsible for arranging your own insurance from the loading port.",
      },
    ],
  },
  {
    id: "glossary",
    Icon: BookOpen,
    title: "Glossary",
    color: "bg-purple-50 text-purple-600",
    items: [
      {
        q: "FOB – Free On Board",
        a: "The seller's responsibility ends when the vehicle is loaded onto the vessel at the Chinese port. The buyer pays freight and insurance from that point.",
      },
      {
        q: "CIF – Cost, Insurance & Freight",
        a: "The seller covers the cost of the vehicle, marine insurance, and freight to the destination port. Most common for first-time importers.",
      },
      {
        q: "Bill of Lading (B/L)",
        a: "The official shipping document issued by the carrier. It is the title document for the vehicle and required to clear customs at the destination port.",
      },
      {
        q: "RoRo – Roll-on/Roll-off",
        a: "A shipping method where vehicles are driven onto and off the vessel under their own power. Cheaper than container shipping but offers less protection.",
      },
      {
        q: "T/T – Telegraphic Transfer",
        a: "An international bank wire transfer. The most common payment method for vehicle imports from China.",
      },
      {
        q: "Pre-Shipment Inspection (PSI)",
        a: "A third-party quality check conducted before the vehicle leaves China. We use licensed inspection agencies and provide the full report in English.",
      },
      {
        q: "Customs Duty",
        a: "Tax levied by your country on the imported vehicle, calculated as a percentage of the vehicle's customs value. Rates vary by country and vehicle type.",
      },
      {
        q: "M Centimes (Millions de centimes)",
        a: "Algerian informal price unit. 1 million centimes = 10,000 DZD. All prices on this platform are shown in M centimes for local convenience.",
      },
    ],
  },
];

export default function HowToBuyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0F1E]">
      {/* Hero */}
      <div className="bg-white border-b border-slate-100 px-6 py-16 text-center dark:bg-[#0A0F1E] dark:border-white/5">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-amber-500"
        >
          ← Back to inventory
        </Link>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white">How To Buy</h1>
        <p className="mt-4 text-xl font-semibold text-amber-500">
          Key Questions Answered for How to Import Cars from China
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500">
          Everything you need to know about sourcing, paying for, and receiving your vehicle — explained clearly.
        </p>

        {/* Jump links */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {SECTIONS.map(({ id, Icon, title }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-amber-400 hover:text-amber-600 dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-amber-500/50 dark:hover:text-amber-400"
            >
              <Icon size={15} />
              {title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-4xl space-y-16 px-6 py-16">
        {SECTIONS.map(({ id, Icon, title, color, items }) => (
          <section key={id} id={id} className="scroll-mt-8">
            <div className="mb-8 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            </div>

            <div className="space-y-4">
              {items.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111827]"
                >
                  <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-6 py-5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{q}</span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-slate-400 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="border-t border-slate-100 px-6 py-5 text-sm leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-400">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="border-t border-slate-100 bg-white px-6 py-16 text-center dark:border-white/5 dark:bg-[#0A0F1E]">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to get started?</h3>
        <p className="mt-2 text-sm text-slate-500">Browse our live inventory and find your next vehicle.</p>
        <Link
          href="/#inventory"
          className="mt-6 inline-block rounded-full bg-amber-500 px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
        >
          Browse Inventory
        </Link>
      </div>
    </main>
  );
}
