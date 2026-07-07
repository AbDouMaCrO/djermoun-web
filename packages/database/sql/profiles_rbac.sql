-- Role-Based Access Control: profiles table + roles for admin / supervisor / customer.
--
-- Run in the Supabase SQL editor. Idempotent — safe to re-run.
--
-- NOTE: there is already a public.users profile table in this project (used by
-- the admin orders view). This adds a SEPARATE public.profiles table dedicated
-- to auth/role, per the RBAC spec, rather than overloading public.users.

-- 1. Role enum.
do $$
begin
  create type public.user_role as enum ('admin', 'supervisor', 'customer');
exception
  when duplicate_object then null;
end
$$;

-- 2 & 3. profiles table linked 1:1 to auth.users, with a role column.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- Guard for the case where profiles already existed without a role column.
alter table public.profiles
  add column if not exists role public.user_role not null default 'customer';

-- 4. Auto-create a profile (role = customer) on every new auth signup.
--    SECURITY DEFINER so the insert runs with the function owner's rights and
--    bypasses RLS — the new user has no session at insert time.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Admin check as a SECURITY DEFINER function. This is the key to avoiding
-- infinite recursion: a policy on public.profiles that needs to know "is the
-- caller an admin?" must NOT run a normal SELECT on public.profiles (that would
-- re-trigger the same policy). Running the lookup inside a definer function
-- bypasses RLS and breaks the cycle.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

-- 5. RLS: users read their own profile (admins read all); only admins may
--    UPDATE (i.e. change roles). No user INSERT/DELETE policy — profile rows
--    are created by the signup trigger above.
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update
on public.profiles for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- 6. Backfill: give existing auth users a profile so nobody is left without one
--    (the trigger only fires for future signups).
insert into public.profiles (id, role)
select u.id, 'customer'
from auth.users u
on conflict (id) do nothing;

-- ── BOOTSTRAP THE FIRST ADMIN ────────────────────────────────────────────────
-- Chicken-and-egg: only admins can change roles, so the first admin must be set
-- manually here (this runs as the SQL-editor superuser, bypassing RLS). Replace
-- the email, uncomment, and run once:
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
