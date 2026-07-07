-- Adds broker-facing pricing fields to public.cars so the admin can set a
-- commission and shipping cost on top of the vehicle's base price. The
-- public-facing "Final Price" (see apps/web) = price_cny + commission + shipping_cost.
-- Run in the Supabase SQL editor.
alter table public.cars
  add column if not exists commission numeric not null default 0,
  add column if not exists shipping_cost numeric not null default 0;
