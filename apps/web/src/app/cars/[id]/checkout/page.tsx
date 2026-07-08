import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CheckoutForm from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/cars/${id}/checkout`);
  }

  const { data: car } = await supabase
    .from("cars")
    .select("id, make, model, year, price_cny, status, is_visible")
    .eq("id", id)
    .single();

  // Hidden cars can't be reserved via a direct checkout link either.
  if (!car || car.is_visible === false) notFound();

  if (car.status !== "Available") {
    redirect(`/cars/${id}`);
  }

  return <CheckoutForm car={car} userEmail={user.email ?? ""} />;
}
