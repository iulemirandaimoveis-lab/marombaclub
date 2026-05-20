import type { Metadata } from "next";
import { ClubHero } from "@/components/loyalty/club-hero";
import { ClubTiers } from "@/components/loyalty/club-tiers";
import { ClubRewards } from "@/components/loyalty/club-rewards";
import { ClubHowToEarn } from "@/components/loyalty/club-how-to-earn";

export const metadata: Metadata = {
  title: "Maromba Club — Programa de Fidelidade",
  description:
    "Junte-se ao maior clube fitness do Brasil. Ganhe pontos, suba de nível e resgate recompensas exclusivas.",
};

export default function ClubPage() {
  return (
    <>
      <ClubHero />
      <ClubHowToEarn />
      <ClubTiers />
      <ClubRewards />
    </>
  );
}
