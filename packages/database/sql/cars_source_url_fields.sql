-- Editable listing title + original source links for the admin car editor.
-- The admin updateCarDetails() action uses a plain PostgREST UPDATE, which
-- hard-fails (400) if any column is missing — so all three must exist. title
-- and source_url likely exist already; autohome_url is the new one. All guarded
-- with IF NOT EXISTS so this is safe to run regardless of current state.
alter table public.cars
  add column if not exists title text,
  add column if not exists source_url text,
  add column if not exists autohome_url text;
