"use client";

import { useState, useTransition } from "react";
import { scrapeVehicleAction, type ScrapeResult } from "@/app/actions/scrape";

export default function AdminDashboardPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => setResult(await scrapeVehicleAction(url)));
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">
        Admin Vehicle Management
      </h1>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a vehicle listing URL…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {pending ? "Importing…" : "Scrape & Import Vehicle"}
        </button>
      </form>

      {result && (
        <p
          className={`mt-4 text-sm ${result.ok ? "text-green-700" : "text-red-700"}`}
        >
          {result.message}
        </p>
      )}
    </main>
  );
}
