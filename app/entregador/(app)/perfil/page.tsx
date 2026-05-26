import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { User, Mail, Phone, Truck, Star } from "lucide-react";

export const metadata: Metadata = { title: "Meu Perfil — Entregador" };
export const dynamic = "force-dynamic";

export default async function PerfilEntregadorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entregador/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, phone, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/entregador/login");

  const { data: driverData } = await (supabase as any)
    .from("delivery_drivers")
    .select("vehicle_type, license_plate, status, rating")
    .eq("user_id", user.id)
    .maybeSingle() as { data: { vehicle_type?: string; license_plate?: string; status?: string; rating?: number } | null };

  const { count: totalDeliveries } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "ENTREGUE");

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      <h1 className="text-lg font-black text-foreground">Meu Perfil</h1>

      {/* Profile card */}
      <div className="glass rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-xl font-black text-foreground">{profile.name ?? "Entregador"}</p>
            <div className="flex items-center gap-1 text-yellow-400 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <span className="text-sm font-bold">{driverData?.rating ?? 5.0}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
              <Mail className="w-3.5 h-3.5 text-muted" />
            </div>
            <div>
              <p className="text-xs text-muted">E-mail</p>
              <p className="text-foreground">{profile.email}</p>
            </div>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-muted" />
              </div>
              <div>
                <p className="text-xs text-muted">Telefone</p>
                <p className="text-foreground">{profile.phone}</p>
              </div>
            </div>
          )}

          {driverData?.vehicle_type && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <Truck className="w-3.5 h-3.5 text-muted" />
              </div>
              <div>
                <p className="text-xs text-muted">Veículo</p>
                <p className="text-foreground capitalize">{driverData.vehicle_type}</p>
                {driverData.license_plate && (
                  <p className="text-xs text-muted font-mono">{driverData.license_plate}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-black text-primary">{totalDeliveries ?? 0}</p>
          <p className="text-xs text-muted mt-0.5">Entregas totais</p>
        </div>
        <div className="glass rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-black text-yellow-400">{driverData?.rating ?? "5.0"}</p>
          <p className="text-xs text-muted mt-0.5">Avaliação</p>
        </div>
      </div>

      <p className="text-xs text-muted text-center">
        Membro desde {new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
