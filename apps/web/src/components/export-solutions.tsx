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
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
          What We Offer
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Comprehensive Car Export Solutions
        </h2>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 transition-colors group-hover:bg-amber-100">
              <Icon className="text-amber-500" size={22} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
