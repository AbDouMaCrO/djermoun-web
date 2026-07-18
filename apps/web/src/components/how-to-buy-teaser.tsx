import Link from "next/link";
import { HelpCircle, CreditCard, Ship, BookOpen } from "lucide-react";

const ITEMS = [
  { Icon: HelpCircle, label: "General Questions" },
  { Icon: CreditCard, label: "Payment"           },
  { Icon: Ship,       label: "Logistics"          },
  { Icon: BookOpen,   label: "Glossary"           },
];

export default function HowToBuyTeaser() {
  return (
    <section className="border-y border-slate-100 dark:border-white/5 bg-white dark:bg-[#0A0F1E] px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white">How To Buy</h2>
        <p className="mt-3 text-lg font-semibold text-amber-500">
          Key Questions Answered for How to Import Cars from China
        </p>

        <div className="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-4">
          {ITEMS.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#111827]">
                <Icon className="text-slate-700 dark:text-slate-300" size={36} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        <Link
          href="/how-to-buy"
          className="mt-12 inline-block rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-amber-500/30 dark:hover:bg-amber-500/5 dark:hover:text-amber-400 px-8 py-3 text-sm font-semibold transition-all hover:shadow-md"
        >
          Learn It Now
        </Link>
      </div>
    </section>
  );
}
