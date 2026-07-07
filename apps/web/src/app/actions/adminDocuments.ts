"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

export type ActionResult = { success: true } | { success: false; error: string };

// Admin uploads a document to a customer's account. Runs with the service-role
// client (bypasses the export_documents RLS, which grants users select-own
// only) — see packages/database/sql/export_documents_setup.sql. Uploads to
// storage under the buyer's uid prefix, then links it in user_documents.
export async function uploadClientDocument(formData: FormData): Promise<ActionResult> {
  const orderId = String(formData.get("order_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const name = String(formData.get("document_name") ?? "").trim();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please choose a file to upload." };
  }
  if (!name) return { success: false, error: "Please name the document." };
  if (!userId) return { success: false, error: "This order has no linked customer account." };

  const supabase = createAdminClient();

  const ext = file.name.split(".").pop() ?? "pdf";
  const safeName = name.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  // Path prefix is the buyer's uid so their select-own storage RLS matches.
  const path = `${userId}/${Date.now()}-${safeName}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("export_documents")
    .upload(path, file, { contentType: file.type || "application/pdf" });
  if (uploadErr) return { success: false, error: uploadErr.message };

  const { error: insertErr } = await supabase.from("user_documents").insert({
    user_id: userId,
    order_id: orderId || null,
    document_name: name,
    file_url: path,
  });
  if (insertErr) {
    // Roll back the orphaned object so we don't leave storage/table out of sync.
    await supabase.storage.from("export_documents").remove([path]);
    return { success: false, error: insertErr.message };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function deleteClientDocument(
  docId: string,
  fileUrl: string,
  orderId: string,
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { error: delErr } = await supabase.from("user_documents").delete().eq("id", docId);
  if (delErr) return { success: false, error: delErr.message };

  await supabase.storage.from("export_documents").remove([fileUrl]);

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
