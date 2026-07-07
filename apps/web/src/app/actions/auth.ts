"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type AuthResult = { success: true } | { success: false; error: string };

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendOtpAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "");

  const supabase = await createClient();
  // shouldCreateUser defaults to true — new emails get an account (signup),
  // existing ones just log in. Either way they must verify the emailed code.
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function verifyOtpAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "");
  const token = String(formData.get("token") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
