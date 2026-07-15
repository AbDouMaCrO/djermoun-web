"use client";

import { useState, useTransition } from "react";
import type { ContentOutput, Lang, Platform } from "@/lib/marketing-templates";
import { regenerateCar } from "./actions";

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: "site",      label: "Site" },
  { key: "facebook",  label: "Facebook" },
  { key: "ouedkniss", label: "Ouedkniss" },
];

const LANGS: { key: Lang; label: string }[] = [
  { key: "fr", label: "FR" },
  { key: "ar", label: "AR" },
  { key: "en", label: "EN" },
];

export function CarContent({ initialContent }: { initialContent: ContentOutput }) {
  const [content, setContent]       = useState(initialContent);
  const [platform, setPlatform]     = useState<Platform>("facebook");
  const [lang, setLang]             = useState<Lang>("fr");
  const [copied, setCopied]         = useState(false);
  const [isPending, startTransition] = useTransition();

  const text = content.platforms[platform][lang];

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function regenerate() {
    startTransition(async () => {
      const fresh = await regenerateCar(content.car.id);
      setContent(fresh);
    });
  }

  const hasPrice = content.car.price_cny != null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{content.title}</p>
          <p className="text-xs text-gray-400">Rate: 1 USD = {content.dzd_rate} DZD</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              hasPrice
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {hasPrice ? "Ready" : "No price"}
          </span>
          <button
            onClick={regenerate}
            disabled={isPending}
            className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? "Updating…" : "Regenerate"}
          </button>
        </div>
      </div>

      {/* Platform tabs */}
      <div className="mb-2 flex gap-1">
        {PLATFORMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPlatform(key)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              platform === key
                ? "bg-amber-500 text-black"
                : "text-gray-600 hover:bg-gray-100"
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
                lang === key
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Text area + copy */}
      <div className="relative">
        <textarea
          readOnly
          value={text}
          dir={lang === "ar" ? "rtl" : "ltr"}
          rows={10}
          className="w-full resize-none rounded border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 focus:outline-none"
        />
        <button
          onClick={copy}
          className="absolute right-2 top-2 rounded bg-white px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
