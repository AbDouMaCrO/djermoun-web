"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type ReserveResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export type CheckoutDetails = {
  fullName: string;
  phoneNumber: string;
  whatsappTelegram: string;
  destinationCountryPort: string;
  depositDate: string;
  salesRepCode?: string;
  passportUrl: string;
};

export async function reserveCarAction(
  carId: string,
  details: CheckoutDetails,
): Promise<ReserveResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to reserve a vehicle." };
  }

  const { data, error } = await supabase.rpc("reserve_car", {
    p_user_id: user.id,
    p_car_id: carId,
    p_full_name: details.fullName,
    p_phone_number: details.phoneNumber,
    p_whatsapp_telegram: details.whatsappTelegram,
    p_destination_country_port: details.destinationCountryPort,
    p_deposit_date: details.depositDate,
    p_passport_url: details.passportUrl,
    p_sales_rep_code: details.salesRepCode || null,
  });

  if (error) {
    // Concurrency block or RPC raise — surface the message to the client.
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true, orderId: data };
}
