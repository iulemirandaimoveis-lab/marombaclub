-- Fix recursive RLS policies that caused products to return empty
-- and admin access to be blocked

-- Drop the recursive profiles_admin_read policy
-- (profiles_own_select with is_admin() SECURITY DEFINER already handles admin reads)
drop policy if exists "profiles_admin_read" on profiles;

-- Fix products_admin_write to use is_admin() (non-recursive)
drop policy if exists "products_admin_write" on products;
create policy "products_admin_write" on products
  for all using (is_admin())
  with check (is_admin());

drop policy if exists "categories_admin_write" on product_categories;
create policy "categories_admin_write" on product_categories
  for all using (is_admin())
  with check (is_admin());

drop policy if exists "inventory_movements_admin_write" on inventory_movements;
create policy "inventory_movements_admin_write" on inventory_movements
  for all using (is_admin());

drop policy if exists "orders_admin_all" on orders;
create policy "orders_admin_all" on orders
  for all using (is_admin());

drop policy if exists "order_items_admin_read" on order_items;
create policy "order_items_admin_read" on order_items
  for select using (is_admin());

drop policy if exists "coupons_admin_write" on coupons;
create policy "coupons_admin_write" on coupons
  for all using (is_admin())
  with check (is_admin());

-- Update is_admin() to cover store_manager + seller (needed for admin panel)
create or replace function is_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('admin_global', 'store_manager', 'seller')
  );
$$;
