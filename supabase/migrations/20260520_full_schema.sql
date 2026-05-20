-- =========================================================
-- Maromba Club — Full MVP Schema
-- =========================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =========================================================
-- STORES
-- =========================================================
create table if not exists stores (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  phone       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- PROFILES (extends Supabase Auth users)
-- =========================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  phone       text,
  birth_date  date,
  role        text not null default 'customer'
              check (role in ('admin_global', 'store_manager', 'seller', 'customer')),
  store_id    uuid references stores(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =========================================================
-- PRODUCT CATEGORIES
-- =========================================================
create table if not exists product_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  slug  text not null unique,
  icon  text
);

-- =========================================================
-- PRODUCTS
-- =========================================================
create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  brand               text not null,
  category_id         uuid references product_categories(id),
  barcode_ean         text unique,
  sku                 text unique,
  description         text,
  price_cents         int not null check (price_cents >= 0),
  cost_cents          int check (cost_cents >= 0),
  flavor              text,
  weight_volume       text,
  unit                text,
  is_active           boolean not null default true,
  is_club_exclusive   boolean not null default false,
  image_url           text,
  nutritional_info    jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =========================================================
-- PRODUCT IMAGES
-- =========================================================
create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int not null default 0
);

-- =========================================================
-- INVENTORY (current qty per store, derived from movements)
-- =========================================================
create table if not exists inventory (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id),
  product_id    uuid not null references products(id),
  quantity      int not null default 0,
  min_quantity  int not null default 0,
  updated_at    timestamptz not null default now(),
  unique (store_id, product_id)
);

-- =========================================================
-- INVENTORY MOVEMENTS (ledger — never edit, only append)
-- =========================================================
create table if not exists inventory_movements (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references stores(id),
  product_id      uuid not null references products(id),
  movement_type   text not null check (movement_type in (
    'ENTRADA_COMPRA',
    'VENDA',
    'TRANSFERENCIA_SAIDA',
    'TRANSFERENCIA_ENTRADA',
    'AJUSTE_POSITIVO',
    'AJUSTE_NEGATIVO',
    'DEVOLUCAO',
    'PERDA_VALIDADE'
  )),
  quantity        int not null check (quantity <> 0),
  reason          text,
  order_id        uuid,
  transfer_id     uuid,
  lot             text,
  expires_at      date,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now()
);

-- =========================================================
-- STOCK TRANSFERS
-- =========================================================
create table if not exists stock_transfers (
  id              uuid primary key default gen_random_uuid(),
  from_store_id   uuid not null references stores(id),
  to_store_id     uuid not null references stores(id),
  product_id      uuid not null references products(id),
  quantity        int not null check (quantity > 0),
  status          text not null default 'PENDENTE'
                  check (status in ('PENDENTE', 'CONCLUIDO', 'CANCELADO')),
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now()
);

-- =========================================================
-- ORDERS
-- =========================================================
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references profiles(id),
  store_id          uuid references stores(id),
  status            text not null default 'CRIADO'
                    check (status in (
                      'CRIADO','AGUARDANDO_PAGAMENTO','PAGO',
                      'EM_SEPARACAO','PRONTO_PARA_RETIRADA',
                      'ENVIADO','ENTREGUE','CANCELADO','REEMBOLSADO'
                    )),
  payment_status    text not null default 'PENDENTE'
                    check (payment_status in (
                      'PENDENTE','AUTORIZADO','PAGO',
                      'RECUSADO','CANCELADO','ESTORNADO','EXPIRADO'
                    )),
  subtotal_cents    int not null check (subtotal_cents >= 0),
  discount_cents    int not null default 0 check (discount_cents >= 0),
  shipping_cents    int not null default 0 check (shipping_cents >= 0),
  total_cents       int not null check (total_cents >= 0),
  points_earned     int not null default 0,
  points_redeemed   int not null default 0,
  delivery_type     text not null default 'delivery'
                    check (delivery_type in ('delivery', 'pickup')),
  coupon_code       text,
  delivery_address  jsonb,
  pagbank_order_id  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- =========================================================
-- ORDER ITEMS
-- =========================================================
create table if not exists order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  product_id      uuid not null references products(id),
  quantity        int not null check (quantity > 0),
  unit_price_cents int not null check (unit_price_cents >= 0),
  total_cents     int not null check (total_cents >= 0)
);

-- =========================================================
-- PAYMENTS (PagBank events)
-- =========================================================
create table if not exists payment_events (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references orders(id),
  event_id          text not null unique,   -- idempotency key
  event_type        text not null,
  payload           jsonb not null,
  processed_at      timestamptz not null default now()
);

-- =========================================================
-- LOYALTY ACCOUNTS
-- =========================================================
create table if not exists loyalty_accounts (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null unique references profiles(id),
  total_points    int not null default 0,
  lifetime_points int not null default 0,
  tier            text not null default 'Bronze'
                  check (tier in ('Bronze','Silver','Gold','Black','Beast Mode')),
  created_at      timestamptz not null default now()
);

-- =========================================================
-- LOYALTY TIERS CONFIG
-- =========================================================
create table if not exists loyalty_tiers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  min_points  int not null,
  multiplier  numeric(4,2) not null default 1.0
);

insert into loyalty_tiers (name, min_points, multiplier) values
  ('Bronze',     0,    1.0),
  ('Silver',     500,  1.0),
  ('Gold',       1500, 1.5),
  ('Black',      4000, 2.0),
  ('Beast Mode', 8000, 3.0)
on conflict (name) do nothing;

-- =========================================================
-- LOYALTY POINTS LEDGER (never edit, only append)
-- =========================================================
create table if not exists loyalty_points_ledger (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references profiles(id),
  entry_type    text not null check (entry_type in (
    'CREDITO_COMPRA',
    'CREDITO_CAMPANHA',
    'CREDITO_INDICACAO',
    'CREDITO_ANIVERSARIO',
    'DEBITO_RESGATE',
    'DEBITO_EXPIRACAO',
    'DEBITO_ESTORNO'
  )),
  points        int not null check (points <> 0),
  order_id      uuid references orders(id),
  description   text,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- =========================================================
-- LOYALTY REWARDS
-- =========================================================
create table if not exists loyalty_rewards (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  points_cost   int not null check (points_cost > 0),
  reward_type   text not null check (reward_type in (
    'DESCONTO','PRODUTO','FRETE_GRATIS','BRINDE','KIT','ACESSO_VIP'
  )),
  value_cents   int,
  product_id    uuid references products(id),
  is_active     boolean not null default true,
  image_url     text,
  created_at    timestamptz not null default now()
);

-- =========================================================
-- LOYALTY REDEMPTIONS
-- =========================================================
create table if not exists loyalty_redemptions (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  reward_id   uuid not null references loyalty_rewards(id),
  points_used int not null check (points_used > 0),
  order_id    uuid references orders(id),
  status      text not null default 'PENDENTE'
              check (status in ('PENDENTE','APROVADO','CANCELADO')),
  created_at  timestamptz not null default now()
);

-- =========================================================
-- LOYALTY CAMPAIGNS
-- =========================================================
create table if not exists loyalty_campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  multiplier    numeric(4,2) not null default 2.0,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  product_id    uuid references products(id),
  category_id   uuid references product_categories(id),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- =========================================================
-- COUPONS
-- =========================================================
create table if not exists coupons (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  discount_type       text not null check (discount_type in ('PERCENTUAL','FIXO')),
  discount_value      int not null check (discount_value > 0),
  min_order_cents     int not null default 0,
  max_uses            int,
  used_count          int not null default 0,
  expires_at          timestamptz,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

-- =========================================================
-- REFERRALS
-- =========================================================
create table if not exists referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references profiles(id),
  referred_id     uuid references profiles(id),
  code            text not null unique,
  status          text not null default 'PENDENTE'
                  check (status in ('PENDENTE','CONCLUIDO')),
  points_awarded  int not null default 0,
  created_at      timestamptz not null default now()
);

-- =========================================================
-- AUDIT LOGS
-- =========================================================
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  action      text not null,
  table_name  text not null,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip          text,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_products_barcode on products(barcode_ean);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_inventory_store_product on inventory(store_id, product_id);
create index if not exists idx_inventory_movements_store on inventory_movements(store_id);
create index if not exists idx_inventory_movements_product on inventory_movements(product_id);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_loyalty_ledger_customer on loyalty_points_ledger(customer_id);
create index if not exists idx_audit_logs_table on audit_logs(table_name, record_id);
create index if not exists idx_payment_events_event_id on payment_events(event_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table profiles enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;
alter table inventory_movements enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table loyalty_accounts enable row level security;
alter table loyalty_points_ledger enable row level security;
alter table loyalty_rewards enable row level security;
alter table loyalty_redemptions enable row level security;
alter table payment_events enable row level security;
alter table audit_logs enable row level security;

-- Profiles: own row visible
create policy "profiles_own" on profiles
  for all using (auth.uid() = id);

-- Products: public read
create policy "products_public_read" on products
  for select using (is_active = true);

-- Stores: public read
create policy "stores_public_read" on stores
  for select using (is_active = true);

-- Inventory: public read
create policy "inventory_public_read" on inventory
  for select using (true);

-- Orders: customer sees own orders
create policy "orders_own" on orders
  for all using (auth.uid() = customer_id);

-- Loyalty accounts: own
create policy "loyalty_accounts_own" on loyalty_accounts
  for all using (auth.uid() = customer_id);

-- Loyalty ledger: own
create policy "loyalty_ledger_own" on loyalty_points_ledger
  for select using (auth.uid() = customer_id);

-- Loyalty rewards: public read
create policy "loyalty_rewards_public" on loyalty_rewards
  for select using (is_active = true);

-- =========================================================
-- FUNCTIONS
-- =========================================================

-- Update inventory quantity from movements
create or replace function update_inventory_from_movement()
returns trigger language plpgsql security definer as $$
begin
  insert into inventory (store_id, product_id, quantity)
  values (NEW.store_id, NEW.product_id, NEW.quantity)
  on conflict (store_id, product_id)
  do update set
    quantity = inventory.quantity + NEW.quantity,
    updated_at = now();
  return NEW;
end;
$$;

create trigger trg_inventory_movement
  after insert on inventory_movements
  for each row execute function update_inventory_from_movement();

-- Update loyalty account tier
create or replace function update_loyalty_tier()
returns trigger language plpgsql security definer as $$
declare
  new_tier text;
begin
  select name into new_tier
  from loyalty_tiers
  where min_points <= NEW.total_points
  order by min_points desc
  limit 1;

  NEW.tier = coalesce(new_tier, 'Bronze');
  return NEW;
end;
$$;

create trigger trg_loyalty_tier
  before update on loyalty_accounts
  for each row when (OLD.total_points <> NEW.total_points)
  execute function update_loyalty_tier();

-- Update loyalty account balance from ledger
create or replace function update_loyalty_balance()
returns trigger language plpgsql security definer as $$
begin
  insert into loyalty_accounts (customer_id, total_points, lifetime_points)
  values (NEW.customer_id, NEW.points, greatest(NEW.points, 0))
  on conflict (customer_id)
  do update set
    total_points    = loyalty_accounts.total_points + NEW.points,
    lifetime_points = case
      when NEW.points > 0
      then loyalty_accounts.lifetime_points + NEW.points
      else loyalty_accounts.lifetime_points
    end;
  return NEW;
end;
$$;

create trigger trg_loyalty_balance
  after insert on loyalty_points_ledger
  for each row execute function update_loyalty_balance();
