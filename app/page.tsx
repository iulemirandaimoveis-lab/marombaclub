import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HowItWorks } from "@/components/home/how-it-works";
import { Tiers } from "@/components/home/tiers";
import { Categories } from "@/components/home/categories";
import { CtaSection } from "@/components/home/cta-section";
import { getProducts } from "@/lib/data/products";

export default async function HomePage() {
  const products = await getProducts(4);

  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts products={products} />
      <HowItWorks />
      <Tiers />
      <CtaSection />
    </>
  );
}
