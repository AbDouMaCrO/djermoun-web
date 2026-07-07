# Autocango Scraper Service

FastAPI microservice that scrapes an autocango.com listing, uploads its images to
Supabase Storage, inserts a row into `public.cars`, and returns the record.

## Setup

1. Create the env file and fill in your Supabase project values:
   ```bash
   cp .env.example .env
   ```
   ```
   SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # bypasses RLS — keep secret
   ```

2. Prerequisites in Supabase:
   - Storage bucket **`car_images`**, set to **public**.
   - `public.cars` has columns: `make, model, year, mileage, price_cny,
     exterior_color, fuel, transmission, engine, source_url, images,
     primary_image, status`.

## Run

```bash
./start.sh        # macOS/Linux/Git-Bash
start.bat         # Windows (double-click or run in cmd)
```

First run creates a **Python 3.12** venv and installs `requirements.txt`
(3.12 avoids the `curl_cffi` wheel gap on 3.14). Server starts on
**http://localhost:8000** with auto-reload.

## API

```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.autocango.com/sku/usedcar-BYD-Qin-Plus-ACU90577600"}'
```

`GET /health` → `{"ok": true}`

The Next.js admin dashboard (`/admin/dashboard`) calls this via the
`scrapeVehicleAction` server action; it expects the service at `:8000`
(override with `SCRAPER_URL` in the web app's env).
