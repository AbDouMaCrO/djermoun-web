import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="px-8 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome. Choose a task to get started.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/dashboard"
          className="rounded-lg border border-gray-200 p-6 hover:shadow-md"
        >
          <h2 className="font-medium text-gray-900">Scrape & Ingest Vehicles</h2>
          <p className="mt-1 text-sm text-gray-500">Import listings from a URL.</p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-lg border border-gray-200 p-6 hover:shadow-md"
        >
          <h2 className="font-medium text-gray-900">Manage Orders & Payments</h2>
          <p className="mt-1 text-sm text-gray-500">Receive deposits and advance orders.</p>
        </Link>
      </div>
    </main>
  );
}
