import { createClient } from "@/utils/supabase/server";
import Hero from "@/components/hero";
import CarCard, { type CarCardData } from "@/components/car-card";
import WhyChoose from "@/components/why-choose";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string; year?: string }>;
}) {
  const { make, model, year } = await searchParams;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select(
      "id, make, model, year, mileage, fuel, price_cny, commission, shipping_cost, primary_image, created_at",
    )
    .eq("status", "available")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  const allCars = (data as CarCardData[] | null) ?? [];

  const makes = [...new Set(allCars.map((c) => c.make))].sort();
  const years = [...new Set(allCars.map((c) => c.year))].sort((a, b) => b - a);

  const cars = allCars.filter(
    (c) =>
      (!make || c.make === make) &&
      (!model || c.model.toLowerCase().includes(model.toLowerCase())) &&
      (!year || String(c.year) === year),
  );

  return (
    <main>
      <Hero makes={makes} years={years} defaultMake={make} defaultModel={model} defaultYear={year} />

      <section id="inventory" className="mx-auto max-w-7xl px-6 pb-20 pt-36">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              Inventory
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Exceptional Vehicles</h2>
          </div>
          <a
            href="#inventory"
            className="hidden text-sm font-medium text-amber-500 transition-colors duration-150 hover:text-amber-400 sm:block"
          >
            View all vehicles →
          </a>
        </div>

        {error && (
          <p className="mt-6 text-sm text-red-400">Failed to load cars: {error.message}</p>
        )}

        {cars.length === 0 && !error && (
          <p className="mt-6 text-sm text-slate-600">No vehicles match your search.</p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      <WhyChoose />
    </main>
  );
}
