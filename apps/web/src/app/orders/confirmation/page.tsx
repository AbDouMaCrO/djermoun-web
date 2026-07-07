import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import Countdown from "./countdown";

export const dynamic = "force-dynamic";

type OrderWithCar = {
  id: string;
  status: string;
  total_price: number | null;
  created_at: string;
  cars: { make: string; model: string; year: number } | null;
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  let order: OrderWithCar | null = null;
  if (id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("id, status, total_price, created_at, cars(make, model, year)")
      .eq("id", id)
      .single();
    order = data as OrderWithCar | null;
  }

  if (!id || !order) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Order not found</h1>
        <p className="mt-3 text-gray-600">
          We couldn’t find that reservation. Please check your link or contact us.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm font-medium underline">
          Back to listings
        </Link>
      </main>
    );
  }

  const car = order.cars;
  const expiration = new Date(
    new Date(order.created_at).getTime() + 7 * 86_400_000,
  );
  const expirationLabel = expiration.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-2xl text-white">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          Your reservation is held
        </h1>
        <p className="mt-2 text-gray-600">
          {car
            ? `We’ve secured your ${car.year} ${car.make} ${car.model}.`
            : "We’ve secured your vehicle."}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6 text-sm text-blue-900">
        <p>
          Your reservation is secured! You have until{" "}
          <span className="font-semibold">{expirationLabel}</span> to visit our office
          and make your deposit. If the deposit is not received by then, this
          reservation will automatically cancel, and the car will go back on the market.
        </p>
        <p className="mt-3 text-base">
          <Countdown expiresAt={expiration.toISOString()} />
        </p>
      </div>

      <dl className="mt-8 space-y-3 rounded-xl border border-gray-200 p-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Order ID</dt>
          <dd className="font-mono font-medium text-gray-900">{order.id}</dd>
        </div>
        {car && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Vehicle</dt>
            <dd className="font-medium text-gray-900">
              {car.year} {car.make} {car.model}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-gray-500">Status</dt>
          <dd className="font-medium text-gray-900">{order.status}</dd>
        </div>
      </dl>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="font-semibold">Next step — complete your purchase</h2>
        <p className="mt-2">
          To complete your purchase, please visit our physical office within 48 hours
          to deposit your offline payment. Bring your Order ID:{" "}
          <span className="font-mono font-semibold">{order.id}</span>. Once deposited,
          we will transfer the title and begin the export process.
        </p>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400"
      >
        Back to listings
      </Link>
    </main>
  );
}
