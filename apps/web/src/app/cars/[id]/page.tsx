import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReserveButton from "./reserve-button";
import PricingBreakdown from "./pricing-breakdown";
import CustomsCalculator from "./customs-calculator";
import CarGallery from "@/components/car-gallery";
import CarPriceHeading from "./car-price-heading";
import { getSiteSettings } from "@/app/actions/settings";
import { AUTOCANGO_FEES_TOTAL } from "@/lib/fees";

export const dynamic = "force-dynamic";

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
    ["Paint", car.paint_condition === "original_paint" ? "Original Paint"
           : car.paint_condition === "with_paint_minor_accident" ? "With Paint (Minor Accident)"
           : null],
    ["Status", car.status],
  ].filter(([, v]) => v != null) as [string, unknown][];

  const fobPrice = Number(car.price_cny ?? 0);
  const commission = Number(car.commission ?? 0);
  const shipping = Number(car.shipping_cost) || 1900;
  const totalPrice = fobPrice + AUTOCANGO_FEES_TOTAL + commission + shipping;

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const waMsg = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par ${car.year} ${car.make} ${car.model}.\nPouvez-vous me donner plus d'informations ?`
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-baseline justify-between gap-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          {car.year} {car.make} {car.model}
        </h1>
        <CarPriceHeading totalUSD={totalPrice} />
      </div>

      {car.customs_duty_dzd != null && (
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Algerian Customs &amp; Duties Estimate
          </p>
          {car.customs_duty_dzd === 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              European Origin: Exempt (EUR.1)
            </span>
          ) : (
            <p className="text-sm font-medium text-slate-700">
              ~{Math.floor(Number(car.customs_duty_dzd) / 10_000)} millions centimes
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: gallery + specs */}
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

        {/* Right: pricing + CTA, sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PricingBreakdown fobPrice={fobPrice} commission={commission} shipping={shipping} />

          {show_customs_calculator && (
            <CustomsCalculator
              basePrice={totalPrice}
              customsDutyDzd={car.customs_duty_dzd ?? null}
              defaultDestination={car.destination_country ?? "algeria"}
            />
          )}

          {/* CTA block */}
          <div className="mt-6 space-y-3">
            <ReserveButton carId={car.id} isAuthenticated={!!user} />

            {waNumber && (
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${waNumber}?text=${waMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                >
                  {WA_ICON}
                  Message
                </a>
                <a
                  href={`tel:+${waNumber}`}
                  className="flex items-center justify-center gap-2 rounded-md border-2 border-green-500 px-4 py-3 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 shrink-0" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Appeler
                </a>
              </div>
            )}

            <p className="text-center text-xs text-slate-400">
              Réponse garantie sous 24h · Import direct Chine
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
