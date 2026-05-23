-- =========================================================
-- SELLER COMMISSIONS
-- =========================================================
create table if not exists seller_commissions (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references profiles(id) on delete cascade,
  order_id        uuid not null references orders(id) on delete cascade,
  amount_cents    int not null default 0 check (amount_cents >= 0),
  rate_percent    numeric(5,2) not null default 0 check (rate_percent >= 0),
  status          text not null default 'PENDENTE'
                  check (status in ('PENDENTE', 'APROVADO', 'PAGO', 'CANCELADO')),
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_seller_commissions_seller_id on seller_commissions(seller_id);
create index if not exists idx_seller_commissions_order_id  on seller_commissions(order_id);
create index if not exists idx_seller_commissions_status    on seller_commissions(status);

-- RLS
alter table seller_commissions enable row level security;

-- Admin can read/write all commissions
create policy "admins manage commissions"
  on seller_commissions
  for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin_global', 'store_manager')
    )
  );

-- Sellers can view their own commissions
create policy "sellers view own commissions"
  on seller_commissions
  for select
  using (
    seller_id = auth.uid()
    and exists (
      select 1 from profiles
      where id = auth.uid()
        and role = 'seller'
    )
  );
