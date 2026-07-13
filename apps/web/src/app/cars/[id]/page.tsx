import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReserveButton from "./reserve-button";
import PricingBreakdown from "./pricing-breakdown";
import CustomsCalculator from "./customs-calculator";
import CarGallery from "@/components/car-gallery";
import { getSiteSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDZD(n: number) {
  return `${Math.round(n).toLocaleString()} DZD`;
}

export default async function CarDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supabase, { show_customs_calculator }] = await Promise.all([
    createClient(),
    getSiteSettings(),
  ]);

  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .eq("status", "available")
    .eq("is_visible", true)
    .single();

  if (!car) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const images: string[] = car.images ?? (car.primary_image ? [car.primary_image] : []);

  const specs: [string, unknown][] = [
    ["Make", car.make],
    ["Model", car.model],
    ["Year", car.year],
    ["Mileage", car.mileage != null ? `${car.mileage.toLocaleString()} km` : "—"],
    ["Engine", car.engine ?? "—"],
    ["Transmission", car.transmission ?? "—"],
    ["Fuel", car.fuel ?? "—"],
    ["Status", car.status],
  ];

  const fobPrice = Number(car.price_cny ?? 0);
  const commission = Number(car.commission ?? 0);
  const shipping = Number(car.shipping_cost) || 1900;
  const AUTOCANGO_FEES = 1595;
  const totalPrice = fobPrice + AUTOCANGO_FEES + commission + shipping;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">
        {car.year} {car.make} {car.model}
      </h1>
      <p className="mt-2 text-2xl font-bold text-amber-500">
        {formatPrice(car.price_usd != null ? car.price_usd : totalPrice)}
      </p>
      {car.customs_duty_dzd != null && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Algerian Customs &amp; Duties Estimate
          </p>
          {car.customs_duty_dzd === 0 ? (
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              European Origin: Exempt from Customs Duty (EUR.1)
            </span>
          ) : (
            <p className="mt-1 text-sm font-medium text-slate-700">
              Estimated Duty: {formatDZD(car.customs_duty_dzd)}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column: gallery, then specifications */}
        <div>
          <CarGallery images={images} />

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-200 py-2">
                <dt className="text-sm text-slate-600">{label}</dt>
                <dd className="text-sm font-medium text-slate-900">{String(value ?? "—")}</dd>
              </div>
            ))}
          </dl>

          {car.accessories?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Accessories</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {(car.accessories as string[]).map((item) => (
                  <li key={item} className="rounded-full border border-amber-500/40 px-3 py-1 text-xs font-medium text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column: pricing + reserve, sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PricingBreakdown fobPrice={fobPrice} commission={commission} shipping={shipping} />
          {show_customs_calculator && (
            <CustomsCalculator
              basePrice={totalPrice}
              customsDutyDzd={car.customs_duty_dzd ?? null}
              defaultDestination={car.destination_country ?? "algeria"}
            />
          )}
          <div className="mt-6">
            <ReserveButton carId={car.id} isAuthenticated={!!user} />
          </div>
        </div>
      </div>
    </main>
  );
}
