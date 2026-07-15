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
              ~{Math.floor(Number(car.customs_duty_dzd) / 10_000)} millions centimes
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                ({formatDZD(car.customs_duty_dzd)})
              </span>
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

          {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hi, I'm interested in the ${car.year} ${car.make} ${car.model}.\nCan you provide more details?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-md border border-green-200 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Ask about this car on WhatsApp
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
