-- ============================================================================
-- BRENN COFFEE — DATABASE SCHEMA
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  origin text not null,                    -- e.g. "Antigua, Guatemala"
  country text,                             -- e.g. "Guatemala"
  tagline text,                             -- short evocative line
  description text,                         -- long-form
  roast_level int not null check (roast_level between 1 and 5), -- 1=light, 5=dark
  process text,                             -- "Washed", "Natural", etc.
  altitude_m int,
  variety text,                             -- "Bourbon, Caturra"
  cupping_score numeric(4,1),               -- e.g. 87.5
  flavor_notes text[] default '{}',         -- ["dark chocolate", "fig", "cedar"]
  flavor_categories jsonb default '{}',     -- { "chocolate": true, "woody": true }
  body int check (body between 1 and 10),
  acidity int check (acidity between 1 and 10),
  sweetness int check (sweetness between 1 and 10),
  bitterness int check (bitterness between 1 and 10),
  aroma int check (aroma between 1 and 10),
  brewing_recs jsonb default '[]',          -- recommended brew methods
  farm_name text,
  farmer_name text,
  hero_image_url text,
  gallery_images text[] default '{}',
  price_pence int not null,                 -- price for the default 250g
  is_active boolean default true,
  is_featured boolean default false,
  is_limited boolean default false,
  inventory_kg numeric(8,2) default 0,
  reorder_threshold_kg numeric(8,2) default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product variants (sizes: 125g, 250g, 500g, 1kg + grind options)
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  size_g int not null,                      -- 125, 250, 500, 1000
  grind text not null default 'whole_bean', -- whole_bean, espresso, filter, french_press, moka_pot
  price_pence int not null,
  sku text unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index on product_variants(product_id);

-- ============================================================================
-- CUSTOMERS (linked to Supabase auth.users)
-- ============================================================================
create table customers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  marketing_consent boolean default false,
  total_spent_pence int default 0,
  order_count int default 0,
  created_at timestamptz default now()
);

create table customer_addresses (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  is_default boolean default false,
  line1 text not null,
  line2 text,
  city text not null,
  postcode text not null,
  country text default 'GB',
  created_at timestamptz default now()
);

-- ============================================================================
-- ORDERS
-- ============================================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,        -- e.g. "BR-2847"
  customer_id uuid references customers(id) on delete set null,
  email text not null,                       -- captured even for guest checkout
  status text not null default 'pending',    -- pending, paid, shipped, delivered, refunded, cancelled
  subtotal_pence int not null,
  shipping_pence int not null default 0,
  discount_pence int not null default 0,
  total_pence int not null,
  currency text default 'GBP',
  shipping_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_postcode text,
  shipping_country text default 'GB',
  stripe_payment_intent_id text,
  stripe_session_id text,
  notes text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  tracking_number text,
  tracking_url text
);

create index on orders(customer_id);
create index on orders(status);
create index on orders(created_at desc);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  variant_label text,                        -- e.g. "250g · Whole bean"
  quantity int not null check (quantity > 0),
  unit_price_pence int not null,
  line_total_pence int not null
);

create index on order_items(order_id);

-- ============================================================================
-- AUTO-GENERATE ORDER NUMBERS (BR-XXXX)
-- ============================================================================
create sequence order_number_seq start 2800;

create or replace function generate_order_number()
returns trigger as $$
begin
  new.order_number := 'BR-' || nextval('order_number_seq');
  return new;
end;
$$ language plpgsql;

create trigger set_order_number
  before insert on orders
  for each row
  when (new.order_number is null)
  execute function generate_order_number();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table products enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table customer_addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Products: anyone can read active ones
create policy "Public can view active products"
  on products for select
  using (is_active = true);

create policy "Public can view active variants"
  on product_variants for select
  using (is_active = true);

-- Customers: only see/edit own record
create policy "Users can view own customer record"
  on customers for select
  using (auth.uid() = id);

create policy "Users can update own customer record"
  on customers for update
  using (auth.uid() = id);

create policy "Users can insert own customer record"
  on customers for insert
  with check (auth.uid() = id);

-- Addresses: only own
create policy "Users can manage own addresses"
  on customer_addresses for all
  using (customer_id = auth.uid());

-- Orders: customers see their own; service role sees all (admin uses service role)
create policy "Users can view own orders"
  on orders for select
  using (customer_id = auth.uid());

create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );

-- ============================================================================
-- SEED DATA — initial products
-- ============================================================================
insert into products (slug, name, origin, country, tagline, description, roast_level, process, altitude_m, variety, cupping_score, flavor_notes, body, acidity, sweetness, bitterness, aroma, farm_name, farmer_name, price_pence, is_featured, is_limited, inventory_kg) values
(
  'ember',
  'Ember',
  'Antigua, Guatemala',
  'Guatemala',
  'A slow-roasted love letter to volcanic soil.',
  'Ember is grown on the volcanic slopes of Antigua at 1,650m. The mineral-rich soil produces a bean with extraordinary complexity. We roast it slow and dark, preserving the natural sweetness while developing notes of cocoa, dried fruit, and aromatic wood.',
  5, 'Washed', 1650, 'Bourbon, Caturra', 87.5,
  ARRAY['dark chocolate', 'dried fig', 'cedar', 'toffee', 'tobacco leaf'],
  9, 3, 7, 6, 9,
  'Finca Solana', 'Roberto Mejía',
  1900, true, true, 42
),
(
  'aurora',
  'Aurora',
  'Yirgacheffe, Ethiopia',
  'Ethiopia',
  'Bright. Floral. The morning sun in a cup.',
  'Aurora is grown in the highlands of Yirgacheffe, the spiritual home of coffee. Light-roasted to preserve the delicate jasmine and bergamot notes, this is a coffee for those who want to taste origin.',
  2, 'Washed', 1950, 'Heirloom', 89.0,
  ARRAY['jasmine', 'bergamot', 'white peach', 'lemon zest'],
  4, 9, 8, 2, 9,
  'Konga Cooperative', 'Multiple smallholders',
  1850, true, false, 28
),
(
  'solstice',
  'Solstice',
  'Huila, Colombia',
  'Colombia',
  'The everyday hero. Balanced, smooth, dependable.',
  'Solstice is our crowd-pleaser — a medium-roasted Colombian that satisfies whether you take it black or with milk. Notes of milk chocolate, caramel, and ripe cherry, with a balanced body and clean finish.',
  3, 'Washed', 1700, 'Caturra, Castillo', 86.0,
  ARRAY['milk chocolate', 'caramel', 'red cherry'],
  7, 6, 7, 4, 7,
  'Finca La Esperanza', 'Carlos Rodríguez',
  1600, true, false, 35
);

-- Insert variants for each product
insert into product_variants (product_id, size_g, grind, price_pence, sku)
select p.id, v.size_g, v.grind, 
  case 
    when v.size_g = 125 then round(p.price_pence * 0.58)
    when v.size_g = 250 then p.price_pence
    when v.size_g = 500 then round(p.price_pence * 1.84)
    when v.size_g = 1000 then round(p.price_pence * 3.26)
  end,
  upper(p.slug) || '-' || v.size_g || '-' || upper(substring(v.grind, 1, 3))
from products p
cross join (values 
  (125, 'whole_bean'), (250, 'whole_bean'), (500, 'whole_bean'), (1000, 'whole_bean'),
  (250, 'espresso'), (250, 'filter'), (250, 'french_press'), (250, 'moka_pot')
) as v(size_g, grind);
