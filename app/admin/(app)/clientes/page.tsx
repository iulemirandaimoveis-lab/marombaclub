import type { Metadata } from "next";
import { getAdminCustomers } from "@/lib/data/admin";
import { AdminCustomersClient } from "@/components/admin/pages/customers-client";

export const metadata: Metadata = { title: "Admin — Clientes" };

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  return <AdminCustomersClient customers={customers} />;
}
