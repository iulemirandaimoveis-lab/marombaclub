import type { Metadata } from "next";
import { getAdminProducts } from "@/lib/data/admin";
import { AdminProductsClient } from "@/components/admin/pages/products-client";

export const metadata: Metadata = { title: "Admin — Produtos" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return <AdminProductsClient products={products} />;
}
