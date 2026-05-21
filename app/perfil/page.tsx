import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLoyaltyAccount, getCustomerOrders } from "@/lib/data/admin";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = {
  title: "Meu Perfil — Maromba Club",
  description: "Gerencie seu perfil, pontos e pedidos no Maromba Club.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/perfil");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const [loyaltyData, orders] = await Promise.all([
    getLoyaltyAccount(session.user.id),
    getCustomerOrders(session.user.id),
  ]);

  return (
    <ProfileClient
      user={session.user}
      profile={profile}
      loyalty={loyaltyData}
      orders={orders}
    />
  );
}
