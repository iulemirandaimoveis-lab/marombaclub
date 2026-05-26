import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/data/admin";
import { AdminOrdersClient } from "@/components/admin/pages/orders-client";

export const metadata: Metadata = { title: "Admin — Vendas" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders(100);
  return <AdminOrdersClient orders={orders} />;
}
