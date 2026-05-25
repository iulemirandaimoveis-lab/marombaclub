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

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(address + ", Brasil");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "Accept-Language": "pt-BR" } }
    );
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // geocoding failed — not critical
  }
  return null;
}

export function TrackingClient({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(
    initialOrder.driver_lat && initialOrder.driver_lng
      ? { lat: initialOrder.driver_lat, lng: initialOrder.driver_lng }
      : null
  );
  const [destPos, setDestPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const driverMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const supabase = createClient();

  // Geocode delivery address once
  useEffect(() => {
    const addr = initialOrder.delivery_address;
    if (!addr) return;
    const full = [addr.address, addr.city, addr.state, addr.cep].filter(Boolean).join(", ");
    if (!full) return;
    geocodeAddress(full).then((pos) => { if (pos) setDestPos(pos); });
  }, []);

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

  // Initialize map when status is ENVIADO or ENTREGUE
  useEffect(() => {
    const shouldShowMap = order.status === "ENVIADO" || order.status === "ENTREGUE";
    if (!mapContainerRef.current || mapLoaded || !shouldShowMap) return;

    let L: any;
    let map: any;

    async function initMap() {
      try {
        L = (await import("leaflet")).default;
        // @ts-expect-error leaflet css import
        await import("leaflet/dist/leaflet.css");

        if (!mapContainerRef.current) return;

        const centerPos = driverPos ?? destPos ?? { lat: -15.793889, lng: -47.882778 };
        map = L.map(mapContainerRef.current).setView([centerPos.lat, centerPos.lng], 15);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const driverIcon = L.divIcon({
          className: "",
          html: `<div style="width:40px;height:40px;background:#F59E0B;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(245,158,11,0.6)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-1 11H9a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/></svg>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const destIcon = L.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:36px;height:36px;background:#1F2937;border:3px solid #F59E0B;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div style="width:2px;height:8px;background:#F59E0B;margin-top:-2px"></div>
          </div>`,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        });

        if (driverPos) {
          driverMarkerRef.current = L.marker([driverPos.lat, driverPos.lng], { icon: driverIcon })
            .addTo(map)
            .bindPopup("<b>Entregador a caminho</b>")
            .openPopup();
        }

        if (destPos) {
          destMarkerRef.current = L.marker([destPos.lat, destPos.lng], { icon: destIcon })
            .addTo(map)
            .bindPopup("<b>Endereço de entrega</b>");

          if (!driverPos) {
            map.setView([destPos.lat, destPos.lng], 15);
          }
        }

        if (driverPos && destPos) {
          const bounds = L.latLngBounds([
            [driverPos.lat, driverPos.lng],
            [destPos.lat, destPos.lng],
          ]);
          map.fitBounds(bounds, { padding: [40, 40] });
        }

        setMapLoaded(true);
      } catch {
        // Map failed to load
      }
    }

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [order.status, destPos]);

  // Update driver marker position in real-time
  useEffect(() => {
    if (!mapRef.current || !driverPos) return;
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
    }
    if (destPos) {
      const L = (window as any).L;
      if (L) {
        const bounds = L.latLngBounds([
          [driverPos.lat, driverPos.lng],
          [destPos.lat, destPos.lng],
        ]);
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    } else {
      mapRef.current.setView([driverPos.lat, driverPos.lng], 15, { animate: true });
    }
  }, [driverPos]);

  const currentStep = getStepIndex(order.status);
  const isDelivering = order.status === "ENVIADO";
  const isDelivered = order.status === "ENTREGUE";
  const showMap = isDelivering || isDelivered;

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
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl overflow-hidden border border-primary/20 shadow-neon"
            >
              <div className="bg-primary/10 px-4 py-2.5 flex items-center justify-between border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-bold text-primary">
                    {isDelivered ? "Pedido entregue" : "Entregador a caminho"}
                  </p>
                </div>
                {!isDelivered && (
                  <button
                    onClick={() => window.location.reload()}
                    className="text-primary/70 hover:text-primary"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {driverPos || destPos ? (
                <div ref={mapContainerRef} style={{ height: 300, width: "100%" }} />
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center bg-surface gap-3">
                  <Navigation className="w-8 h-8 text-primary/40 animate-pulse" />
                  <p className="text-sm text-muted">Aguardando localização do entregador...</p>
                </div>
              )}

              {/* Legend */}
              {(driverPos || destPos) && (
                <div className="px-4 py-2.5 bg-surface flex items-center gap-4 text-xs text-muted border-t border-border">
                  {driverPos && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                      Entregador
                    </span>
                  )}
                  {destPos && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-primary" />
                      Destino
                    </span>
                  )}
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
