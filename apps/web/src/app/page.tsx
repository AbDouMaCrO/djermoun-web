import { createClient } from "@/utils/supabase/server";
import Hero from "@/components/hero";
import CarCard, { type CarCardData } from "@/components/car-card";
import WhyChoose from "@/components/why-choose";
import HowItWorks from "@/components/how-it-works";
import ExportSolutions from "@/components/export-solutions";
import Pagination from "@/components/Pagination";
import FilterBar from "@/components/filter-bar";
import BrandPicker, { KNOWN_MAKES } from "@/components/brand-picker";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const DZD_RATE = 240;
const AUTOCANGO_FEES = 1595;
const DEFAULT_SHIPPING = 1900;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    make?: string;
    model?: string;
    year?: string;
    page?: string;
    tab?: string;
    minMc?: string;
    maxMc?: string;
    wasla?: string;
    fuel?: string;
  }>;
}) {
  const {
    make, model, year, page: pageParam, tab,
    minMc: minMcParam, maxMc: maxMcParam, wasla: waslaParam, fuel: fuelParam,
  } = await searchParams;

  const condition = tab === "new" ? "new" : tab === "used" ? "used" : null;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const minMc = Math.max(0, Number(minMcParam ?? 150));
  const maxMc = Math.max(0, Number(maxMcParam ?? 250));
  const wasla = waslaParam === "1";
  const fuel = fuelParam ?? "";

  const overhead = AUTOCANGO_FEES + (wasla ? DEFAULT_SHIPPING : 0);
  const minUsd = Math.max(0, Math.round((minMc * 10_000) / DZD_RATE - overhead));
  const maxUsd = Math.round((maxMc * 10_000) / DZD_RATE - overhead);

  const supabase = await createClient();

  const { data: allMeta } = await supabase
    .from("cars")
    .select("make, year")
    .eq("status", "available")
    .eq("is_visible", true);

  const makes = [...new Set((allMeta ?? []).map((c) => c.make))].sort();
  const years = [...new Set((allMeta ?? []).map((c) => c.year))].sort((a, b) => b - a);

  let query = supabase
    .from("cars")
    .select(
      "id, make, model, year, mileage, fuel, price_cny, commission, shipping_cost, primary_image, created_at, condition",
      { count: "exact" },
    )
    .eq("status", "available")
    .eq("is_visible", true)
    .gte("price_cny", minUsd)
    .lte("price_cny", maxUsd)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (condition) query = query.eq("condition", condition);
  if (make === "__other__") query = query.not("make", "in", `(${KNOWN_MAKES.join(",")})`);
  else if (make) query = query.eq("make", make);
  if (model) query = query.ilike("model", `%${model}%`);
  if (year)  query = query.eq("year", parseInt(year, 10));
  if (fuel)  query = query.ilike("fuel", `%${fuel}%`);

  const { data, error, count } = await query;

  const cars = (data as CarCardData[] | null) ?? [];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Params kept across tab / filter changes
  const sharedParams = Object.fromEntries(
    Object.entries({ make, model, year, minMc: minMcParam, maxMc: maxMcParam, wasla: waslaParam, fuel: fuelParam })
      .filter(([, v]) => v != null),
  ) as Record<string, string>;

  const filterCurrentParams = Object.fromEntries(
    Object.entries({ make, model, year, tab }).filter(([, v]) => v != null),
  ) as Record<string, string>;

  const brandPickerParams = Object.fromEntries(
    Object.entries({ tab, minMc: minMcParam, maxMc: maxMcParam, wasla: waslaParam, fuel: fuelParam })
      .filter(([, v]) => v != null),
  ) as Record<string, string>;

  function tabHref(t: string) {
    const params = new URLSearchParams(sharedParams);
    if (t !== "all") params.set("tab", t); else params.delete("tab");
    params.delete("page");
    const qs = params.toString();
    return `/#inventory${qs ? `?${qs}` : ""}`;
  }

  const activeTab = tab === "new" ? "new" : tab === "used" ? "used" : "all";

  return (
    <main>
      <Hero makes={makes} years={years} defaultMake={make} defaultModel={model} defaultYear={year} />

      <section id="inventory" className="mx-auto max-w-7xl px-6 pb-20 pt-36">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">Inventory</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Exceptional Vehicles</h2>
        </div>

        {/* Brand picker */}
        <BrandPicker currentMake={make} extraParams={brandPickerParams} />

        {/* Condition tabs */}
        <div className="mt-8 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 w-fit">
          {(["all", "new", "used"] as const).map((t) => (
            <a
              key={t}
              href={tabHref(t)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-colors duration-150 ${
                activeTab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "all" ? "All Cars" : t === "new" ? "New Cars" : "Used Cars"}
            </a>
          ))}
        </div>

        {/* Price + Fuel filter */}
        <FilterBar
          initialMin={minMc}
          initialMax={maxMc}
          initialWasla={wasla}
          initialFuel={fuel}
          currentParams={filterCurrentParams}
        />

        {error && (
          <p className="mt-6 text-sm text-red-400">Failed to load cars: {error.message}</p>
        )}

        {cars.length === 0 && !error && (
          <p className="mt-6 text-sm text-slate-600">No vehicles match your filters.</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={Object.fromEntries(
            Object.entries({ make, model, year, tab, minMc: minMcParam, maxMc: maxMcParam, wasla: waslaParam, fuel: fuelParam })
              .filter(([, v]) => v != null),
          ) as Record<string, string>}
        />
      </section>

      <HowItWorks />

      <ExportSolutions />

      <WhyChoose />
    </main>
  );
}
