"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const phoneWhatsapp = String(formData.get("phone_whatsapp") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { phone_whatsapp: phoneWhatsapp },
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  return { success: true };
}

export type SignedUrlResult = { url: string } | { error: string };

// Mints a short-lived signed URL for one export document. Runs with the user's
// session, so storage RLS (select-own) guarantees they can only sign their own
// files — see packages/database/sql/export_documents_setup.sql.
export async function getDocumentDownloadUrl(fileUrl: string): Promise<SignedUrlResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("export_documents")
    .createSignedUrl(fileUrl, 60 * 5);

  if (error || !data) return { error: error?.message ?? "Could not generate download link." };
  return { url: data.signedUrl };
}
