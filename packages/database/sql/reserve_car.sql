-- RECONSTRUCTED, NOT THE ORIGINAL SOURCE.
-- This repo has no tracked migrations, so the real current reserve_car()
-- can't be diffed. This is rebuilt from how apps/web/src/app/actions/reserve.ts
-- calls it (p_user_id, p_car_id -> returns an order id; raises on conflict).
-- Compare against the live function in Supabase before running — the
-- concurrency-lock semantics in particular may not match exactly.
create or replace function public.reserve_car(
  p_user_id uuid,
  p_car_id uuid,
  p_full_name text,
  p_phone_number text,
  p_whatsapp_telegram text,
  p_destination_country_port text,
  p_deposit_date date,
  p_passport_url text,
  p_sales_rep_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_price numeric;
begin
  -- Atomically claim the car: only succeeds if it's still available.
  update public.cars
  set status = 'reserved'
  where id = p_car_id and status = 'available'
  returning price_local into v_price;

  if not found then
    raise exception 'This vehicle is no longer available.';
  end if;

  insert into public.orders (
    user_id, car_id, status, total_price,
    full_name, phone_number, whatsapp_telegram,
    destination_country_port, deposit_date, sales_rep_code, passport_url
  ) values (
    p_user_id, p_car_id, 'pending_payment', v_price,
    p_full_name, p_phone_number, p_whatsapp_telegram,
    p_destination_country_port, p_deposit_date, p_sales_rep_code, p_passport_url
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;
