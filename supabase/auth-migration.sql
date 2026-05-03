-- ============================================================================
-- BRENN COFFEE — AUTH + ADMIN ROLE MIGRATION
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================================

-- ============================================================================
-- 1. Add role + stripe_customer_id to customers
-- ============================================================================
alter table customers
  add column if not exists role text default 'customer'
  check (role in ('customer', 'admin'));

alter table customers
  add column if not exists stripe_customer_id text unique;

create index if not exists customers_role_idx on customers(role);

-- ============================================================================
-- 2. Auto-create customer row when an auth.users row is inserted
-- This means signing up via Supabase Auth automatically creates the
-- corresponding customers row, so the rest of the app can rely on it existing.
-- ============================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (id, email, first_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- 3. Allow customers to insert their own row (covers manual customer creation
--    from the app side; trigger above handles auth-side flow)
-- ============================================================================
-- Already exists from schema.sql, but ensure it's there
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'customers' and policyname = 'Users can insert own customer record'
  ) then
    create policy "Users can insert own customer record"
      on customers for insert
      with check (auth.uid() = id);
  end if;
end $$;

-- ============================================================================
-- 4. Promote a specific email to admin
-- After your first sign-up with info@cygflare.com, run:
--
--   update customers set role = 'admin' where email = 'info@cygflare.com';
--
-- (kept commented so this migration is safe to re-run)
-- ============================================================================
-- update customers set role = 'admin' where email = 'info@cygflare.com';
