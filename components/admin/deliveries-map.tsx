"use client";

import { useEffect, useState } from "react";
import { Truck, MapPin } from "lucide-react";
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from "@/components/ui/map";

interface Delivery {
  id: string;
  status: string;
  lat: number;
  lng: number;
  customerName?: string;
  address?: string;
}

interface Props {
  deliveries: Delivery[];
}

export function DeliveriesMap({ deliveries }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const active = deliveries.filter((d) => d.status !== "ENTREGUE");
  const done = deliveries.filter((d) => d.status === "ENTREGUE");

  // Default center: Brazil
  const center: [number, number] =
    deliveries.length > 0
      ? [deliveries[0].lng, deliveries[0].lat]
      : [-47.882778, -15.793889];

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Mapa de entregas</p>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            Em rota ({active.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Entregues ({done.length})
          </span>
        </div>
      </div>
      <Map
        className="h-[400px] w-full"
        center={center}
        zoom={12}
        styles={{
          light: "https://tiles.openfreemap.org/styles/bright",
          dark: "https://tiles.openfreemap.org/styles/dark",
        }}
      >
        <MapControls position="top-right" showZoom showLocate={false} />
        {active.map((d) => (
          <MapMarker key={d.id} longitude={d.lng} latitude={d.lat} offset={[0, 8]}>
            <MarkerContent>
              <div className="w-9 h-9 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-lg">
                <Truck className="w-4 h-4 text-background" />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              <p className="font-medium text-xs">{d.customerName ?? "Cliente"}</p>
              {d.address && <p className="text-xs opacity-70">{d.address}</p>}
            </MarkerTooltip>
          </MapMarker>
        ))}
        {done.map((d) => (
          <MapMarker key={d.id} longitude={d.lng} latitude={d.lat}>
            <MarkerContent>
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              <p className="font-medium text-xs">{d.customerName ?? "Entregue"}</p>
            </MarkerTooltip>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
