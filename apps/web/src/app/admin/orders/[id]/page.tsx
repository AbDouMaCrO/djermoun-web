import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import ClientDocuments, { type ClientDoc } from "./client-documents";

export const dynamic = "force-dynamic";

type Order = {
  id: string;
  status: string;
  user_id: string | null;
  total_price: number | null;
  created_at: string;
  full_name: string | null;
  cars: { make: string; model: string; year: number } | null;
  users: { email: string | null } | null;
};

function formatUSD(price: number | null) {
  if (price == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, user_id, total_price, created_at, full_name, cars(make, model, year), users(email)",
    )
    .eq("id", id)
    .single<Order>();

  if (!order) notFound();

  const { data: docsData } = await supabase
    .from("user_documents")
    .select("id, document_name, file_url, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false });
  const documents = (docsData as ClientDoc[] | null) ?? [];

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10">
      <Link href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-500">
        ← Back to orders
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        {order.cars
          ? `${order.cars.year} ${order.cars.make} ${order.cars.model}`
          : "Order"}
      </h1>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Order ID</dt>
            <dd className="font-mono text-xs text-slate-900">{order.id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Customer</dt>
            <dd className="font-medium text-slate-900">
              {order.full_name ?? order.users?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium text-slate-900">{order.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Total</dt>
            <dd className="font-medium text-slate-900">{formatUSD(order.total_price)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
          Client Documents
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload export paperwork to the customer&apos;s Members Area.
        </p>
        <div className="mt-4">
          <ClientDocuments orderId={order.id} userId={order.user_id} documents={documents} />
        </div>
      </section>
    </main>
  );
}
