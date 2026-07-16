"use client";

import { useState } from "react";
import Link from "next/link";

const SCRAPER_API = process.env.NEXT_PUBLIC_SCRAPER_API ?? "http://localhost:8001";

type Phase = "idle" | "discovering" | "importing" | "done" | "error";

type BatchSummary = {
  total: number;
  success: number;
  failed: number;
  failed_urls: string[];
};

export default function AutoCangoImporter() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState<BatchSummary | null>(null);

  async function startImport() {
    const target = url.trim();
    if (!target) return;
    setSummary(null);

    try {
      // Step 1: discovery
      setPhase("discovering");
      setStatus("Scanning inventory page for vehicles…");
      const catRes = await fetch('http://127.0.0.1:8000/api/scrape/catalog', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const cat = await catRes.json();
      const urls: string[] = cat.discovered_urls ?? [];
      if (cat.error) throw new Error(cat.error);
      if (!urls.length) throw new Error("No vehicle links found on that page.");

      // Step 2: batch scrape + DB import
      setPhase("importing");
      setStatus(`Discovered ${urls.length} vehicles. Importing to database… Please keep this page open.`);
      const batchRes = await fetch(`${SCRAPER_API}/api/scrape/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      setSummary(await batchRes.json());
      setPhase("done");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  const busy = phase === "discovering" || phase === "importing";

  return (
    <main style={s.page}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>

      <h1 style={s.h1}>
        AutoCango <span style={s.amber}>Importer</span>
      </h1>
      <p style={s.sub}>Paste an inventory page URL — every vehicle on it is scraped and imported automatically.</p>

      <div style={s.card}>
        <label style={s.label}>AutoCango Inventory URL (e.g., https://www.autocango.com/usedcar)</label>
        <div style={s.row}>
          <input
            style={s.input}
            type="url"
            placeholder="https://www.autocango.com/usedcar"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={busy}
            onKeyDown={(e) => e.key === "Enter" && startImport()}
          />
          <button style={{ ...s.btn, opacity: busy || !url.trim() ? 0.5 : 1 }} onClick={startImport} disabled={busy || !url.trim()}>
            {busy ? "Working…" : "Start Import"}
          </button>
        </div>
      </div>

      {busy && (
        <div style={s.progress}>
          <span style={s.spinner} />
          <div>
            <div style={s.progressTitle}>{phase === "discovering" ? "Step 1 / 2 — Discovery" : "Step 2 / 2 — Importing"}</div>
            <div style={s.progressText}>{status}</div>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div style={{ ...s.banner, borderColor: "#e53935", color: "#e53935" }}>✕ {status}</div>
      )}

      {phase === "done" && summary && (
        <div style={s.card}>
          <div style={{ ...s.banner, borderColor: "#4caf50", color: "#4caf50", marginBottom: 16 }}>
            ✓ Import complete — {summary.success} of {summary.total} vehicles imported
            {summary.failed > 0 && `, ${summary.failed} failed`}
          </div>
          <Link href="/admin/inventory" style={{ ...s.btn, display: "inline-block", textDecoration: "none" }}>
            View in Inventory
          </Link>
          {summary.failed_urls?.length > 0 && (
            <details style={s.details}>
              <summary style={{ cursor: "pointer", color: "#a0a0a0" }}>Failed URLs ({summary.failed_urls.length})</summary>
              <ul style={s.failList}>
                {summary.failed_urls.map((u) => (
                  <li key={u} style={{ wordBreak: "break-all" }}>{u}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </main>
  );
}

// Premium dark amber theme
const AMBER = "#f5a623";
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0f0f0f", color: "#f5f5f5", padding: "48px 24px", maxWidth: 760, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" },
  h1: { fontSize: 30, fontWeight: 800, margin: 0 },
  amber: { color: AMBER },
  sub: { color: "#a0a0a0", fontSize: 14, margin: "8px 0 28px" },
  card: { background: "linear-gradient(135deg,#1a1a1a,#151515)", border: "1px solid #333", borderRadius: 12, padding: 24, marginBottom: 20 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#a0a0a0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  row: { display: "flex", gap: 12 },
  input: { flex: 1, background: "#0a0a0a", color: "#f5f5f5", border: "1px solid #333", borderRadius: 8, padding: "14px 16px", fontSize: 14 },
  btn: { background: `linear-gradient(135deg,${AMBER},#e0940f)`, color: "#000", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer", whiteSpace: "nowrap" },
  progress: { display: "flex", alignItems: "center", gap: 14, background: "#1a1a1a", border: `1px solid ${AMBER}`, borderRadius: 12, padding: 18, marginBottom: 20 },
  progressTitle: { color: AMBER, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },
  progressText: { color: "#e0e0e0", fontSize: 13, marginTop: 2 },
  spinner: { width: 20, height: 20, border: "2px solid #333", borderTopColor: AMBER, borderRadius: "50%", flexShrink: 0, animation: "spin 0.8s linear infinite" },
  banner: { border: "1px solid", borderRadius: 10, padding: "14px 18px", fontWeight: 600, fontSize: 14 },
  details: { marginTop: 16, fontSize: 13 },
  failList: { color: "#e0e0e0", marginTop: 8, paddingLeft: 20 },
};
