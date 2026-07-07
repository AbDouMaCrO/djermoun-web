-- Add `fob_price` numeric column to public.cars and reload PostgREST schema
-- Run this in the Supabase SQL editor or via psql.

ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS fob_price NUMERIC;

-- Ask PostgREST to reload its schema cache so new column appears in the REST API
NOTIFY pgrst, 'reload schema';

-- Notes:
-- - This leaves the column nullable; set a DEFAULT or run an UPDATE to backfill if needed.
-- - To run via psql, use: psql "postgresql://<user>:<pass>@<host>:<port>/<db>" -c "$(cat add_fob_price.sql)"