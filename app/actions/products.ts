"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Json } from "@/lib/supabase/types";

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

export async function toggleProductFeatured(id: string, isFeatured: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_featured: isFeatured })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
}

export async function toggleProductBestSeller(id: string, isBestSeller: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_best_seller: isBestSeller })
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
    // Rich premium fields
    short_promise?: string | null;
    is_featured?: boolean;
    is_best_seller?: boolean;
    benefits?: Json | null;
    nutrition_facts?: Json | null;
    ingredients?: string | null;
    allergens?: string[] | null;
    how_to_use?: Json | null;
    warnings?: string | null;
    certifications?: string[] | null;
    faq?: Json | null;
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
