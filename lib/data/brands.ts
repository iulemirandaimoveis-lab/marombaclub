import { createClient } from "@/lib/supabase/server";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
};

export async function getBrands(): Promise<Brand[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (error || !data) return [];
    return data as Brand[];
  } catch {
    return [];
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");
    if (error || !data) return [];
    return data as Brand[];
  } catch {
    return [];
  }
}
