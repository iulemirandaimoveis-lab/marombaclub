import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProductClient } from "./edit-product-client";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*, category:product_categories(id, name, slug)")
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name, slug")
    .order("name");

  return <EditProductClient product={product} categories={categories ?? []} />;
}
