import { createClient } from "@/lib/supabase/server";

export type NutritionFacts = {
  serving_size?: string;
  servings_per_container?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sodium_mg?: number;
  calcium_mg?: number;
  leucine_g?: number;
  isoleucine_g?: number;
  valine_g?: number;
  creatine_g?: number;
  caffeine_mg?: number;
  citrulline_malate_g?: number;
  beta_alanine_g?: number;
  taurine_mg?: number;
  arginine_g?: number;
  vitamin_d3_ui?: number;
  vitamin_k2_mcg?: number;
  [key: string]: string | number | undefined;
};

export type ProductBenefit = {
  icon: string;
  title: string;
  description: string;
};

export type ProductVideo = {
  url: string;
  type: "demo" | "reel" | "howto" | "brand";
  title?: string;
  thumbnail?: string;
};

export type HowToUse = {
  dose?: string;
  timing?: string;
  preparation?: string;
  frequency?: string;
  notes?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

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
  // Premium fields
  hero_image_url: string | null;
  gallery_images: string[];
  video_urls: ProductVideo[];
  short_promise: string | null;
  benefits: ProductBenefit[];
  nutrition_facts: NutritionFacts;
  ingredients: string | null;
  allergens: string[];
  how_to_use: HowToUse;
  warnings: string | null;
  certifications: string[];
  faq: FAQItem[];
  rating_average: number;
  rating_count: number;
  is_featured: boolean;
  is_best_seller: boolean;
};

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:product_categories(name, slug, icon)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error || !data) return null;
    return normalizeProduct(data);
  } catch {
    return null;
  }
}

export async function getProducts(limit?: number, categorySlug?: string): Promise<Product[]> {
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
    return data.map(normalizeProduct);
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:product_categories(name, slug, icon)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error || !data) return [];
    return data.map(normalizeProduct);
  } catch {
    return [];
  }
}

export async function getBestSellerProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:product_categories(name, slug, icon)")
      .eq("is_active", true)
      .eq("is_best_seller", true)
      .order("rating_average", { ascending: false })
      .limit(8);
    if (error || !data) return [];
    return data.map(normalizeProduct);
  } catch {
    return [];
  }
}

function normalizeProduct(data: Record<string, unknown>): Product {
  return {
    ...data,
    gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images as string[] : [],
    video_urls: Array.isArray(data.video_urls) ? data.video_urls as ProductVideo[] : [],
    benefits: Array.isArray(data.benefits) ? data.benefits as ProductBenefit[] : [],
    nutrition_facts: (data.nutrition_facts && typeof data.nutrition_facts === "object") ? data.nutrition_facts as NutritionFacts : {},
    allergens: Array.isArray(data.allergens) ? data.allergens as string[] : [],
    how_to_use: (data.how_to_use && typeof data.how_to_use === "object") ? data.how_to_use as HowToUse : {},
    certifications: Array.isArray(data.certifications) ? data.certifications as string[] : [],
    faq: Array.isArray(data.faq) ? data.faq as FAQItem[] : [],
    hero_image_url: (data.hero_image_url as string) ?? null,
    short_promise: (data.short_promise as string) ?? null,
    ingredients: (data.ingredients as string) ?? null,
    warnings: (data.warnings as string) ?? null,
    rating_average: typeof data.rating_average === "number" ? data.rating_average : 0,
    rating_count: typeof data.rating_count === "number" ? data.rating_count : 0,
    is_featured: Boolean(data.is_featured),
    is_best_seller: Boolean(data.is_best_seller),
  } as Product;
}
