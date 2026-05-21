import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, ArrowLeft, Gift, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin — Recompensas" };

export default function AdminRecompensasPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-warning" />
            </div>
            <h1 className="text-3xl font-black text-foreground">
              Gestão de Recompensas
            </h1>
          </div>
          <p className="text-muted pl-[52px]">
            Configure as recompensas disponíveis para os membros do Maromba Club.
          </p>
        </div>
        <Badge variant="surface">
          <Star className="w-3 h-3" />
          Em breve
        </Badge>
      </div>

      {/* Coming soon state */}
      <Card className="border-border">
        <CardContent className="pt-12 pb-14">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            {/* Icon stack */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl bg-warning/10 border border-warning/20 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-warning" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Gift className="w-4 h-4 text-warning" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-foreground mb-3">
              Módulo em desenvolvimento
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-2">
              A interface dedicada à gestão de recompensas individuais estará disponível
              em breve. Você já pode visualizar e monitorar as recompensas existentes
              diretamente no painel do Clube.
            </p>
            <p className="text-muted/60 text-xs mb-8">
              Funcionalidades planejadas: criação e edição de recompensas, definição de
              custo em pontos, controle de estoque de prêmios, regras por tier e
              relatórios de resgate.
            </p>

            {/* Feature list */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Gift, label: "Criar recompensas", desc: "Produtos, descontos e experiências" },
                { icon: Zap, label: "Definir pontos", desc: "Custo por nível de tier" },
                { icon: Star, label: "Análise de resgates", desc: "Performance por recompensa" },
              ].map((feat) => (
                <div
                  key={feat.label}
                  className="flex flex-col items-center text-center p-4 rounded-2xl bg-surface border border-border gap-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
                    <feat.icon className="w-4 h-4 text-warning" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{feat.label}</span>
                  <span className="text-xs text-muted">{feat.desc}</span>
                </div>
              ))}
            </div>

            <Button asChild variant="outline" size="md">
              <Link href="/admin/clube">
                <ArrowLeft className="w-4 h-4" />
                Ver recompensas no Clube
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-primary" />
            Como funcionam as recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Tipos de recompensa</h3>
              <ul className="space-y-2">
                {[
                  "Desconto percentual em pedidos",
                  "Desconto em valor fixo",
                  "Produto grátis",
                  "Frete grátis",
                  "Acesso a produtos exclusivos",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Regras por tier</h3>
              <ul className="space-y-2">
                {[
                  { tier: "Bronze", pts: "500–1.499 pts" },
                  { tier: "Prata", pts: "1.500–4.999 pts" },
                  { tier: "Ouro", pts: "5.000–14.999 pts" },
                  { tier: "Black", pts: "15.000–39.999 pts" },
                  { tier: "Beast Mode", pts: "40.000+ pts" },
                ].map((item) => (
                  <li key={item.tier} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{item.tier}</span>
                    <span className="font-semibold text-foreground font-mono text-xs">{item.pts}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
