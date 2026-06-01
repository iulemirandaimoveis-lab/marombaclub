import { getAllBrands } from "@/lib/data/brands";
import { createClient } from "@/lib/supabase/server";
import { NewProductClient } from "./new-product-client";

export default async function AdminNewProductPage() {
  const supabase = await createClient();
  const [brands, { data: categories }] = await Promise.all([
    getAllBrands(),
    supabase.from("product_categories").select("id, name, slug").order("name"),
  ]);

  return <NewProductClient brands={brands} categories={categories ?? []} />;
}
