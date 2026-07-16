"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { generateContent, type ContentOutput, type Lang, type Platform } from "@/lib/marketing-templates";

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: "facebook",  label: "Facebook"  },
  { key: "site",      label: "Site"      },
  { key: "ouedkniss", label: "Ouedkniss" },
];

const LANGS: { key: Lang; label: string }[] = [
  { key: "fr", label: "FR" },
  { key: "ar", label: "AR" },
  { key: "en", label: "EN" },
];

const CAR_FIELDS =
  "id, make, model, year, mileage, fuel, transmission, engine, " +
  "exterior_color, accessories, primary_image, images, condition, " +
  "price_cny, commission, shipping_cost, customs_duty_dzd, title";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button
      onClick={copy}
      className="absolute right-2 top-2 rounded bg-white px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CarCard({ content }: { content: ContentOutput }) {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [lang, setLang]         = useState<Lang>("fr");
  const text = content.platforms[platform][lang];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{content.title}</p>
          <p className="text-xs text-gray-400">1 USD = {content.dzd_rate} DZD</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            content.car.price_cny != null
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {content.car.price_cny != null ? "Ready" : "No price"}
        </span>
      </div>

      <div className="mb-2 flex gap-1">
        {PLATFORMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPlatform(key)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              platform === key ? "bg-amber-500 text-black" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          {LANGS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setLang(key)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                lang === key ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <textarea
          readOnly
          value={text}
          dir={lang === "ar" ? "rtl" : "ltr"}
          rows={10}
          className="w-full resize-none rounded border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 focus:outline-none"
        />
        <CopyButton text={text} />
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const [contents, setContents] = useState<ContentOutput[]>([]);
  const [rate, setRate]         = useState(253);
  const [wa, setWa]             = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async (waNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const db = createClient();
      const [{ data: cars, error: carsErr }, { data: settings }] = await Promise.all([
        db.from("cars").select(CAR_FIELDS).eq("status", "available").eq("is_visible", true).order("year", { ascending: false }),
        db.from("site_settings").select("usd_to_dzd_rate").eq("id", 1).single(),
      ]);
      if (carsErr) throw new Error(carsErr.message);
      const r = Number(settings?.usd_to_dzd_rate) || 253;
      setRate(r);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setContents((cars ?? []).map((car: any) => generateContent(car, r, waNumber)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(wa); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  function regenerate() { load(wa); }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Content</h1>
          {!loading && !error && (
            <p className="mt-1 text-sm text-gray-500">
              {contents.length} listing{contents.length !== 1 ? "s" : ""} · 1 USD = {rate} DZD
            </p>
          )}
        </div>
        <div className="flex items-end gap-2 ml-auto">
          <div>
            <label className="block text-xs text-gray-500 mb-1">WhatsApp number</label>
            <input
              type="text"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="213xxxxxxxxx"
              className="rounded border border-gray-300 px-3 py-1.5 text-sm w-44"
            />
          </div>
          <button
            onClick={regenerate}
            disabled={loading}
            className="rounded bg-amber-500 px-4 py-1.5 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Regenerate all"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading cars…</p>}

      {!loading && !error && contents.length === 0 && (
        <p className="text-gray-500">No active visible cars found.</p>
      )}

      <div className="flex flex-col gap-4">
        {contents.map((c) => <CarCard key={c.car.id} content={c} />)}
      </div>
    </div>
  );
}
