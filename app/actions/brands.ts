"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBrand(data: {
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  country: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marcas");
}

export async function updateBrand(
  id: string,
  data: {
    name: string;
    slug: string;
    description: string | null;
    website_url: string | null;
    country: string;
    is_active: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("brands").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marcas");
  revalidatePath("/catalogo");
}

export async function toggleBrandActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marcas");
}
