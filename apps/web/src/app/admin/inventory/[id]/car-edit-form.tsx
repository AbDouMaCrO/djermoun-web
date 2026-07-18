"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { updateCarDetails } from "@/app/actions/inventory";

type Car = {
  id: string;
  title: string | null;
  make: string;
  model: string;
  year: number;
  mileage: number | null;
  fuel: string | null;
  price_cny: number | null;
  commission: number | null;
  shipping_cost: number | null;
  source_url: string | null;
  autohome_url: string | null;
  destination_country: string | null;
  condition: string;
  paint_condition: string | null;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function LinkedLabel({ label, url }: { label: string; url: string }) {
  const valid = /^https?:\/\//i.test(url.trim());
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {valid && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-500 hover:text-amber-400"
          aria-label={`Open ${label} in a new tab`}
        >
          <ExternalLink size={14} />
        </a>
      )}
    </span>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function CarEditForm({ car }: { car: Car }) {
  const router = useRouter();
  const [title, setTitle] = useState(car.title ?? "");
  const [make, setMake] = useState(car.make);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(String(car.year));
  const [mileage, setMileage] = useState(car.mileage != null ? String(car.mileage) : "");
  const [fuel, setFuel] = useState(car.fuel ?? "");
  const [fobPrice, setFobPrice] = useState(car.price_cny != null ? String(car.price_cny) : "");
  const [commission, setCommission] = useState(String(car.commission ?? 0));
  const [shippingCost, setShippingCost] = useState(String(car.shipping_cost || 1900));
  const [sourceUrl, setSourceUrl] = useState(car.source_url ?? "");
  const [autohomeUrl, setAutohomeUrl] = useState(car.autohome_url ?? "");
  const [destinationCountry, setDestinationCountry] = useState(car.destination_country ?? "algeria");
  const [condition, setCondition] = useState(car.condition ?? "used");
  const [paintCondition, setPaintCondition] = useState(car.paint_condition ?? "");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const totalPrice = (Number(fobPrice) || 0) + (Number(commission) || 0) + (Number(shippingCost) || 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await updateCarDetails(car.id, {
      title: title.trim() || null,
      make,
      model,
      year: Number(year),
      mileage: mileage.trim() === "" ? null : Number(mileage),
      fuel: fuel.trim() || null,
      price_cny: fobPrice.trim() === "" ? null : Number(fobPrice),
      commission: Number(commission) || 0,
      shipping_cost: Number(shippingCost) || 0,
      source_url: sourceUrl.trim() || null,
      autohome_url: autohomeUrl.trim() || null,
      destination_country: destinationCountry,
      condition,
      paint_condition: paintCondition || null,
    });

    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setToast(true);
    setTimeout(() => router.push("/admin/inventory"), 900);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-4xl">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
            Car Specs
          </h2>
          <Field label="Listing Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2025 Geely Emgrand 1.5L CVT"
              className={inputClass}
            />
          </Field>
          <Field label="Make">
            <input required value={make} onChange={(e) => setMake(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Model">
            <input required value={model} onChange={(e) => setModel(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Year">
            <input
              type="number"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Mileage (km)">
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Fuel Type">
            <input value={fuel} onChange={(e) => setFuel(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
            Financials
          </h2>
          <Field label="FOB Price (USD)">
            <input
              type="number"
              value={fobPrice}
              onChange={(e) => setFobPrice(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Your Commission (USD)">
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Shipping Cost (USD)">
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Condition">
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
              <option value="used">Used</option>
              <option value="new">New</option>
            </select>
          </Field>
          <Field label="Paint Condition">
            <select value={paintCondition} onChange={(e) => setPaintCondition(e.target.value)} className={inputClass}>
              <option value="">— Not specified —</option>
              <option value="original_paint">Original Paint</option>
              <option value="with_paint_minor_accident">With Paint (Minor Accident)</option>
            </select>
          </Field>
          <Field label="Destination Country">
            <select
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className={inputClass}
            >
              <option value="algeria">Algeria</option>
              <option value="uae">UAE</option>
              <option value="tunisia">Tunisia</option>
            </select>
          </Field>

          <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-500">
              Total Customer Price
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{formatPrice(totalPrice)}</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <LinkedLabel label="AutoCango URL" url={sourceUrl} />
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.autocango.com/sku/..."
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <LinkedLabel label="AutoHome URL" url={autohomeUrl} />
            <input
              type="url"
              value={autohomeUrl}
              onChange={(e) => setAutohomeUrl(e.target.value)}
              placeholder="https://global.che168.com/en/detail/..."
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="press-scale mt-8 w-full rounded-md bg-amber-500 px-6 py-3 text-base font-bold text-black transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 shadow-lg">
          Vehicle details saved.
        </div>
      )}
    </form>
  );
}
