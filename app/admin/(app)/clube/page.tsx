import type { Metadata } from "next";
import { getAdminLoyalty } from "@/lib/data/admin";
import { AdminLoyaltyClient } from "@/components/admin/pages/loyalty-admin-client";

export const metadata: Metadata = { title: "Admin — Clube" };

export default async function AdminClubPage() {
  const data = await getAdminLoyalty();
  return <AdminLoyaltyClient data={data} />;
}
