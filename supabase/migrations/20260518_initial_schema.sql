-- MVP schema baseline aligned with Maromba Club rules
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

create table if not exists loyalty_points_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  entry_type text not null,
  points int not null,
  order_id uuid,
  created_at timestamptz not null default now()
);
