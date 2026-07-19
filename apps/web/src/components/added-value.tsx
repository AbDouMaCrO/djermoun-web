import {
  ShieldCheck,
  Settings2,
  Navigation,
  Layers,
  Wrench,
  Globe,
  Zap,
  Music2,
} from "lucide-react";

const SERVICES = [
  {
    icon: ShieldCheck,
    title: "Full Inspection",
    description: "Comprehensive pre-delivery inspection by certified technicians",
  },
  {
    icon: Settings2,
    title: "Wheels & Tires",
    description: "Premium rim and tire upgrade to your specification",
  },
  {
    icon: Navigation,
    title: "Navigation System",
    description: "Factory-grade GPS and navigation unit installation",
  },
  {
    icon: Layers,
    title: "Tinted Windows",
    description: "Professional ceramic window tint for privacy and UV protection",
  },
  {
    icon: Wrench,
    title: "Car Customization",
    description: "Interior and exterior custom upgrades tailored to your taste",
  },
  {
    icon: Globe,
    title: "System Translation",
    description: "Full English translation of the car's infotainment and menus",
  },
  {
    icon: Zap,
    title: "Electric Trunk",
    description: "Motorized power liftgate retrofit for smart hands-free access",
  },
  {
    icon: Music2,
    title: "Premium Sound System",
    description: "High-fidelity audio system upgrade and installation",
  },
  {
    icon: Layers,
    title: "Paint Protective Film",
    description: "PPF clear bra to preserve your paintwork from chips and scratches",
  },
];

export default function AddedValue() {
  return (
    <section className="bg-white dark:bg-[#0A0F1E] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Added Value
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
            We Go Beyond the Car
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Every vehicle you purchase through Djermoun Auto comes with access to our premium
            customization and preparation services — so you drive home exactly the car you want.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border border-slate-100 bg-slate-50 rounded-2xl p-6 dark:border-white/5 dark:bg-[#111827]"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
                <Icon size={22} className="text-amber-500" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-16 rounded-2xl bg-amber-500 px-8 py-10 text-center">
          <h3 className="text-xl font-black text-black">Interested in any of these services?</h3>
          <p className="mt-2 text-sm text-black/70">
            Contact us when placing your order and we&apos;ll include everything in one shipment.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-block rounded-full bg-black px-8 py-3 text-sm font-bold text-white hover:bg-black/80 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
