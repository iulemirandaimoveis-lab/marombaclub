import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = {
  title: "Catálogo de Suplementos",
  description:
    "Explore nossa linha completa de suplementos premium. Whey protein, creatina, pré-treino, BCAA e muito mais.",
};

export default function CatalogPage() {
  return <CatalogView />;
}
