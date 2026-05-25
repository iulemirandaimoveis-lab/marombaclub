-- =========================================================
-- Maromba Club — SaaS Platform Migration
-- =========================================================

-- =========================================================
-- ENHANCE STORES TABLE
-- =========================================================
alter table stores
  add column if not exists legal_name text,
  add column if not exists document text,
  add column if not exists email text,
  add column if not exists address_line text,
  add column if not exists address_number text,
  add column if not exists district text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zipcode text,
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7),
  add column if not exists status text not null default 'open'
    check (status in ('open','closed','paused')),
  add column if not exists accepts_delivery boolean not null default true,
  add column if not exists accepts_pickup boolean not null default true,
  add column if not exists delivery_radius_km numeric(6,2) not null default 10,
  add column if not exists base_delivery_fee_cents int not null default 0,
  add column if not exists min_order_cents int not null default 0,
  add column if not exists updated_at timestamptz not null default now();

-- =========================================================
-- PICKUP POINTS
-- =========================================================
create table if not exists pickup_points (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  name          text not null,
  address_line  text,
  address_number text,
  district      text,
  city          text,
  state         text,
  zipcode       text,
  latitude      numeric(10,7),
  longitude     numeric(10,7),
  instructions  text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =========================================================
-- STORE HOURS
-- =========================================================
create table if not exists store_hours (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  weekday     int not null check (weekday between 0 and 6),
  opens_at    time,
  closes_at   time,
  is_closed   boolean not null default false,
  unique (store_id, weekday)
);

-- =========================================================
-- INVENTORY LOCATIONS (general, warehouse, store, pickup)
-- =========================================================
create table if not exists inventory_locations (
  id        uuid primary key default gen_random_uuid(),
  store_id  uuid references stores(id) on delete cascade,
  name      text not null,
  type      text not null default 'store'
            check (type in ('store','warehouse','pickup_point')),
  active    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- INVENTORY BALANCES (derived, maintained by triggers)
-- =========================================================
create table if not exists inventory_balances (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references products(id) on delete cascade,
  location_id         uuid not null references inventory_locations(id) on delete cascade,
  quantity_available  int not null default 0,
  quantity_reserved   int not null default 0,
  quantity_minimum    int not null default 0,
  quantity_in_transit int not null default 0,
  updated_at          timestamptz not null default now(),
  unique (product_id, location_id)
);

-- =========================================================
-- DELIVERY DRIVERS
-- =========================================================
create table if not exists delivery_drivers (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  name                text not null,
  phone               text,
  document            text,
  vehicle_type        text default 'motorcycle',
  license_plate       text,
  status              text not null default 'offline'
                      check (status in ('online','offline','busy')),
  current_latitude    numeric(10,7),
  current_longitude   numeric(10,7),
  last_location_at    timestamptz,
  active              boolean not null default true,
  store_id            uuid references stores(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =========================================================
-- DELIVERIES
-- =========================================================
create table if not exists deliveries (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null unique references orders(id) on delete cascade,
  store_id            uuid references stores(id),
  driver_id           uuid references delivery_drivers(id),
  status              text not null default 'pending'
                      check (status in (
                        'pending','assigned','driver_heading_to_store',
                        'driver_at_store','picked_up','driver_heading_to_customer',
                        'driver_at_customer','delivered','cancelled','failed'
                      )),
  pickup_address      text,
  pickup_latitude     numeric(10,7),
  pickup_longitude    numeric(10,7),
  dropoff_address     text,
  dropoff_latitude    numeric(10,7),
  dropoff_longitude   numeric(10,7),
  estimated_minutes   int,
  estimated_arrival_at timestamptz,
  assigned_at         timestamptz,
  picked_up_at        timestamptz,
  delivered_at        timestamptz,
  proof_url           text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =========================================================
-- DELIVERY TRACKING EVENTS
-- =========================================================
create table if not exists delivery_tracking_events (
  id          uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  driver_id   uuid references delivery_drivers(id),
  latitude    numeric(10,7) not null,
  longitude   numeric(10,7) not null,
  speed       numeric(6,2),
  heading     numeric(6,2),
  event_type  text not null default 'location_update'
              check (event_type in (
                'location_update','arrived_at_store','picked_up',
                'arrived_at_customer','delivered','status_change'
              )),
  created_at  timestamptz not null default now()
);

-- =========================================================
-- PAYMENT PROVIDERS CONFIG (per store)
-- =========================================================
create table if not exists payment_providers (
  id                  uuid primary key default gen_random_uuid(),
  store_id            uuid references stores(id) on delete cascade,
  provider            text not null
                      check (provider in ('pagbank','mercadopago','pagarme','cora')),
  enabled             boolean not null default false,
  environment         text not null default 'sandbox'
                      check (environment in ('sandbox','production')),
  public_key          text,
  encrypted_secret_ref text,
  webhook_secret_ref  text,
  settings_json       jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (store_id, provider)
);

-- =========================================================
-- PAYMENTS (normalized payment records)
-- =========================================================
create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  customer_id         uuid not null references profiles(id),
  provider            text not null
                      check (provider in ('pagbank','mercadopago','pagarme','cora','demo')),
  method              text not null
                      check (method in ('pix','credit_card','debit_card','boleto')),
  status              text not null default 'pending'
                      check (status in (
                        'pending','processing','authorized','paid',
                        'refused','cancelled','refunded','expired','chargeback'
                      )),
  amount_cents        int not null check (amount_cents > 0),
  currency            char(3) not null default 'BRL',
  provider_payment_id text,
  provider_order_id   text,
  idempotency_key     text unique,
  pix_qr_code         text,
  pix_copy_paste      text,
  payment_url         text,
  expires_at          timestamptz,
  paid_at             timestamptz,
  refunded_at         timestamptz,
  failed_reason       text,
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =========================================================
-- CUSTOMER PAYMENT METHODS (tokenized cards)
-- =========================================================
create table if not exists customer_payment_methods (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references profiles(id) on delete cascade,
  provider            text not null
                      check (provider in ('pagbank','mercadopago','pagarme')),
  provider_customer_id text,
  provider_card_id    text not null,
  brand               text,
  last4               char(4),
  exp_month           int check (exp_month between 1 and 12),
  exp_year            int,
  holder_name         text,
  is_default          boolean not null default false,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =========================================================
-- PAYMENT WEBHOOK EVENTS (idempotent log)
-- =========================================================
create table if not exists payment_webhook_events (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null,
  event_id      text not null,
  event_type    text not null,
  payload       jsonb not null,
  processed     boolean not null default false,
  processed_at  timestamptz,
  error         text,
  created_at    timestamptz not null default now(),
  unique (provider, event_id)
);

-- =========================================================
-- ADD MISSING COLUMNS TO PROFILES
-- =========================================================
alter table profiles
  add column if not exists cpf text,
  add column if not exists avatar_url text,
  add column if not exists address_line text,
  add column if not exists address_number text,
  add column if not exists district text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zipcode text;

-- Add entregador role to profiles if not already there
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin_global','store_manager','seller','customer','entregador','financeiro','estoque'));

-- =========================================================
-- ADD PAYMENT COLUMNS TO ORDERS
-- =========================================================
alter table orders
  add column if not exists payment_provider text,
  add column if not exists payment_id uuid references payments(id),
  add column if not exists driver_lat numeric(10,7),
  add column if not exists driver_lng numeric(10,7),
  add column if not exists pickup_point_id uuid references pickup_points(id),
  add column if not exists estimated_delivery_at timestamptz,
  add column if not exists delivered_at timestamptz;

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_pickup_points_store on pickup_points(store_id);
create index if not exists idx_store_hours_store on store_hours(store_id);
create index if not exists idx_inventory_locations_store on inventory_locations(store_id);
create index if not exists idx_inventory_balances_product on inventory_balances(product_id);
create index if not exists idx_inventory_balances_location on inventory_balances(location_id);
create index if not exists idx_delivery_drivers_status on delivery_drivers(status);
create index if not exists idx_deliveries_order on deliveries(order_id);
create index if not exists idx_deliveries_driver on deliveries(driver_id);
create index if not exists idx_deliveries_status on deliveries(status);
create index if not exists idx_delivery_tracking_delivery on delivery_tracking_events(delivery_id);
create index if not exists idx_payments_order on payments(order_id);
create index if not exists idx_payments_customer on payments(customer_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_customer_payment_methods_customer on customer_payment_methods(customer_id);
create index if not exists idx_payment_webhook_events_provider_id on payment_webhook_events(provider, event_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table pickup_points enable row level security;
alter table store_hours enable row level security;
alter table inventory_locations enable row level security;
alter table inventory_balances enable row level security;
alter table delivery_drivers enable row level security;
alter table deliveries enable row level security;
alter table delivery_tracking_events enable row level security;
alter table payment_providers enable row level security;
alter table payments enable row level security;
alter table customer_payment_methods enable row level security;
alter table payment_webhook_events enable row level security;

-- Pickup points: public read
create policy "pickup_points_public_read" on pickup_points
  for select using (active = true);

-- Store hours: public read
create policy "store_hours_public_read" on store_hours
  for select using (true);

-- Inventory locations: public read
create policy "inventory_locations_public_read" on inventory_locations
  for select using (active = true);

-- Inventory balances: public read
create policy "inventory_balances_public_read" on inventory_balances
  for select using (true);

-- Delivery drivers: own row
create policy "delivery_drivers_own" on delivery_drivers
  for all using (auth.uid() = user_id);

-- Admin can see all drivers
create policy "delivery_drivers_admin_read" on delivery_drivers
  for select using (is_admin());

-- Deliveries: customer sees own order's delivery
create policy "deliveries_customer_read" on deliveries
  for select using (
    exists (
      select 1 from orders
      where orders.id = deliveries.order_id
      and orders.customer_id = auth.uid()
    )
  );

-- Delivery drivers see their deliveries
create policy "deliveries_driver_read" on deliveries
  for select using (
    exists (
      select 1 from delivery_drivers
      where delivery_drivers.id = deliveries.driver_id
      and delivery_drivers.user_id = auth.uid()
    )
  );

-- Driver can update their deliveries
create policy "deliveries_driver_update" on deliveries
  for update using (
    exists (
      select 1 from delivery_drivers
      where delivery_drivers.id = deliveries.driver_id
      and delivery_drivers.user_id = auth.uid()
    )
  );

-- Admin sees all deliveries
create policy "deliveries_admin_all" on deliveries
  for all using (is_admin());

-- Tracking events: customer can read
create policy "tracking_events_customer_read" on delivery_tracking_events
  for select using (
    exists (
      select 1 from deliveries d
      join orders o on o.id = d.order_id
      where d.id = delivery_tracking_events.delivery_id
      and o.customer_id = auth.uid()
    )
  );

-- Driver inserts tracking events
create policy "tracking_events_driver_insert" on delivery_tracking_events
  for insert with check (
    exists (
      select 1 from delivery_drivers
      where delivery_drivers.user_id = auth.uid()
      and delivery_drivers.id = delivery_tracking_events.driver_id
    )
  );

-- Payments: customer sees own
create policy "payments_customer_read" on payments
  for select using (auth.uid() = customer_id);

-- Admin sees all
create policy "payments_admin_all" on payments
  for all using (is_admin());

-- Customer payment methods: own
create policy "customer_payment_methods_own" on customer_payment_methods
  for all using (auth.uid() = customer_id);

-- Payment providers: admin only
create policy "payment_providers_admin" on payment_providers
  for all using (is_admin());

-- Webhook events: service role only (no user RLS needed)
create policy "webhook_events_service" on payment_webhook_events
  for all using (is_admin());

-- =========================================================
-- FUNCTION: update inventory balance from movements
-- =========================================================
create or replace function update_inventory_balance()
returns trigger language plpgsql security definer as $$
declare
  delta int;
begin
  -- Only process movements with a location_id
  if NEW.location_id is null then
    return NEW;
  end if;

  delta := NEW.quantity;

  insert into inventory_balances (product_id, location_id, quantity_available)
  values (NEW.product_id, NEW.location_id, greatest(0, delta))
  on conflict (product_id, location_id)
  do update set
    quantity_available = greatest(0, inventory_balances.quantity_available + delta),
    updated_at = now();

  return NEW;
end;
$$;

-- =========================================================
-- ADD location_id to inventory_movements if not exists
-- =========================================================
alter table inventory_movements
  add column if not exists location_id uuid references inventory_locations(id);

-- =========================================================
-- SEED: default inventory location for each store
-- =========================================================
insert into inventory_locations (store_id, name, type)
select id, name || ' - Estoque', 'store'
from stores
where not exists (
  select 1 from inventory_locations il where il.store_id = stores.id
);

-- =========================================================
-- SEED: Default store hours (Mon-Sat 8am-6pm, Sun closed)
-- =========================================================
insert into store_hours (store_id, weekday, opens_at, closes_at, is_closed)
select
  s.id,
  d.weekday,
  case when d.weekday = 0 then null else '08:00'::time end,
  case when d.weekday = 0 then null else '18:00'::time end,
  case when d.weekday = 0 then true else false end
from stores s
cross join (select generate_series(0, 6) as weekday) d
on conflict (store_id, weekday) do nothing;
