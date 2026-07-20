"use client";

import { useState } from "react";

type Row = { url: string; status: "idle" | "loading" | "done" | "error"; message?: string };

const STATUS_LABEL: Record<Row["status"], string> = {
  idle: "Scrape",
  loading: "Queuing…",
  done: "Queued ✓",
  error: "Failed",
};

function ScraperSection({
  title,
  placeholder,
}: {
  title: string;
  placeholder: string;
}) {
  const [rows, setRows] = useState<Row[]>([
    { url: "", status: "idle" },
    { url: "", status: "idle" },
    { url: "", status: "idle" },
  ]);

  function setRow(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function trigger(i: number) {
    const url = rows[i].url.trim();
    if (!url) return;
    setRow(i, { status: "loading", message: undefined });
    try {
      const res = await fetch("/api/trigger-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.ok) setRow(i, { status: "done" });
      else setRow(i, { status: "error", message: data.error });
    } catch (e) {
      setRow(i, { status: "error", message: String(e) });
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/10 p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h2>
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={row.url}
                onChange={(e) =>
                  setRow(i, { url: e.target.value, status: "idle", message: undefined })
                }
                onKeyDown={(e) => e.key === "Enter" && trigger(i)}
                placeholder={placeholder}
                className="flex-1 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3 py-2 text-sm font-mono"
              />
              <button
                onClick={() => trigger(i)}
                disabled={row.status === "loading" || !row.url.trim()}
                className={`rounded px-4 py-2 text-sm font-medium whitespace-nowrap disabled:opacity-50 transition-colors ${
                  row.status === "done"
                    ? "bg-green-500 text-white"
                    : row.status === "error"
                    ? "bg-red-500 text-white"
                    : "bg-amber-500 text-black hover:bg-amber-400"
                }`}
              >
                {STATUS_LABEL[row.status]}
              </button>
            </div>
            {row.message && <p className="text-xs text-red-600 px-1">{row.message}</p>}
          </div>
        ))}

        <button
          onClick={() => setRows((r) => [...r, { url: "", status: "idle" }])}
          className="self-start mt-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          + Add row
        </button>
      </div>
    </div>
  );
}

export default function ScraperPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trigger Scraper</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paste listing URLs and click Scrape. Each job runs in GitHub Actions.
      </p>

      <div className="flex flex-col gap-4">
        <ScraperSection
          title="autocango.com"
          placeholder="https://www.autocango.com/sku/usedcar-…"
        />
        <ScraperSection
          title="sellwellauto.com"
          placeholder="https://sellwellauto.com/usedcar/…"
        />
      </div>
    </div>
  );
}
