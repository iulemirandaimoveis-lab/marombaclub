"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PickupPointInput = {
  store_id: string;
  name: string;
  address_line?: string | null;
  address_number?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string | null;
  active?: boolean;
};

function revalidatePoints() {
  revalidatePath("/admin/pontos-retirada");
  revalidatePath("/admin");
}

export async function createPickupPoint(input: PickupPointInput) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("pickup_points")
    .insert({ ...input, updated_at: new Date().toISOString() })
    .select(`
      id, store_id, name, address_line, address_number, district,
      city, state, zipcode, latitude, longitude, instructions, active,
      store:stores(name)
    `)
    .single();
  if (error) throw new Error(error.message);
  revalidatePoints();
  return data;
}

export async function updatePickupPoint(id: string, input: PickupPointInput) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("pickup_points")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(`
      id, store_id, name, address_line, address_number, district,
      city, state, zipcode, latitude, longitude, instructions, active,
      store:stores(name)
    `)
    .single();
  if (error) throw new Error(error.message);
  revalidatePoints();
  return data;
}

export async function togglePickupPointActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("pickup_points")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePoints();
}
