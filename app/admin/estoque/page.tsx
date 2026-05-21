import type { Metadata } from "next";
import { getInventory, getInventoryMovements } from "@/lib/data/admin";
import { AdminInventoryClient } from "@/components/admin/pages/inventory-client";

export const metadata: Metadata = { title: "Admin — Estoque" };

export default async function AdminInventoryPage() {
  const [inventory, movements] = await Promise.all([
    getInventory(),
    getInventoryMovements(50),
  ]);
  return <AdminInventoryClient inventory={inventory} movements={movements} />;
}
