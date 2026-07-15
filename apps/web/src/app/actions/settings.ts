"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

export type SiteSettings = {
  show_customs_calculator: boolean;
  country_algeria_enabled: boolean;
  country_international_enabled: boolean;
  country_uae_enabled: boolean;
  usd_to_dzd_rate: number;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data ?? {
    show_customs_calculator: false,
    country_algeria_enabled: true,
    country_international_enabled: false,
    country_uae_enabled: false,
    usd_to_dzd_rate: 253,
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

export async function updateDzdRate(formData: FormData) {
  const rate = Number(formData.get("rate"));
  if (!Number.isFinite(rate) || rate <= 0) return;
  const supabase = createAdminClient();
  await supabase.from("site_settings").update({ usd_to_dzd_rate: rate }).eq("id", 1);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
