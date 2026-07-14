"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCar } from "@/app/actions/inventory";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500";
const selectClass = inputClass;

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">{title}</h2>
      {children}
    </div>
  );
}

function num(s: string): number | null {
  const n = Number(s.trim());
  return s.trim() === "" || !Number.isFinite(n) ? null : n;
}

function parseLines(s: string): string[] {
  return s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
}

export default function CarCreateForm() {
  const router = useRouter();

  // Specs
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [title, setTitle] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [engine, setEngine] = useState("");
  const [color, setColor] = useState("");

  // Financials
  const [fobPrice, setFobPrice] = useState("");
  const [commission, setCommission] = useState("0");
  const [shipping, setShipping] = useState("1900");
  const [dutyDzd, setDutyDzd] = useState("");
  const [destination, setDestination] = useState("algeria");

  // Media
  const [primaryImage, setPrimaryImage] = useState("");
  const [imagesText, setImagesText] = useState("");

  // Content
  const [accessoriesText, setAccessoriesText] = useState("");

  // Links
  const [sourceUrl, setSourceUrl] = useState("");
  const [autohomeUrl, setAutohomeUrl] = useState("");

  // Settings
  const [status, setStatus] = useState("available");
  const [isVisible, setIsVisible] = useState(true);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice =
    (Number(fobPrice) || 0) + (Number(commission) || 0) + (Number(shipping) || 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const images = parseLines(imagesText);
    const primary = primaryImage.trim() || images[0] || null;

    const result = await createCar({
      make: make.trim().toUpperCase(),
      model: model.trim().toUpperCase(),
      year: Number(year),
      title: title.trim() || null,
      mileage: num(mileage),
      fuel: fuel.trim() || null,
      fuel_type: fuel.trim() || null,
      transmission: transmission.trim() || null,
      engine: engine.trim() || null,
      exterior_color: color.trim() || null,
      price_cny: num(fobPrice),
      commission: Number(commission) || 0,
      shipping_cost: Number(shipping) || 0,
      customs_duty_dzd: num(dutyDzd),
      destination_country: destination,
      primary_image: primary,
      images,
      accessories: parseLines(accessoriesText),
      source_url: sourceUrl.trim() || null,
      autohome_url: autohomeUrl.trim() || null,
      status,
      is_visible: isVisible,
    });

    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/admin/inventory/${result.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Specs */}
        <Section title="Car Specs">
          <Field label="Make">
            <input required value={make} onChange={(e) => setMake(e.target.value)} placeholder="TANK" className={inputClass} />
          </Field>
          <Field label="Model">
            <input required value={model} onChange={(e) => setModel(e.target.value)} placeholder="400" className={inputClass} />
          </Field>
          <Field label="Year">
            <input required type="number" min={2000} max={2030} value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Listing Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="2024 Tank 400 2.0T PHEV" className={inputClass} />
          </Field>
          <Field label="Mileage (km)">
            <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="25000" className={inputClass} />
          </Field>
          <Field label="Fuel Type">
            <input value={fuel} onChange={(e) => setFuel(e.target.value)} placeholder="PHEV / Petrol / EV" className={inputClass} />
          </Field>
          <Field label="Transmission">
            <input value={transmission} onChange={(e) => setTransmission(e.target.value)} placeholder="DCT / CVT / AT" className={inputClass} />
          </Field>
          <Field label="Engine">
            <input value={engine} onChange={(e) => setEngine(e.target.value)} placeholder="2.0T 252HP L4" className={inputClass} />
          </Field>
          <Field label="Exterior Color">
            <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Black" className={inputClass} />
          </Field>
        </Section>

        {/* Financials */}
        <div className="flex flex-col gap-6">
          <Section title="Financials">
            <Field label="FOB Price (USD)">
              <input required type="number" value={fobPrice} onChange={(e) => setFobPrice(e.target.value)} placeholder="36000" className={inputClass} />
            </Field>
            <Field label="Commission (USD)">
              <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Shipping Cost (USD)">
              <input type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Algerian Customs Duty (DZD)" hint="Leave blank to auto-estimate">
              <input type="number" value={dutyDzd} onChange={(e) => setDutyDzd(e.target.value)} placeholder="auto" className={inputClass} />
            </Field>
            <Field label="Destination">
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className={selectClass}>
                <option value="algeria">Algeria</option>
                <option value="uae">UAE</option>
                <option value="tunisia">Tunisia</option>
              </select>
            </Field>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500">Total Customer Price</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalPrice > 0
                  ? new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalPrice)
                  : "—"}
              </p>
            </div>
          </Section>

          <Section title="Settings">
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">Visible on public site</span>
            </label>
          </Section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Media */}
        <Section title="Images">
          <Field label="Primary Image URL">
            <input
              type="url"
              value={primaryImage}
              onChange={(e) => setPrimaryImage(e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
          {primaryImage && (
            <img src={primaryImage} alt="preview" className="h-32 w-full rounded-lg object-cover" />
          )}
          <Field label="All Image URLs" hint="One URL per line or comma-separated">
            <textarea
              rows={5}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder={"https://…\nhttps://…"}
              className={inputClass}
            />
          </Field>
        </Section>

        {/* Content + Links */}
        <div className="flex flex-col gap-6">
          <Section title="Accessories">
            <Field label="Accessories" hint="One per line or comma-separated">
              <textarea
                rows={5}
                value={accessoriesText}
                onChange={(e) => setAccessoriesText(e.target.value)}
                placeholder={"Sun Roof\nLeather Seat\nABS\nAirbag"}
                className={inputClass}
              />
            </Field>
          </Section>

          <Section title="Source Links">
            <Field label="AutoCango URL">
              <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://www.autocango.com/sku/…" className={inputClass} />
            </Field>
            <Field label="AutoHome URL">
              <input type="url" value={autohomeUrl} onChange={(e) => setAutohomeUrl(e.target.value)} placeholder="https://global.che168.com/…" className={inputClass} />
            </Field>
          </Section>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={pending}
          className="press-scale rounded-md bg-amber-500 px-8 py-3 text-base font-bold text-black transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create Listing"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/inventory")}
          className="rounded-md border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
