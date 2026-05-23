"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Package, CheckCircle, Truck, Clock, Phone,
  Navigation, Zap, LogOut, ChevronRight, RefreshCw,
  User, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; next?: string; nextLabel?: string }> = {
  PAGO: { label: "Aguardando separação", color: "text-warning", bg: "bg-warning/10", next: "EM_SEPARACAO", nextLabel: "Iniciar separação" },
  EM_SEPARACAO: { label: "Em separação", color: "text-blue-400", bg: "bg-blue-500/10", next: "ENVIADO", nextLabel: "Saiu para entrega" },
  PRONTO_PARA_RETIRADA: { label: "Pronto para retirada", color: "text-primary", bg: "bg-primary/10", next: "ENTREGUE", nextLabel: "Marcar como retirado" },
  ENVIADO: { label: "Saiu para entrega", color: "text-primary", bg: "bg-primary/10", next: "ENTREGUE", nextLabel: "Confirmar entrega" },
  ENTREGUE: { label: "Entregue", color: "text-primary", bg: "bg-primary/10" },
};

type Order = {
  id: string;
  status: string;
  total_cents: number;
  delivery_type: string;
  delivery_address: any;
  created_at: string;
  customer: { name?: string; phone?: string; email?: string } | null;
  items: { quantity: number; unit_price_cents: number; product: { name?: string; image_url?: string } | null }[];
  tracking: { id: string; status: string; lat?: number; lng?: number }[];
};

type Profile = { id: string; name: string };

export function EntregadorClient({ profile, orders: initialOrders }: { profile: Profile; orders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("entregador-orders")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `status=in.(PAGO,EM_SEPARACAO,ENVIADO,PRONTO_PARA_RETIRADA)`,
      }, () => {
        window.location.reload();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const shareLocation = useCallback(async (orderId: string) => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada neste dispositivo.");
      return;
    }
    setSharing(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLastLocation({ lat, lng });

        await supabase.from("delivery_tracking").upsert({
          order_id: orderId,
          entregador_id: profile.id,
          status: "EM_TRANSITO",
          lat,
          lng,
          note: "Localização atualizada",
          updated_at: new Date().toISOString(),
        }, { onConflict: "order_id" });

        await supabase.from("orders").update({
          driver_lat: lat,
          driver_lng: lng,
          updated_at: new Date().toISOString(),
        }).eq("id", orderId);

        setSharing(false);
      },
      (err) => {
        setLocationError("Não foi possível obter localização: " + err.message);
        setSharing(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [supabase, profile.id]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      await supabase.from("delivery_tracking").upsert({
        order_id: orderId,
        entregador_id: profile.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: "order_id" });

      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      );

      if (selected?.id === orderId) {
        setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
      }

      if (newStatus === "ENVIADO") {
        await shareLocation(orderId);
      }
    } finally {
      setUpdating(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status !== "ENTREGUE");
  const deliveredOrders = orders.filter((o) => o.status === "ENTREGUE");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Truck className="w-4 h-4 text-background" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground leading-none">
                MAROMBA<span className="text-primary">CLUB</span>
              </p>
              <p className="text-[10px] text-muted">Painel Entregador</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground">{profile.name}</p>
              <p className="text-[10px] text-muted">Entregador</p>
            </div>
            <button
              onClick={async () => { await signOut(); window.location.href = "/"; }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pendentes", value: pendingOrders.length, color: "text-warning" },
            { label: "Entregues hoje", value: deliveredOrders.length, color: "text-primary" },
            { label: "Total hoje", value: orders.length, color: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 border border-border text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {locationError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {locationError}
          </div>
        )}

        {lastLocation && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary">
            <Navigation className="w-4 h-4 flex-shrink-0" />
            Localização compartilhada: {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
          </div>
        )}

        {/* Orders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-foreground">
              Entregas {pendingOrders.length > 0 && `(${pendingOrders.length})`}
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </button>
          </div>

          {pendingOrders.length === 0 && (
            <div className="glass rounded-2xl p-8 border border-border text-center">
              <CheckCircle className="w-12 h-12 text-primary/40 mx-auto mb-3" />
              <p className="font-bold text-foreground">Tudo entregue!</p>
              <p className="text-muted text-sm mt-1">Nenhuma entrega pendente no momento.</p>
            </div>
          )}

          <AnimatePresence>
            {pendingOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "text-muted", bg: "bg-surface" };
              const isSelected = selected?.id === order.id;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-2xl border border-border overflow-hidden"
                >
                  <button
                    className="w-full p-4 text-left flex items-center gap-4"
                    onClick={() => setSelected(isSelected ? null : order)}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Package className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-xs text-muted">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <Badge variant={order.status === "ENVIADO" ? "primary" : "warning"}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="font-bold text-foreground text-sm truncate">
                        {order.customer?.name ?? "Cliente"}
                      </p>
                      {order.delivery_address?.address && (
                        <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.delivery_address.address}
                          {order.delivery_address.city ? `, ${order.delivery_address.city}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-sm text-foreground">{formatCurrency(order.total_cents)}</p>
                      <ChevronRight className={`w-4 h-4 text-muted ml-auto mt-1 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          {/* Customer info */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Cliente</p>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground">{order.customer?.name ?? "—"}</p>
                                {order.customer?.phone && (
                                  <a href={`tel:${order.customer.phone}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                                    <Phone className="w-3 h-3" />
                                    {order.customer.phone}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Itens</p>
                            {order.items.slice(0, 4).map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-muted w-6 text-right flex-shrink-0">{item.quantity}×</span>
                                <span className="text-foreground">{item.product?.name ?? "Produto"}</span>
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <p className="text-xs text-muted">+{order.items.length - 4} itens</p>
                            )}
                          </div>

                          {/* Address */}
                          {order.delivery_address && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Endereço de entrega</p>
                              <div className="flex items-start gap-2 bg-surface rounded-xl p-3 border border-border">
                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-foreground">
                                    {order.delivery_address.address}
                                  </p>
                                  {order.delivery_address.city && (
                                    <p className="text-xs text-muted">
                                      {order.delivery_address.city}{order.delivery_address.state ? `, ${order.delivery_address.state}` : ""}
                                    </p>
                                  )}
                                  {order.delivery_address.cep && (
                                    <p className="text-xs text-muted">CEP: {order.delivery_address.cep}</p>
                                  )}
                                </div>
                              </div>
                              {order.delivery_address.address && (
                                <a
                                  href={`https://maps.google.com/maps?q=${encodeURIComponent(
                                    `${order.delivery_address.address}, ${order.delivery_address.city}`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
                                >
                                  <Navigation className="w-3 h-3" />
                                  Abrir no Google Maps
                                </a>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            {order.status === "ENVIADO" && (
                              <Button
                                variant="surface"
                                size="sm"
                                onClick={() => shareLocation(order.id)}
                                disabled={sharing}
                                className="flex-1"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                {sharing ? "Compartilhando..." : "Atualizar localização"}
                              </Button>
                            )}
                            {cfg.next && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus(order.id, cfg.next!)}
                                disabled={updating === order.id}
                                className="flex-1 shadow-neon"
                              >
                                {updating === order.id ? (
                                  <span className="flex items-center gap-1.5">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    Atualizando...
                                  </span>
                                ) : (
                                  <>
                                    <Zap className="w-3.5 h-3.5" />
                                    {cfg.nextLabel}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {deliveredOrders.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Concluídas hoje ({deliveredOrders.length})
              </p>
              {deliveredOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs text-muted">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-sm text-foreground">{order.customer?.name ?? "Cliente"}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(order.total_cents)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
