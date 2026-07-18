import {
  MapPinned,
  ClipboardCheck,
  Banknote,
  Wrench,
  Languages,
  Container,
  BadgeCheck,
  Ship,
  FileText,
} from "lucide-react";

const SOLUTIONS = [
  {
    Icon: MapPinned,
    title: "Chinawide Vehicle Sourcing",
    desc: "Source any vehicle from across China. We connect you with trusted source to find the right car for your needs.",
  },
  {
    Icon: ClipboardCheck,
    title: "Professional Vehicle Inspection",
    desc: "Ensure quality with professional inspections agencies. Receive a detailed, transparent report in English for complete peace of mind.",
  },
  {
    Icon: Banknote,
    title: "Flexible Payment Solutions",
    desc: "Flexible and secure payment options, including escrow and consolidated payments, to simplify large-value transactions.",
  },
  {
    Icon: Wrench,
    title: "Vehicle Customization",
    desc: "Modify and recondition vehicles to your exact specifications, from mechanical upgrades to aesthetic changes.",
  },
  {
    Icon: Languages,
    title: "Language & System Conversion",
    desc: "Language change services for car systems to suit your market.",
  },
  {
    Icon: Container,
    title: "Nationwide Port Consolidation",
    desc: "Seamless nationwide transport and containerization from the source to any major Chinese port for export.",
  },
  {
    Icon: BadgeCheck,
    title: "State-Authorized Car Export License",
    desc: "Fully licensed and state-authorized export services ensuring every vehicle meets all legal and customs requirements for export from China.",
  },
  {
    Icon: Ship,
    title: "Global Shipping & Freight",
    desc: "Access to a vast network of over 4,800 maritime and road shipping routes from China. We offer competitive rates with service up to CIF.",
  },
  {
    Icon: FileText,
    title: "Customs Clearing Documentation",
    desc: "Standardized and customizable export documentation packages prepared to meet your destination country's import regulations.",
  },
];

export default function ExportSolutions() {
  return (
    <section className="bg-white dark:bg-[#050B18] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            What We Offer
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
            Comprehensive Car Export Solutions
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-50/20 hover:shadow-md dark:border-white/5 dark:bg-[#0A0F1E] dark:hover:border-amber-500/20 dark:hover:bg-[#111827]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 transition-colors group-hover:bg-amber-100 dark:bg-amber-500/10 dark:group-hover:bg-amber-500/15">
                <Icon className="text-amber-500" size={22} />
              </div>
              <h3 className="mt-5 font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
