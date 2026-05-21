import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLoyaltyAccount } from "@/lib/data/admin";
import { ClubHero } from "@/components/loyalty/club-hero";
import { ClubTiers } from "@/components/loyalty/club-tiers";
import { ClubRewards } from "@/components/loyalty/club-rewards";
import { ClubHowToEarn } from "@/components/loyalty/club-how-to-earn";
import { ClubUserPanel } from "@/components/loyalty/club-user-panel";

export const metadata: Metadata = {
  title: "Maromba Club — Programa de Fidelidade",
  description:
    "Junte-se ao maior clube fitness do Brasil. Ganhe pontos, suba de nível e resgate recompensas exclusivas.",
};

export default async function ClubPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let loyalty = null;
  if (session) {
    try {
      loyalty = await getLoyaltyAccount(session.user.id);
    } catch {
      loyalty = null;
    }
  }

  return (
    <>
      <ClubHero />
      {session && loyalty && (
        <ClubUserPanel loyalty={loyalty} />
      )}
      <ClubHowToEarn />
      <ClubTiers />
      <ClubRewards />
    </>
  );
}
