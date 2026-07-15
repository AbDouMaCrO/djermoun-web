import { createClient } from "@/utils/supabase/server";
import { generateContent, MarketingCar } from "@/lib/marketing-templates";
import { CarContent } from "./car-content";

const FALLBACK_RATE = 253;
const CAR_FIELDS =
  "id, make, model, year, mileage, fuel, transmission, engine, " +
  "exterior_color, accessories, primary_image, images, condition, " +
  "price_cny, commission, shipping_cost, customs_duty_dzd, title";

export default async function MarketingPage() {
  const supabase = await createClient();

  const [{ data: cars }, { data: settings }] = await Promise.all([
    supabase
      .from("cars")
      .select(CAR_FIELDS)
      .eq("status", "available")
      .eq("is_visible", true)
      .order("year", { ascending: false }),
    supabase.from("site_settings").select("usd_to_dzd_rate").eq("id", 1).single(),
  ]);

  const rate = Number(settings?.usd_to_dzd_rate) || FALLBACK_RATE;
  const wa   = process.env.WHATSAPP_NUMBER ?? "";

  const contents = (cars ?? []).map((car) =>
    generateContent(car as MarketingCar, rate, wa)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Content</h1>
        <p className="mt-1 text-sm text-gray-500">
          {contents.length} active listing{contents.length !== 1 ? "s" : ""} · Rate: 1 USD = {rate} DZD
        </p>
      </div>

      {contents.length === 0 ? (
        <p className="text-gray-500">No active visible cars found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {contents.map((content) => (
            <CarContent key={content.car.id} initialContent={content} />
          ))}
        </div>
      )}
    </div>
  );
}
