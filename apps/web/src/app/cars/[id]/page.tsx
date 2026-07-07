import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReserveButton from "./reserve-button";
import PricingBreakdown from "./pricing-breakdown";
import CustomsCalculator from "./customs-calculator";
import CarGallery from "@/components/car-gallery";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function CarDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  // Hidden cars are not publicly reachable, even by direct link.
  if (!car || car.is_visible === false) notFound();

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
  const shipping = Number(car.shipping_cost ?? 0);
  const totalPrice = fobPrice + commission + shipping;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">
        {car.year} {car.make} {car.model}
      </h1>
      <p className="mt-2 text-2xl font-bold text-amber-500">{formatPrice(totalPrice)}</p>

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
        </div>

        {/* Right column: pricing + reserve, sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PricingBreakdown fobPrice={fobPrice} commission={commission} shipping={shipping} />
          <CustomsCalculator basePrice={totalPrice} />
          <div className="mt-6">
            <ReserveButton carId={car.id} isAuthenticated={!!user} />
          </div>
        </div>
      </div>
    </main>
  );
}
