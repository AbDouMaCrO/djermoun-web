import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import ProfileForm from "./profile-form";
import DocumentList, { type UserDocument } from "./document-list";

export const dynamic = "force-dynamic";

type Order = {
  id: string;
  status: string;
  total_price: number | null;
  created_at: string;
  cars: { make: string; model: string; year: number } | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid_processing: "Processing",
  paid: "Paid",
  processing: "Processing",
  exporting: "Shipping to Algiers",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatUSD(price: number | null) {
  if (price == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const { data: ordersData } = await supabase
    .from("orders")
    .select("id, status, total_price, created_at, cars(make, model, year)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const orders = (ordersData as Order[] | null) ?? [];

  // Tolerate the migration not being applied yet — show an empty list rather
  // than crashing the whole portal if user_documents doesn't exist.
  const { data: docsData } = await supabase
    .from("user_documents")
    .select("id, document_name, file_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const documents = (docsData as UserDocument[] | null) ?? [];

  const phoneWhatsapp = (user.user_metadata?.phone_whatsapp as string) ?? "";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Members Area</h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Profile */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
          Profile
        </h2>
        <ProfileForm email={user.email ?? ""} phoneWhatsapp={phoneWhatsapp} />
      </section>

      {/* My Vehicles */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
          My Vehicles
        </h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            You haven&apos;t reserved any vehicles yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {order.cars
                      ? `${order.cars.year} ${order.cars.make} ${order.cars.model}`
                      : "Vehicle"}
                  </p>
                  <p className="text-xs text-slate-500">{formatUSD(order.total_price)}</p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My Documents */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
          My Documents
        </h2>
        <DocumentList documents={documents} />
      </section>
    </main>
  );
}
