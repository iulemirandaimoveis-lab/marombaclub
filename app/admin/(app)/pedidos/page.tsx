import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/data/admin";
import { AdminOrdersClient } from "@/components/admin/pages/orders-client";

export const metadata: Metadata = { title: "Admin — Pedidos" };

export default async function AdminPedidosPage() {
  const orders = await getAdminOrders(100);
  return <AdminOrdersClient orders={orders} />;
}
