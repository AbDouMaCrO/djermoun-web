import CarCreateForm from "./car-create-form";

export const dynamic = "force-dynamic";

export default function NewCarPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Add New Listing</h1>
          <p className="mt-1 text-sm text-slate-600">
            Fill in car details. Images can be Supabase storage URLs or external CDN links.
          </p>
        </div>
      </div>
      <CarCreateForm />
    </main>
  );
}
