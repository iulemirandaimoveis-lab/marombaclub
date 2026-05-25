import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { UserCheck, Truck, Wifi, WifiOff, Star, Package } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Entregadores" };
export const dynamic = "force-dynamic";

export default async function AdminEntregadoresPage() {
  const supabase = await createClient();

  const { data: drivers } = await supabase
    .from("profiles")
    .select(`
      id, name, email, phone, created_at,
      driver:delivery_drivers(vehicle_type, license_plate, status, rating)
    `)
    .eq("role", "entregador")
    .order("name");

  const { data: driverOrderCounts } = await supabase
    .from("orders")
    .select("status")
    .eq("status", "ENVIADO");

  const online = (drivers ?? []).filter((d: any) => d.driver?.[0]?.status === "online");
  const offline = (drivers ?? []).filter((d: any) => d.driver?.[0]?.status !== "online");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Entregadores</h1>
        <p className="text-muted text-sm mt-1">Gerenciamento da equipe de entrega</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <UserCheck className="w-5 h-5 text-foreground mb-2" />
          <p className="text-2xl font-black text-foreground">{drivers?.length ?? 0}</p>
          <p className="text-xs text-muted mt-0.5">Total cadastrado</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <Wifi className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-black text-emerald-400">{online.length}</p>
          <p className="text-xs text-muted mt-0.5">Online agora</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <Truck className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-black text-primary">{driverOrderCounts?.length ?? 0}</p>
          <p className="text-xs text-muted mt-0.5">Em entrega</p>
        </div>
      </div>

      {/* Drivers list */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Lista de entregadores</h2>
        </div>
        {!drivers || drivers.length === 0 ? (
          <div className="p-10 text-center text-muted">
            <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Nenhum entregador cadastrado.</p>
            <p className="text-sm mt-1">Cadastre entregadores com o papel &quot;entregador&quot; na tabela de perfis.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {drivers.map((driver: any) => {
              const driverInfo = driver.driver?.[0];
              const isOnline = driverInfo?.status === "online";
              return (
                <div key={driver.id} className="px-4 sm:px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground">{driver.name ?? "—"}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isOnline ? "bg-emerald-500/10 text-emerald-400" : "bg-surface text-muted border border-border"
                      }`}>
                        {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{driver.email}</p>
                    {driverInfo?.vehicle_type && (
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Truck className="w-3 h-3" />
                        {driverInfo.vehicle_type}
                        {driverInfo.license_plate && ` · ${driverInfo.license_plate}`}
                      </p>
                    )}
                  </div>
                  {driverInfo?.rating && (
                    <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      <span className="text-sm font-bold">{driverInfo.rating}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
