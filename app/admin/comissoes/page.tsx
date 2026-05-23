import type { Metadata } from "next";
import { getSellerCommissions } from "@/lib/data/admin";
import { AdminCommissionsClient } from "@/components/admin/pages/commissions-client";

export const metadata: Metadata = { title: "Admin — Comissões de Vendedores" };

export default async function AdminCommissionsPage() {
  const commissions = await getSellerCommissions();
  return <AdminCommissionsClient commissions={commissions} />;
}
