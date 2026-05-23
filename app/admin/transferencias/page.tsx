import type { Metadata } from "next";
import { getStockTransfers, getStores, getAdminProducts } from "@/lib/data/admin";
import { AdminTransfersClient } from "@/components/admin/pages/transfers-client";

export const metadata: Metadata = { title: "Admin — Transferências de Estoque" };

export default async function AdminTransfersPage() {
  const [transfers, stores, products] = await Promise.all([
    getStockTransfers(),
    getStores(),
    getAdminProducts(),
  ]);
  return <AdminTransfersClient transfers={transfers} stores={stores} products={products} />;
}
