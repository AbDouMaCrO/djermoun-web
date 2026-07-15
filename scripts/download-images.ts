#!/usr/bin/env tsx
/**
 * Djermoun Auto — Marketing Image Downloader
 *
 * Usage:
 *   npm run marketing:images              # all available cars
 *   npm run marketing:images -- --car-id <uuid>   # single car
 *
 * Skips files that already exist. Logs failures without crashing.
 * Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL             = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const OUTPUT_DIR               = process.env.MARKETING_OUTPUT_DIR ?? "marketing-output";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(i: number): string {
  return String(i).padStart(2, "0");
}

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: { "User-Agent": "DjermounAuto-ImageBot/1.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 5_000) throw new Error(`Too small (${buf.byteLength} bytes) — likely an error page`);
  writeFileSync(dest, Buffer.from(buf));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
    process.exit(1);
  }

  // Parse --car-id flag (--car-id=<uuid> or --car-id <uuid>)
  const argv  = process.argv.slice(2);
  const eqIdx = argv.findIndex((a) => a.startsWith("--car-id="));
  const spIdx = argv.indexOf("--car-id");
  const carId = eqIdx !== -1
    ? argv[eqIdx].split("=")[1]
    : spIdx !== -1 ? argv[spIdx + 1] : null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let query = supabase
    .from("cars")
    .select("id, make, model, year, images, primary_image")
    .eq("status", "available")
    .eq("is_visible", true);

  if (carId) query = (query as typeof query).eq("id", carId);

  const { data: cars, error } = await query;
  if (error) { console.error("Supabase error:", error.message); process.exit(1); }
  if (!cars?.length) { console.log("No cars found."); return; }

  console.log(`Downloading images for ${cars.length} car(s)…\n`);

  let totalDownloaded = 0;
  let totalSkipped    = 0;
  let totalFailed     = 0;

  for (const car of cars) {
    const label = `${car.year} ${car.make} ${car.model}`;
    const imgDir = join(OUTPUT_DIR, car.id, "images");
    mkdirSync(imgDir, { recursive: true });

    // Build URL list: prefer images array, fall back to primary_image alone
    const urls: string[] = Array.isArray(car.images) && car.images.length > 0
      ? car.images
      : car.primary_image ? [car.primary_image] : [];

    if (urls.length === 0) {
      console.log(`  ⚠  ${label} — no images in DB, skipping`);
      continue;
    }

    console.log(`  ${label} (${urls.length} image${urls.length !== 1 ? "s" : ""})`);

    for (let i = 0; i < urls.length; i++) {
      const dest = join(imgDir, `${pad(i + 1)}.jpg`);

      if (existsSync(dest)) {
        console.log(`     [${pad(i + 1)}] already exists — skip`);
        totalSkipped++;
        continue;
      }

      try {
        await downloadImage(urls[i], dest);
        console.log(`     [${pad(i + 1)}] ✓`);
        totalDownloaded++;
      } catch (err) {
        console.error(`     [${pad(i + 1)}] ✗ ${(err as Error).message}`);
        totalFailed++;
        // continue — never crash the pipeline for one image
      }
    }
  }

  console.log(
    `\n✅  Done. ` +
    `Downloaded: ${totalDownloaded}  ` +
    `Skipped (exist): ${totalSkipped}  ` +
    `Failed: ${totalFailed}`
  );

  if (totalFailed > 0) {
    console.log(`⚠   ${totalFailed} image(s) failed — check logs above.`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
