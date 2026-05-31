import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { InventoryBalances } from "@/components/admin/pages/inventory-balances";

export const metadata: Metadata = { title: "Admin — Estoque" };
export const dynamic = "force-dynamic";

async function getInventoryBalances() {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("inventory_balances")
      .select(`
        id, product_id, location_id,
        quantity_available, quantity_reserved, quantity_minimum, quantity_in_transit,
        updated_at,
        product:products(name, brand, image_url, sku),
        location:inventory_locations(name, type, store:stores(name))
      `)
      .order("updated_at", { ascending: false });
    return (data ?? []) as any[];
  } catch {
    return [];
  }
}

export default async function AdminInventoryPage() {
  const balances = await getInventoryBalances();
  return <InventoryBalances balances={balances} />;
}
