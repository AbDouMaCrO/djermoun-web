"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

export type SiteSettings = {
  show_customs_calculator: boolean;
  country_algeria_enabled: boolean;
  country_international_enabled: boolean;
  country_uae_enabled: boolean;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data ?? {
    show_customs_calculator: false,
    country_algeria_enabled: true,
    country_international_enabled: false,
    country_uae_enabled: false,
  };
}

export async function toggleCustomsCalculator(current: boolean) {
  const supabase = createAdminClient();
  await supabase
    .from("site_settings")
    .update({ show_customs_calculator: !current })
    .eq("id", 1);
  revalidatePath("/admin/settings");
  revalidatePath("/cars/[id]", "page");
}

export async function toggleCountry(column: "country_algeria_enabled" | "country_international_enabled" | "country_uae_enabled", current: boolean) {
  const supabase = createAdminClient();
  await supabase.from("site_settings").update({ [column]: !current }).eq("id", 1);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
