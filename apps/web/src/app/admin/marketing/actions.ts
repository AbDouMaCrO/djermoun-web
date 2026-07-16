"use server";

import { createClient } from "@/utils/supabase/server";
import { generateContent, ContentOutput, MarketingCar } from "@/lib/marketing-templates";

const FALLBACK_RATE = 253;
const CAR_FIELDS =
  "id, make, model, year, mileage, fuel, transmission, engine, " +
  "exterior_color, accessories, primary_image, images, condition, " +
  "price_cny, commission, shipping_cost, customs_duty_dzd, title";

export async function regenerateCar(carId: string): Promise<ContentOutput> {
  const supabase = await createClient();
  const [{ data: car }, { data: settings }] = await Promise.all([
    supabase.from("cars").select(CAR_FIELDS).eq("id", carId).single(),
    supabase.from("site_settings").select("usd_to_dzd_rate").eq("id", 1).single(),
  ]);
  const rate = Number(settings?.usd_to_dzd_rate) || FALLBACK_RATE;
  const wa = process.env.WHATSAPP_NUMBER ?? "";
  return generateContent(car as unknown as MarketingCar, rate, wa);
}
