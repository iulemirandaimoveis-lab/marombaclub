import type { Metadata } from "next";
import { getStores } from "@/lib/data/admin";
import { AdminStoresClient } from "@/components/admin/pages/stores-client";

export const metadata: Metadata = { title: "Admin — Lojas" };

export default async function AdminStoresPage() {
  const stores = await getStores();
  return <AdminStoresClient stores={stores} />;
}
