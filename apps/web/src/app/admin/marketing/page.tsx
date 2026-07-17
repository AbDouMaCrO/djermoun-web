"use client";

import { useState } from "react";
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

function extractId(input: string): string {
  const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : input.trim();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="absolute right-2 top-2 rounded bg-white px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ContentTab({ content }: { content: ContentOutput }) {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [lang, setLang]         = useState<Lang>("fr");
  const text = content.platforms[platform][lang];

  return (
    <div>
      <div className="mb-2 flex gap-1">
        {PLATFORMS.map(({ key, label }) => (
          <button key={key} onClick={() => setPlatform(key)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              platform === key ? "bg-amber-500 text-black" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          {LANGS.map(({ key, label }) => (
            <button key={key} onClick={() => setLang(key)}
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
          readOnly value={text}
          dir={lang === "ar" ? "rtl" : "ltr"}
          rows={14}
          className="w-full resize-none rounded border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 focus:outline-none"
        />
        <CopyButton text={text} />
      </div>
    </div>
  );
}

function ImagesTab({ images }: { images: string[] }) {
  if (images.length === 0) return <p className="text-sm text-gray-500">No images found for this car.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((url, i) => (
        <div key={i} className="group relative overflow-hidden rounded-lg border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Image ${i + 1}`} className="aspect-video w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <a
              href={url}
              download={`image-${String(i + 1).padStart(2, "0")}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100"
            >
              Download
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30"
            >
              Open
            </a>
          </div>
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
            {i + 1}/{images.length}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MarketingPage() {
  const [input, setInput]     = useState("");
  const [wa, setWa]           = useState("");
  const [content, setContent] = useState<ContentOutput | null>(null);
  const [images, setImages]   = useState<string[]>([]);
  const [tab, setTab]         = useState<"content" | "images">("content");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function generate() {
    const carId = extractId(input);
    if (!carId) { setError("Paste a car URL or ID."); return; }

    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const db = createClient();
      const [{ data: car, error: carErr }, { data: settings }] = await Promise.all([
        db.from("cars").select(CAR_FIELDS).eq("id", carId).single(),
        db.from("site_settings").select("usd_to_dzd_rate").eq("id", 1).single(),
      ]);
      if (carErr) throw new Error(carErr.message);
      if (!car)   throw new Error("Car not found.");

      const rate = Number(settings?.usd_to_dzd_rate) || 253;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = car as any;
      setContent(generateContent(c, rate, wa));

      const imgs: string[] = Array.isArray(c.images) && c.images.length > 0
        ? c.images
        : c.primary_image ? [c.primary_image] : [];
      setImages(imgs);
      setTab("content");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Marketing Content</h1>

      {/* Input */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Paste car URL or ID — e.g. /cars/38aed565-..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="rounded bg-amber-500 px-5 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Generate"}
          </button>
        </div>
        <input
          type="text"
          value={wa}
          onChange={(e) => setWa(e.target.value)}
          placeholder="WhatsApp number (optional) — 213xxxxxxxxx"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Result */}
      {content && (
        <div>
          <div className="mb-1">
            <p className="font-semibold text-gray-900">{content.title}</p>
            <p className="text-xs text-gray-400">1 USD = {content.dzd_rate} DZD · {images.length} image{images.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 border-b border-gray-200 mt-3">
            {(["content", "images"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                  tab === t
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "images" ? `Images (${images.length})` : "Content"}
              </button>
            ))}
          </div>

          {tab === "content" && <ContentTab content={content} />}
          {tab === "images"  && <ImagesTab  images={images}  />}
        </div>
      )}
    </div>
  );
}
