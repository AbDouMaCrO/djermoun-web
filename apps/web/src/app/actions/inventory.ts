"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

export type ActionResult = { success: true } | { success: false; error: string };

export type CarDetailsPayload = {
  title: string | null;
  make: string;
  model: string;
  year: number;
  mileage: number | null;
  fuel: string | null;
  price_cny: number | null;
  commission: number;
  shipping_cost: number;
  source_url: string | null;
  autohome_url: string | null;
  destination_country: string;
  condition: string;
};

export type CreateCarPayload = CarDetailsPayload & {
  fuel_type: string | null;
  transmission: string | null;
  engine: string | null;
  exterior_color: string | null;
  customs_duty_dzd: number | null;
  primary_image: string | null;
  images: string[];
  accessories: string[];
  status: string;
  is_visible: boolean;
};

export async function createCar(
  payload: CreateCarPayload,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cars")
    .insert({ ...payload })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { success: true, id: data.id };
}

// Flips a car's public visibility. currentStatus is the row's current
// is_visible; we persist the opposite.
export async function toggleCarVisibility(
  id: string,
  currentStatus: boolean,
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("cars")
    .update({ is_visible: !currentStatus })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { success: true };
}

// SECURITY: uses the service-role key and bypasses RLS — same known gap as
// adminOrders.ts (no admin login wired up yet). See that file's note.
export async function updateCarDetails(
  carId: string,
  payload: CarDetailsPayload,
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("cars")
    .update(payload)
    .eq("id", carId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${carId}`);
  revalidatePath("/");
  revalidatePath(`/cars/${carId}`);
  return { success: true };
}
