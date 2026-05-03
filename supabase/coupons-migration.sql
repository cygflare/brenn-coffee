-- ============================================================================
-- BRENN COFFEE — COUPON / DISCOUNT SYSTEM MIGRATION
-- Run this in the Supabase SQL Editor AFTER schema.sql + auth-migration.sql
-- ============================================================================

-- ============================================================================
-- 1. COUPONS table
-- ============================================================================
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,                          -- always stored UPPERCASE
  description text,                                   -- internal/admin description

  -- Discount mechanics
  discount_type text not null check (discount_type in ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value int not null check (discount_value >= 0),  -- % (1-100) or pence (fixed)

  -- Limits
  min_subtotal_pence int not null default 0,          -- minimum cart subtotal required
  max_discount_pence int,                             -- cap for % discounts (null = no cap)
  usage_limit int,                                    -- total redemptions allowed (null = unlimited)
  usage_limit_per_customer int,                       -- per-customer redemption limit (null = unlimited)
  times_used int not null default 0,                  -- counter (incremented by webhook)

  -- Eligibility
  starts_at timestamptz,                              -- null = always
  expires_at timestamptz,                             -- null = never expires
  is_active boolean not null default true,
  first_order_only boolean not null default false,    -- only redeemable on customer's first order
  applies_to_subscription boolean not null default true, -- include subscription items?
  applies_to_one_time boolean not null default true,     -- include one-time items?
  product_ids uuid[] default '{}',                    -- if non-empty, only these products qualify

  -- Audit
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists coupons_code_idx on coupons(upper(code));
create index if not exists coupons_active_idx on coupons(is_active) where is_active = true;

-- Enforce code uppercase
create or replace function coupons_normalize_code()
returns trigger
language plpgsql
as $$
begin
  new.code := upper(trim(new.code));
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists coupons_normalize on coupons;
create trigger coupons_normalize
  before insert or update on coupons
  for each row execute function coupons_normalize_code();

-- ============================================================================
-- 2. COUPON_REDEMPTIONS — one row per successful order that used a coupon
-- ============================================================================
create table if not exists coupon_redemptions (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  email text not null,
  discount_pence int not null,
  created_at timestamptz default now(),
  unique (coupon_id, order_id)                        -- one redemption row per order
);

create index if not exists coupon_redemptions_coupon_idx on coupon_redemptions(coupon_id);
create index if not exists coupon_redemptions_customer_idx on coupon_redemptions(customer_id);
create index if not exists coupon_redemptions_email_idx on coupon_redemptions(lower(email));

-- Auto-increment coupons.times_used when a redemption is recorded
create or replace function coupon_redemptions_bump_counter()
returns trigger
language plpgsql
as $$
begin
  update coupons set times_used = times_used + 1 where id = new.coupon_id;
  return new;
end;
$$;

drop trigger if exists coupon_redemptions_bump on coupon_redemptions;
create trigger coupon_redemptions_bump
  after insert on coupon_redemptions
  for each row execute function coupon_redemptions_bump_counter();

-- ============================================================================
-- 3. ORDERS — record which coupon was applied
-- ============================================================================
alter table orders
  add column if not exists coupon_code text;

create index if not exists orders_coupon_code_idx on orders(coupon_code) where coupon_code is not null;

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- All coupon read/write happens via service-role (admin endpoints + webhooks).
-- We enable RLS to prevent any direct anon/auth access.
-- ============================================================================
alter table coupons enable row level security;
alter table coupon_redemptions enable row level security;

-- Customers can see their own redemption history
create policy "Users can view own coupon redemptions"
  on coupon_redemptions for select
  using (customer_id = auth.uid());

-- ============================================================================
-- 5. HELPFUL VIEW for admin stats
-- ============================================================================
create or replace view coupon_stats as
select
  c.id,
  c.code,
  c.discount_type,
  c.discount_value,
  c.is_active,
  c.expires_at,
  c.usage_limit,
  c.times_used,
  coalesce(sum(r.discount_pence), 0)::int as total_discount_pence,
  count(distinct r.customer_id) filter (where r.customer_id is not null) as unique_customers,
  count(r.id) as total_redemptions
from coupons c
left join coupon_redemptions r on r.coupon_id = c.id
group by c.id;
