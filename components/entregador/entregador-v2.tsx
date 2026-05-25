"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Package, CheckCircle, Clock, Phone,
  Navigation, Zap, ChevronRight, RefreshCw,
  User, AlertCircle, Wifi, WifiOff,
  Map, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; next?: string; nextLabel?: string }> = {
  PAGO: { label: "Aguardando separação", color: "text-yellow-400", bg: "bg-yellow-500/10", next: "EM_SEPARACAO", nextLabel: "Iniciar separação" },
  EM_SEPARACAO: { label: "Em separação", color: "text-blue-400", bg: "bg-blue-500/10", next: "ENVIADO", nextLabel: "Saiu para entrega" },
  PRONTO_PARA_RETIRADA: { label: "Pronto para retirada", color: "text-emerald-400", bg: "bg-emerald-500/10", next: "ENTREGUE", nextLabel: "Marcar retirado" },
  ENVIADO: { label: "Em entrega", color: "text-primary", bg: "bg-primary/10", next: "ENTREGUE", nextLabel: "Confirmar entrega" },
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
};

type Profile = { id: string; name: string; role: string };

type DriverStats = {
  today_deliveries: number;
  today_earnings: number;
  week_deliveries: number;
  rating: number;
};

function StatCard({ label, value, sub, color = "text-foreground" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <p className={`text-2xl font-black ${color} tabular-nums`}>{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
      {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
    </div>
  );
}

export function EntregadorV2({ profile, orders: initialOrders }: { profile: Profile; orders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"deliveries" | "history" | "earnings">("deliveries");
  const [driverStats] = useState<DriverStats>({
    today_deliveries: orders.filter(o => o.status === "ENTREGUE").length,
    today_earnings: orders.filter(o => o.status === "ENTREGUE").reduce((s, o) => s + o.total_cents * 0.08, 0),
    week_deliveries: 0,
    rating: 4.9,
  });
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("driver-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        window.location.reload();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const updateLocation = useCallback(async (orderId?: string) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLastLocation({ lat, lng });
        setLocationError(null);

        await fetch("/api/driver/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lng, speed: pos.coords.speed }),
        });

        if (orderId) {
          await supabase.from("delivery_tracking").upsert({
            order_id: orderId,
            entregador_id: profile.id,
            status: "EM_TRANSITO",
            lat,
            lng,
            updated_at: new Date().toISOString(),
          }, { onConflict: "order_id" });
        }
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [supabase, profile.id]);

  const toggleOnline = useCallback(async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    await supabase
      .from("delivery_drivers")
      .update({ status: newStatus ? "online" : "offline", updated_at: new Date().toISOString() })
      .eq("user_id", profile.id);

    if (newStatus) {
      updateLocation();
      locationIntervalRef.current = setInterval(() => updateLocation(), 15000);
    } else {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    }
  }, [isOnline, supabase, profile.id, updateLocation]);

  useEffect(() => {
    return () => { if (locationIntervalRef.current) clearInterval(locationIntervalRef.current); };
  }, []);

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

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status: newStatus } : null);

      if (newStatus === "ENVIADO") await updateLocation(orderId);
    } finally {
      setUpdating(null);
    }
  };

  const pendingOrders = orders.filter(o => !["ENTREGUE", "CANCELADO"].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === "ENTREGUE");

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      {/* Driver greeting + online toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Bem-vindo de volta,</p>
          <p className="text-lg font-black text-foreground">{profile.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-yellow-400" />
            <span className="text-sm font-bold">{driverStats.rating}</span>
          </div>
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isOnline
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-surface text-muted border border-border"
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Entregas hoje" value={deliveredOrders.length} color="text-primary" />
          <StatCard label="Ganhos hoje" value={formatCurrency(driverStats.today_earnings)} color="text-emerald-400" />
          <StatCard label="Pendentes" value={pendingOrders.length} color="text-yellow-400" />
        </div>

        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {locationError}
          </motion.div>
        )}

        {lastLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary"
          >
            <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
            Localização ativa: {lastLocation.lat.toFixed(4)}, {lastLocation.lng.toFixed(4)}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface border border-border overflow-hidden">
          {[
            { id: "deliveries", label: "Entregas" },
            { id: "history", label: "Histórico" },
            { id: "earnings", label: "Ganhos" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id === "deliveries" && pendingOrders.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === "deliveries" ? "bg-background/20 text-background" : "bg-primary/20 text-primary"}`}>
                  {pendingOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "deliveries" && (
            <motion.div key="deliveries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-foreground text-sm uppercase tracking-wide">
                  Entregas ativas {pendingOrders.length > 0 && `(${pendingOrders.length})`}
                </h2>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar
                </button>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="glass rounded-2xl p-10 border border-border text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-bold text-foreground">Tudo em dia!</p>
                  <p className="text-muted text-sm mt-1">Nenhuma entrega pendente.</p>
                  {!isOnline && (
                    <button onClick={toggleOnline} className="mt-4 text-primary text-sm font-semibold hover:underline">
                      Ficar online para receber pedidos →
                    </button>
                  )}
                </div>
              ) : (
                pendingOrders.map((order, i) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={i}
                    isSelected={selected?.id === order.id}
                    updating={updating}
                    onSelect={() => setSelected(selected?.id === order.id ? null : order)}
                    onUpdateStatus={updateStatus}
                    onUpdateLocation={updateLocation}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
              <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Histórico de entregas</h2>
              {deliveredOrders.length === 0 ? (
                <div className="glass rounded-2xl p-8 border border-border text-center">
                  <Package className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-muted">Nenhuma entrega concluída hoje.</p>
                </div>
              ) : (
                deliveredOrders.map((order) => (
                  <div key={order.id} className="glass rounded-xl border border-border p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{order.customer?.name ?? "Cliente"}</p>
                      <p className="text-xs text-muted font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatCurrency(order.total_cents)}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "earnings" && (
            <motion.div key="earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <h2 className="font-black text-foreground text-sm uppercase tracking-wide">Seus ganhos</h2>
              <div className="glass rounded-2xl border border-primary/20 p-5 bg-primary/5">
                <p className="text-xs text-muted mb-1">Total hoje</p>
                <p className="text-3xl font-black text-primary">{formatCurrency(driverStats.today_earnings)}</p>
                <p className="text-xs text-muted mt-1">
                  {deliveredOrders.length} entrega{deliveredOrders.length !== 1 ? "s" : ""} · ~8% por pedido
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl border border-border p-4">
                  <p className="text-xs text-muted">Esta semana</p>
                  <p className="text-lg font-black text-foreground mt-1">—</p>
                </div>
                <div className="glass rounded-xl border border-border p-4">
                  <p className="text-xs text-muted">Este mês</p>
                  <p className="text-lg font-black text-foreground mt-1">—</p>
                </div>
              </div>
              <div className="glass rounded-xl border border-border p-4 text-center text-sm text-muted">
                Histórico completo disponível em breve.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

function OrderCard({
  order,
  index,
  isSelected,
  updating,
  onSelect,
  onUpdateStatus,
  onUpdateLocation,
}: {
  order: Order;
  index: number;
  isSelected: boolean;
  updating: string | null;
  onSelect: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateLocation: (id: string) => void;
}) {
  const cfg = STATUS_MAP[order.status] ?? { label: order.status, color: "text-muted", bg: "bg-surface" };
  const addr = order.delivery_address;
  const mapsUrl = addr?.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${addr.address}, ${addr.city ?? ""}`)}`
    : null;
  const wazeUrl = addr?.latitude && addr?.longitude
    ? `https://waze.com/ul?ll=${addr.latitude},${addr.longitude}&navigate=yes`
    : mapsUrl ? `https://waze.com/ul?q=${encodeURIComponent(`${addr.address}, ${addr.city ?? ""}`)}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass rounded-2xl border border-border overflow-hidden"
    >
      <button className="w-full p-4 text-left flex items-center gap-3" onClick={onSelect}>
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Package className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-mono text-xs text-muted">#{order.id.slice(0, 8).toUpperCase()}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
          </div>
          <p className="font-bold text-foreground text-sm truncate">{order.customer?.name ?? "Cliente"}</p>
          {addr?.address && (
            <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {addr.address}{addr.city ? `, ${addr.city}` : ""}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-2">
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
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Cliente</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{order.customer?.name ?? "—"}</p>
                    {order.customer?.phone && (
                      <a href={`tel:${order.customer.phone}`} className="text-xs text-primary flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.customer.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Itens</p>
                <div className="space-y-1">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-muted w-5 text-right">{item.quantity}×</span>
                      <span className="text-foreground">{item.product?.name ?? "Produto"}</span>
                    </div>
                  ))}
                  {order.items.length > 4 && <p className="text-xs text-muted">+{order.items.length - 4} itens</p>}
                </div>
              </div>

              {/* Address + Navigation */}
              {addr && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Endereço</p>
                  <div className="bg-surface rounded-xl p-3 border border-border mb-2">
                    <p className="text-sm text-foreground">{addr.address}</p>
                    {addr.city && <p className="text-xs text-muted">{addr.city}{addr.state ? `, ${addr.state}` : ""}</p>}
                    {addr.cep && <p className="text-xs text-muted">CEP: {addr.cep}</p>}
                  </div>
                  <div className="flex gap-2">
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-semibold hover:bg-blue-500/20 transition-colors"
                      >
                        <Map className="w-3.5 h-3.5" />
                        Google Maps
                      </a>
                    )}
                    {wazeUrl && (
                      <a
                        href={wazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 font-semibold hover:bg-sky-500/20 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Waze
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {order.status === "ENVIADO" && (
                  <Button
                    variant="surface"
                    size="sm"
                    onClick={() => onUpdateLocation(order.id)}
                    className="flex-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Atualizar localização
                  </Button>
                )}
                {cfg.next && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(order.id, cfg.next!)}
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
}
