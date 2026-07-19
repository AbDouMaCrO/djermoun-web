"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireRole } from "@/utils/supabase/roles";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// ponytail: car status is updated in a second statement, not one DB transaction.
// Fine at this volume; if two admins race the same order, move both updates into a
// SECURITY DEFINER SQL function and call it via rpc().
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  depositAmount?: number,
): Promise<ActionResult> {
  await requireRole("admin", "supervisor");
  const supabase = createAdminClient();

  // Need the car this order is attached to for the cascading status change.
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("car_id")
    .eq("id", orderId)
    .single();
  if (fetchErr || !order) {
    return { success: false, error: fetchErr?.message ?? "Order not found." };
  }

  const orderUpdate: Record<string, unknown> = { status: newStatus };
  if (depositAmount !== undefined) orderUpdate.deposit_amount = depositAmount;

  const { error: orderErr } = await supabase
    .from("orders")
    .update(orderUpdate)
    .eq("id", orderId);
  if (orderErr) return { success: false, error: orderErr.message };

  // Cascade to the car's availability.
  const carStatus =
    newStatus === "paid_processing"
      ? "sold"
      : newStatus === "cancelled"
        ? "available"
        : null;

  if (carStatus) {
    const { error: carErr } = await supabase
      .from("cars")
      .update({ status: carStatus })
      .eq("id", order.car_id);
    if (carErr) return { success: false, error: carErr.message };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

// Records a deposit payment against an order and bumps the order's running total.
// Requires a public.transactions table (see SQL below).
export async function addDepositAction(
  orderId: string,
  amount: number,
): Promise<ActionResult> {
  await requireRole("admin", "supervisor");
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Enter a valid deposit amount." };
  }

  const supabase = createAdminClient();

  // Cap the deposit at the vehicle's remaining balance.
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("total_price, deposit_amount")
    .eq("id", orderId)
    .single();
  if (orderErr || !order) {
    return { success: false, error: orderErr?.message ?? "Order not found." };
  }
  const remaining = Number(order.total_price ?? 0) - Number(order.deposit_amount ?? 0);
  if (amount > remaining) {
    return {
      success: false,
      error: "Deposit exceeds the total remaining balance of the vehicle.",
    };
  }

  const { error: txErr } = await supabase
    .from("transactions")
    .insert({ order_id: orderId, amount, type: "deposit" });
  if (txErr) return { success: false, error: txErr.message };

  // Keep the order's deposit_amount as the running total of recorded deposits.
  const { data: rows, error: sumErr } = await supabase
    .from("transactions")
    .select("amount")
    .eq("order_id", orderId)
    .eq("type", "deposit");
  if (sumErr) return { success: false, error: sumErr.message };

  const total = (rows ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const { error: updErr } = await supabase
    .from("orders")
    .update({ deposit_amount: total })
    .eq("id", orderId);
  if (updErr) return { success: false, error: updErr.message };

  revalidatePath("/admin/orders");
  return { success: true };
}

// Marks the order's funds as wired to China.
export async function transferFundsAction(orderId: string): Promise<ActionResult> {
  await requireRole("admin", "supervisor");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ is_funds_transferred: true })
    .eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/orders");
  return { success: true };
}

// Advances an order once offline payment is confirmed, cascading the car to sold.
export async function verifyOfflinePaymentAction(orderId: string): Promise<ActionResult> {
  return updateOrderStatusAction(orderId, "paid_processing");
}
