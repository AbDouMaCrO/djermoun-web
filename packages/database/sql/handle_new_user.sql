-- Recreates the auth.users -> public.users profile trigger to accept
-- phone-only signups (Supabase Phone OTP), not just email signups.
--
-- Run this in the Supabase SQL editor. It's idempotent (CREATE OR REPLACE).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, phone_number, full_name)
  values (
    new.id,
    new.email,
    new.phone,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
