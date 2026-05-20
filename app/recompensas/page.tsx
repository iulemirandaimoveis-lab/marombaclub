import type { Metadata } from "next";
import { ClubRewards } from "@/components/loyalty/club-rewards";

export const metadata: Metadata = {
  title: "Recompensas",
  description: "Resgate seus pontos por descontos, produtos exclusivos e muito mais.",
};

export default function RewardsPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <span className="text-primary text-sm font-bold uppercase tracking-widest">
          Clube de Fidelidade
        </span>
        <h1 className="text-4xl font-black text-foreground mt-2 mb-2">Recompensas</h1>
        <p className="text-muted">Troque seus pontos por benefícios exclusivos</p>
      </div>
      <ClubRewards />
    </div>
  );
}
