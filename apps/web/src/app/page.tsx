import { createClient } from "@/utils/supabase/server";
import Hero from "@/components/hero";
import CarCard, { type CarCardData } from "@/components/car-card";
import WhyChoose from "@/components/why-choose";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string; year?: string; page?: string }>;
}) {
  const { make, model, year, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Separate query for filter dropdowns — must see all makes/years, not just current page
  const { data: allMeta } = await supabase
    .from("cars")
    .select("make, year")
    .eq("status", "Available")
    .eq("is_visible", true);

  const makes = [...new Set((allMeta ?? []).map((c) => c.make))].sort();
  const years = [...new Set((allMeta ?? []).map((c) => c.year))].sort((a, b) => b - a);

  // Paginated + filtered query
  let query = supabase
    .from("cars")
    .select(
      "id, make, model, year, mileage, fuel, price_cny, commission, shipping_cost, primary_image, created_at",
      { count: "exact" },
    )
    .eq("status", "Available")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (make) query = query.eq("make", make);
  if (model) query = query.ilike("model", `%${model}%`);
  if (year) query = query.eq("year", parseInt(year, 10));

  const { data, error, count } = await query;

  const cars = (data as CarCardData[] | null) ?? [];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Pass current filters through to pagination links
  const paginationParams = Object.fromEntries(
    Object.entries({ make, model, year }).filter(([, v]) => v != null),
  ) as Record<string, string>;

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

        <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={paginationParams} />
      </section>

      <WhyChoose />
    </main>
  );
}
