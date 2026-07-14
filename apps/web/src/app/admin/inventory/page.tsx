import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import VisibilityToggle from "./visibility-toggle";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  price_cny: number | null;
  commission: number | null;
  shipping_cost: number | null;
  is_visible: boolean | null;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();
  const { data, error, count } = await supabase
    .from("cars")
    .select("id, make, model, year, status, price_cny, commission, shipping_cost, is_visible", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const cars = (data as Car[] | null) ?? [];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vehicle Inventory</h1>
          <p className="mt-1 text-sm text-slate-600">
            Base price, commission, and shipping cost roll up into the customer-facing final price.
          </p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
        >
          + Add Listing
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">Failed to load cars: {error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-white text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Make</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Base Price</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Shipping</th>
              <th className="px-4 py-3">Final Price</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {cars.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                  No vehicles in inventory.
                </td>
              </tr>
            )}
            {cars.map((car) => {
              const base = Number(car.price_cny ?? 0);
              const commission = Number(car.commission ?? 0);
              const shipping = Number(car.shipping_cost ?? 0);
              const finalPrice = base + commission + shipping;
              const isVisible = car.is_visible ?? true;

              return (
                <tr key={car.id} className={isVisible ? "" : "opacity-40"}>
                  <td className="px-4 py-3 font-medium text-slate-900">{car.make}</td>
                  <td className="px-4 py-3 text-slate-700">{car.model}</td>
                  <td className="px-4 py-3 text-slate-700">{car.year}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {car.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatPrice(base)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatPrice(commission)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatPrice(shipping)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {formatPrice(finalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <VisibilityToggle carId={car.id} isVisible={isVisible} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inventory/${car.id}`}
                      className="font-medium text-amber-500 hover:text-amber-400"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </main>
  );
}
