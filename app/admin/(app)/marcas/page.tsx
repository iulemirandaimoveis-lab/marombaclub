import type { Metadata } from "next";
import { getAllBrands } from "@/lib/data/brands";
import { BrandsAdminClient } from "@/components/admin/brands-admin-client";

export const metadata: Metadata = { title: "Admin — Marcas" };

export default async function AdminMarcasPage() {
  const brands = await getAllBrands();
  return <BrandsAdminClient brands={brands} />;
}
