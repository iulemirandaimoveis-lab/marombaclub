import { createClient } from "@/lib/supabase/server";

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string | null;
  price_cents: number;
  old_price_cents: number | null;
  emoji: string | null;
  image_url: string | null;
  points_per_unit: number;
  weight_volume: string | null;
  flavor: string | null;
  is_active: boolean;
  is_club_exclusive: boolean;
  category: { name: string; slug: string; icon: string | null } | null;
};

export async function getProducts(limit?: number, categorySlug?: string): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:product_categories(name, slug, icon)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (categorySlug) {
      query = query.eq("product_categories.slug", categorySlug);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as unknown as Product[];
  } catch {
    return [];
  }
}
