-- Passport/KYC document storage.
--
-- NOTE: kept PRIVATE, not public. A "public" bucket serves objects to anyone
-- with the URL and no auth — incompatible with "restrict reads to the
-- uploader and admin". Passport scans are sensitive KYC docs; admin access
-- goes through the service-role client (bypasses RLS, see admin/orders/page.tsx)
-- and a short-lived signed URL, never a public link.
insert into storage.buckets (id, name, public)
values ('passports', 'passports', false)
on conflict (id) do nothing;

-- Convention: object path is "<user_id>/<filename>" — ownership is enforced
-- by path prefix, matching what the checkout form uploads to.
drop policy if exists "passports_insert_own" on storage.objects;
create policy "passports_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'passports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "passports_select_own" on storage.objects;
create policy "passports_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'passports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- No admin SELECT policy: the admin dashboard reads via createAdminClient()
-- (service-role key), which bypasses RLS entirely.
