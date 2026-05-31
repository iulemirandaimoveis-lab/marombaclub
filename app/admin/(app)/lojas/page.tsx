import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StoresAdmin } from "@/components/admin/pages/stores-admin";

export const metadata: Metadata = { title: "Admin — Lojas" };
export const dynamic = "force-dynamic";

async function getStoresEnhanced() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []) as any[];
  } catch {
    return [];
  }
}

export default async function AdminStoresPage() {
  const stores = await getStoresEnhanced();
  return <StoresAdmin stores={stores} />;
}
