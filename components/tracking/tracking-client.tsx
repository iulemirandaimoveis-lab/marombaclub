"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Package, CheckCircle, Truck, Clock, Zap,
  Navigation, ArrowLeft, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const STATUS_STEPS = [
  { key: "CRIADO", label: "Pedido criado", icon: Package },
  { key: "AGUARDANDO_PAGAMENTO", label: "Aguardando pagamento", icon: Clock },
  { key: "PAGO", label: "Pagamento confirmado", icon: CheckCircle },
  { key: "EM_SEPARACAO", label: "Em separação", icon: Package },
  { key: "ENVIADO", label: "Saiu para entrega", icon: Truck },
  { key: "ENTREGUE", label: "Entregue", icon: CheckCircle },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

function getStepIndex(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

type TrackingData = {
  id: string;
  status: string;
  lat?: number;
  lng?: number;
  note?: string;
  updated_at: string;
};

type Order = {
  id: string;
  status: string;
  payment_status: string;
  total_cents: number;
  delivery_type: string;
  delivery_address?: any;
  driver_lat?: number;
  driver_lng?: number;
  tracking: TrackingData[];
};

export function TrackingClient({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(
    initialOrder.driver_lat && initialOrder.driver_lng
      ? { lat: initialOrder.driver_lat, lng: initialOrder.driver_lng }
      : null
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`order-tracking-${order.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${order.id}`,
      }, (payload: any) => {
        const updated = payload.new;
        setOrder((prev) => ({ ...prev, status: updated.status }));
        if (updated.driver_lat && updated.driver_lng) {
          setDriverPos({ lat: updated.driver_lat, lng: updated.driver_lng });
        }
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "delivery_tracking",
        filter: `order_id=eq.${order.id}`,
      }, (payload: any) => {
        const t = payload.new;
        if (t?.lat && t?.lng) {
          setDriverPos({ lat: t.lat, lng: t.lng });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [order.id, supabase]);

  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return;
    if (order.status !== "ENVIADO") return;

    let L: any;
    let map: any;

    async function initMap() {
      try {
        L = (await import("leaflet")).default;

        if (!mapContainerRef.current) return;

        const defaultPos = driverPos ?? { lat: -23.55, lng: -46.63 };
        map = L.map(mapContainerRef.current).setView([defaultPos.lat, defaultPos.lng], 15);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          html: `<div style="width:36px;height:36px;background:#00ff88;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,255,136,0.5)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-1 11H9a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3.5"/><path d="M14 13a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm3.5 5.5L22 23"/></svg>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        if (driverPos) {
          markerRef.current = L.marker([driverPos.lat, driverPos.lng], { icon })
            .addTo(map)
            .bindPopup("Entregador")
            .openPopup();
        }

        setMapLoaded(true);
      } catch {
        // Map failed to load - not critical
      }
    }

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [order.status]);

  useEffect(() => {
    if (!mapRef.current || !driverPos) return;
    if (!markerRef.current) return;
    markerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
    mapRef.current.setView([driverPos.lat, driverPos.lng], 15, { animate: true });
  }, [driverPos]);

  const currentStep = getStepIndex(order.status);
  const isDelivering = order.status === "ENVIADO";
  const isDelivered = order.status === "ENTREGUE";

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Back */}
        <Link href="/pedidos" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Meus pedidos
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground">Acompanhar entrega</h1>
            <p className="text-muted text-sm mt-1 font-mono">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge variant={isDelivered ? "primary" : isDelivering ? "warning" : "surface"}>
            {isDelivered ? "Entregue" : isDelivering ? "Em rota" : "Processando"}
          </Badge>
        </div>

        {/* Map */}
        <AnimatePresence>
          {isDelivering && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl overflow-hidden border border-primary/20 shadow-neon"
            >
              <div className="bg-primary/10 px-4 py-2.5 flex items-center justify-between border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-bold text-primary">Entregador a caminho</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary/70 hover:text-primary"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {driverPos ? (
                <div ref={mapContainerRef} style={{ height: 280, width: "100%" }} />
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center bg-surface gap-3">
                  <Navigation className="w-8 h-8 text-primary/40 animate-pulse" />
                  <p className="text-sm text-muted">Aguardando localização do entregador...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <div className="glass rounded-2xl p-6 border border-border space-y-5">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary fill-primary" />
            Status do pedido
          </h2>

          <div className="relative">
            <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-border" />
            <div
              className="absolute left-4 top-6 w-0.5 bg-primary transition-all duration-700"
              style={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            <div className="space-y-4 relative">
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        done
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      } ${active ? "shadow-neon scale-110" : ""}`}
                    >
                      <StepIcon className={`w-4 h-4 ${done ? "text-background" : "text-muted"}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted"}`}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="text-xs text-primary mt-0.5 animate-pulse">
                          Status atual
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delivery address */}
        {order.delivery_address && (
          <div className="glass rounded-2xl p-5 border border-border">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              Endereço de entrega
            </h3>
            <p className="text-sm text-muted">
              {order.delivery_address.address}
              {order.delivery_address.city && ` — ${order.delivery_address.city}`}
              {order.delivery_address.state && `/${order.delivery_address.state}`}
            </p>
            {order.delivery_address.cep && (
              <p className="text-xs text-muted/70 mt-1">CEP: {order.delivery_address.cep}</p>
            )}
          </div>
        )}

        {isDelivered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 border border-primary/20 bg-primary/5 text-center"
          >
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-black text-foreground text-xl">Pedido entregue!</h3>
            <p className="text-muted text-sm mt-1">
              Seu pedido foi entregue com sucesso. Bons treinos!
            </p>
            <div className="mt-4">
              <Link href="/catalogo">
                <Button size="sm" className="font-bold">
                  Fazer novo pedido
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        <div className="text-center">
          <Link href="/pedidos">
            <Button variant="ghost" size="sm" className="text-muted">
              Ver todos os pedidos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
