import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import CarEditForm from "./car-edit-form";

export const dynamic = "force-dynamic";

export default async function AdminInventoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: car } = await supabase
    .from("cars")
    .select(
      "id, title, make, model, year, mileage, fuel, price_cny, commission, shipping_cost, source_url, autohome_url, destination_country, condition",
    )
    .eq("id", id)
    .single();

  if (!car) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10">
      <CarEditForm car={car} />
    </main>
  );
}
