import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PickupPointsAdmin } from "@/components/admin/pages/pickup-points-admin";

export const metadata: Metadata = { title: "Admin — Pontos de Retirada" };
export const dynamic = "force-dynamic";

async function getData() {
  try {
    const supabase = await createClient();
    const [storesRes, pointsRes] = await Promise.all([
      supabase.from("stores").select("id, name").eq("is_active", true).order("name"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("pickup_points").select(`
        id, store_id, name, address_line, address_number, district,
        city, state, zipcode, latitude, longitude, instructions, active,
        store:stores(name)
      `).order("created_at", { ascending: false }),
    ]);
    return {
      stores: (storesRes.data ?? []) as any[],
      points: (pointsRes.data ?? []) as any[],
    };
  } catch {
    return { stores: [], points: [] };
  }
}

export default async function PickupPointsPage() {
  const { stores, points } = await getData();
  return <PickupPointsAdmin stores={stores} points={points} />;
}
