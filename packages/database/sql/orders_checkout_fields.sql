-- Adds KYC/export fields captured by the checkout wizard.
-- Run in the Supabase SQL editor.
alter table public.orders
  add column if not exists full_name text,
  add column if not exists phone_number text,
  add column if not exists whatsapp_telegram text,
  add column if not exists destination_country_port text,
  add column if not exists deposit_date date,
  add column if not exists sales_rep_code text,
  add column if not exists passport_url text;
