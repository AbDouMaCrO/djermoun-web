-- Members Area / Client Portal: export documents the broker delivers to each
-- customer (bill of lading, export certificate, shipping paperwork, etc.).
--
-- Run in the Supabase SQL editor. Idempotent.
--
-- ADMIN MODEL: this project has no DB-level admin role — "admin" is the
-- service-role client (createAdminClient, see admin/orders/page.tsx), which
-- bypasses RLS entirely. So the policies below only constrain normal
-- (authenticated) users; admins insert/read everything via the service role,
-- exactly like the passports bucket.

-- 1. Private storage bucket (never public — these are per-customer documents).
insert into storage.buckets (id, name, public)
values ('export_documents', 'export_documents', false)
on conflict (id) do nothing;

-- 2. Storage RLS. Convention: object path is "<user_id>/<filename>", so a
--    user's ownership is the first path segment. Admins upload here via the
--    service role (RLS bypassed), so no user INSERT policy is granted — normal
--    users may only READ their own files.
drop policy if exists "export_documents_select_own" on storage.objects;
create policy "export_documents_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'export_documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Metadata table linking documents to a user (and optionally an order).
create table if not exists public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  document_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_documents_user_id_idx on public.user_documents (user_id);

-- 4. RLS: a user may only see their own rows. Inserts/updates/deletes come from
--    the admin service role (RLS bypassed), so no write policy for users.
alter table public.user_documents enable row level security;

drop policy if exists "user_documents_select_own" on public.user_documents;
create policy "user_documents_select_own"
on public.user_documents for select
to authenticated
using (user_id = auth.uid());
