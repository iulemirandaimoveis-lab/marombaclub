-- Admin write policies for tables that were missing them

-- pickup_points: admin can read all (including inactive) and write
create policy "pickup_points_admin_all" on pickup_points
  for all using (is_admin()) with check (is_admin());

create policy "pickup_points_admin_read_all" on pickup_points
  for select using (is_admin());

-- store_hours: admin full access
create policy "store_hours_admin_all" on store_hours
  for all using (is_admin()) with check (is_admin());

-- inventory_locations: admin full access
create policy "inventory_locations_admin_all" on inventory_locations
  for all using (is_admin()) with check (is_admin());

-- inventory_balances: admin full access
create policy "inventory_balances_admin_all" on inventory_balances
  for all using (is_admin()) with check (is_admin());

-- delivery_drivers: admin full access (create/edit/delete drivers)
create policy "delivery_drivers_admin_all" on delivery_drivers
  for all using (is_admin()) with check (is_admin());

-- loyalty_tiers: admin full access
create policy "loyalty_tiers_admin_all" on loyalty_tiers
  for all using (is_admin()) with check (is_admin());

-- loyalty_points_ledger: admin full access
create policy "loyalty_ledger_admin_write" on loyalty_points_ledger
  for all using (is_admin()) with check (is_admin());
