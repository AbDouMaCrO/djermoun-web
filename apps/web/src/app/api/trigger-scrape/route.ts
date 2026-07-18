import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

  const token = process.env.GITHUB_PAT;
  if (!token) return NextResponse.json({ error: "GITHUB_PAT not configured" }, { status: 500 });

  const res = await fetch(
    "https://api.github.com/repos/AbDouMaCrO/djermoun-web/actions/workflows/scraper.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main", inputs: { target_url: url.trim() } }),
    }
  );

  if (res.status === 204) return NextResponse.json({ ok: true });
  const text = await res.text();
  return NextResponse.json({ error: text }, { status: res.status });
}
