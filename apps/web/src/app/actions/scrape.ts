"use server";

import { revalidatePath } from "next/cache";

const SCRAPER_URL = process.env.SCRAPER_URL ?? "http://localhost:8000";

export type ScrapeResult =
  | { ok: true; message: string; car: Record<string, unknown> }
  | { ok: false; message: string };

export async function scrapeVehicleAction(url: string): Promise<ScrapeResult> {
  if (!url || !/^https?:\/\//.test(url)) {
    return { ok: false, message: "Please paste a valid http(s) listing URL." };
  }

  let res: Response;
  try {
    res = await fetch(`${SCRAPER_URL}/api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "Scraper service unreachable. Is it running on :8000?" };
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, message: `Scrape failed (${res.status}): ${detail.slice(0, 200)}` };
  }

  const car = (await res.json()) as Record<string, unknown>;
  revalidatePath("/");
  revalidatePath("/admin/dashboard");

  const label = [car.year, car.make, car.model].filter(Boolean).join(" ") || "vehicle";
  return { ok: true, message: `Imported ${label}.`, car };
}
