"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    brand: string;
    slug: string;
    price_cents: number;
    cost_cents: number | null;
    description: string | null;
    flavor: string | null;
    flavors: string[] | null;
    sizes: string[] | null;
    weight_volume: string | null;
    barcode_ean: string | null;
    image_url: string | null;
    is_active: boolean;
    is_club_exclusive: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath(`/produto/${data.slug}`);
  revalidatePath("/catalogo");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
}
