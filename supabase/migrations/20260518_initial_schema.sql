create extension if not exists pgcrypto;

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  barcode_ean text unique,
  price_cents int not null check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id),
  product_id uuid not null references products(id),
  movement_type text not null,
  quantity int not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  store_id uuid references stores(id),
  status text not null,
  subtotal_cents int not null check (subtotal_cents >= 0),
  discount_cents int not null default 0 check (discount_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null check (quantity > 0),
  unit_price_cents int not null check (unit_price_cents >= 0)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null,
  payment_status text not null,
  amount_cents int not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  order_id uuid not null references orders(id) on delete cascade,
  payment_status text not null,
  raw_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique,
  tier_name text not null default 'Bronze',
  created_at timestamptz not null default now()
);

create table if not exists loyalty_points_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  entry_type text not null,
  points int not null,
  order_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists loyalty_rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points_cost int not null check (points_cost > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table products enable row level security;
alter table orders enable row level security;
alter table loyalty_accounts enable row level security;

create policy if not exists products_public_read_active
on products for select
using (is_active = true);

create policy if not exists orders_owner_access
on orders for select
using (auth.uid() = customer_id);

create policy if not exists loyalty_owner_access
on loyalty_accounts for select
using (auth.uid() = customer_id);
