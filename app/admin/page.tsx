import type { Metadata } from "next";
import { getAdminStats, getAdminOrders, getInventory } from "@/lib/data/admin";
import { AdminDashboardReal } from "@/components/admin/admin-dashboard-real";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminPage() {
  const [stats, orders, inventory] = await Promise.all([
    getAdminStats(),
    getAdminOrders(5),
    getInventory(),
  ]);

  const lowStock = inventory.filter((i) => i.is_low).slice(0, 5);

  return <AdminDashboardReal stats={stats} recentOrders={orders} lowStock={lowStock} />;
}
