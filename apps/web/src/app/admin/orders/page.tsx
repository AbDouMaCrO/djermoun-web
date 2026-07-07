import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import Countdown from "@/app/orders/confirmation/countdown";
import OrderActions from "./order-actions";

export const dynamic = "force-dynamic";

// Tab label -> order.status values it covers.
const TABS: Record<string, string[]> = {
  "Pending Deposit": ["pending_payment"],
  "Processing/Paid": ["paid_processing", "paid", "processing"],
  Exporting: ["exporting"],
  "Completed/Cancelled": ["completed", "cancelled"],
};
const TAB_NAMES = Object.keys(TABS);

type Order = {
  id: string;
  status: string;
  total_price: number | null;
  deposit_amount: number | null;
  created_at: string;
  is_funds_transferred: boolean | null;
  full_name: string | null;
  whatsapp_telegram: string | null;
  destination_country_port: string | null;
  sales_rep_code: string | null;
  passport_url: string | null;
  cars: {
    make: string;
    model: string;
    year: number;
    price_local: number | null;
    primary_image: string | null;
  } | null;
  users: { full_name: string | null; email: string | null; phone_number: string | null } | null;
};

function formatPrice(price: number | null) {
  if (price == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TAB_NAMES.includes(tab ?? "") ? (tab as string) : TAB_NAMES[0];
  const statuses = TABS[activeTab];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_price, deposit_amount, created_at, is_funds_transferred, full_name, whatsapp_telegram, destination_country_port, sales_rep_code, passport_url, cars(make, model, year, price_local, primary_image), users(full_name, email, phone_number)",
    )
    .in("status", statuses)
    .order("created_at", { ascending: false });

  const orders = (data as Order[] | null) ?? [];

  // Bucket is private — mint short-lived signed URLs for the admin's "View
  // Passport" links rather than exposing a public/direct URL.
  const passportLinks = new Map<string, string>();
  await Promise.all(
    orders
      .filter((o) => o.passport_url)
      .map(async (o) => {
        const { data: signed } = await supabase.storage
          .from("passports")
          .createSignedUrl(o.passport_url!, 60 * 10);
        if (signed) passportLinks.set(o.id, signed.signedUrl);
      }),
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>

      <nav className="mt-6 flex gap-1 border-b border-gray-200">
        {TAB_NAMES.map((name) => (
          <Link
            key={name}
            href={`/admin/orders?tab=${encodeURIComponent(name)}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              name === activeTab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {name}
          </Link>
        ))}
      </nav>

      {error && (
        <p className="mt-4 text-sm text-red-700">Failed to load orders: {error.message}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Destination / Rep</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Total Deposits</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Deposit window</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No orders in this view.
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const expiration = new Date(
                new Date(o.created_at).getTime() + 7 * 86_400_000,
              ).toISOString();
              return (
                <tr key={o.id} className="align-top">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-amber-600 hover:text-amber-500 hover:underline"
                    >
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {o.full_name ?? o.users?.full_name ?? "—"}
                    </div>
                    <div className="text-gray-500">{o.users?.email}</div>
                    <div className="text-gray-500">{o.users?.phone_number}</div>
                    {o.whatsapp_telegram && (
                      <div className="text-gray-500">{o.whatsapp_telegram}</div>
                    )}
                    {passportLinks.has(o.id) && (
                      <a
                        href={passportLinks.get(o.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 underline hover:text-blue-800"
                      >
                        View Passport
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {o.cars ? `${o.cars.year} ${o.cars.make} ${o.cars.model}` : "—"}
                    </div>
                    <div className="text-gray-500">{formatPrice(o.cars?.price_local ?? null)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{o.destination_country_port ?? "—"}</div>
                    {o.sales_rep_code && (
                      <div className="text-gray-500">Rep: {o.sales_rep_code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatPrice(o.total_price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">
                      {formatPrice(o.deposit_amount)} / {formatPrice(o.total_price)}
                    </span>
                    {o.total_price != null &&
                      Number(o.deposit_amount ?? 0) >= Number(o.total_price) && (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Fully Paid
                        </span>
                      )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "pending_payment" ? (
                      <Countdown expiresAt={expiration} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <OrderActions
                      orderId={o.id}
                      status={o.status}
                      totalPrice={o.total_price}
                      depositAmount={o.deposit_amount}
                      isFundsTransferred={!!o.is_funds_transferred}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
