"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type StoreInput = {
  name: string;
  legal_name?: string | null;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line?: string | null;
  address_number?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: "open" | "closed" | "paused";
  is_active?: boolean;
  accepts_delivery?: boolean;
  accepts_pickup?: boolean;
  delivery_radius_km?: number;
  base_delivery_fee_cents?: number;
  min_order_cents?: number;
};

function revalidateStores() {
  revalidatePath("/admin/lojas");
  revalidatePath("/admin");
}

export async function createStore(input: StoreInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any;
  const { data, error } = await supabase
    .from("stores")
    .insert({ ...input, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidateStores();
  return data;
}

export async function updateStore(id: string, input: StoreInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any;
  const { data, error } = await supabase
    .from("stores")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidateStores();
  return data;
}

export async function toggleStoreActive(id: string, isActive: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createAdminClient()) as any;
  const { error } = await supabase
    .from("stores")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStores();
}
