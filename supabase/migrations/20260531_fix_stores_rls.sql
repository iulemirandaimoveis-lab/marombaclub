-- Fix stores: replace broken recursive policy with is_admin() SECURITY DEFINER
-- The old "stores_admin" policy used a direct subquery on profiles without
-- SECURITY DEFINER, causing recursive RLS evaluation that silently blocked writes.
drop policy if exists "stores_admin" on stores;

create policy "stores_admin_all" on stores
  for all using (is_admin()) with check (is_admin());

-- Restore stores_public_read to only show active stores (was set to "true")
drop policy if exists "stores_public_read" on stores;

create policy "stores_public_read" on stores
  for select using (is_active = true);
