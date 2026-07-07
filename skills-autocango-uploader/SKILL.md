---
name: autocango-uploader
description: "On-demand: given an autocango.com link, scrape the car listing(s) and upload them to the user's WooCommerce site with full fields and images. Use when the user provides an autocango.com URL (single listing or a brand/search page) and wants it uploaded to their website. Triggers: 'upload this link', 'scrape and upload <autocango url>', '/autocango-uploader'."
---

# /autocango-uploader

Give it an autocango.com link → it scrapes and uploads the listing(s) to the WooCommerce site with the full field set + images. On-demand, link-driven.

## Usage

```
python scripts/scrape_upload.py <url> [<url> ...] [--min-year YYYY] [--max-pages N]
```

The URL the user pastes is inserted verbatim as the argument. Two link types auto-detected:

| Link type | Example | Behaviour |
|---|---|---|
| Single listing | `https://www.autocango.com/sku/usedcar-ChangAn-UNI-V-ACU90589222` | scrape + upload that one car |
| Brand / search page | `https://www.autocango.com/usedcar/brandName=Jetour` | paginate, collect all listings, upload each |

Options:
- `--min-year 2023` — only upload cars with model year ≥ 2023 (omit = no year filter)
- `--max-pages 30` — pagination cap for collection pages (default 30)

Run it **detached** so it survives session teardown (see below).

## Config

`scripts/config.json` holds site + credentials (already set for `djermoun-auto.local`):
- `site_url`, `wc_consumer_key`, `wc_consumer_secret` (WooCommerce REST API)
- `wp_user`, `wp_app_password` (WordPress Application Password — needed for media upload)
- `images_dir` (where photos are cached per SKU), `state_dir`, `workers` (parallel image up/downloads, default 3)

To point at a different site: edit `config.json`. WooCommerce keys: WooCommerce → Settings → Advanced → REST API. App password: Users → Profile → Application Passwords.

## How it works (key learnings baked in)

- **Bot bypass**: `curl_cffi` `impersonate="chrome131"` (plain requests/Playwright are blocked).
- **CDN images**: append `/d?imageMogr2/format/jpg/strip` to each `m.tichetech.com` URL (else 403). Primary car's photos isolated via most-frequent `car_id` in the CDN path.
- **Full field parse**: title, MSRP (CNY), USD price, reg year, engine cc, vehicle-details table (20 keys), accessories list, description, location (line before `SID:`, handles apostrophes like Ma'anshan).
- **WooCommerce**: creates a simple product; maps all fields to attributes; description gets a formatted spec list + accessories + source link; uploads images to WP media and attaches them. **Updates** the product if the SKU already exists, else **creates**.
- **wp-config fix** (already applied): `$_SERVER['HTTPS'] = 'on';` enables Basic Auth over HTTP for local dev.
- **Resumable**: `scripts/upload_state.json` tracks done/skipped/failed by SKU; rerun to continue and retry failures.
- **Crash-safe**: a 502/timeout on any single car is logged and skipped — never kills the run. Concurrency kept at 3 so the local server isn't overwhelmed.

## Running detached (recommended for collection pages)

A child process dies when the Claude session tears down. For long runs launch detached:

```powershell
Start-Process -FilePath "C:\Python314\python.exe" `
  -ArgumentList "-u","scripts/scrape_upload.py","<url>","--min-year","2023" `
  -WorkingDirectory "C:\Users\HP\.claude\skills\autocango-uploader" `
  -RedirectStandardOutput "run.log" -RedirectStandardError "err.log" `
  -WindowStyle Hidden -PassThru
```

Then `tail`/Read `run.log` for progress. Single listings finish in seconds and can run inline.

## Dependencies
`curl_cffi`, `beautifulsoup4`, `requests` (all already installed).
