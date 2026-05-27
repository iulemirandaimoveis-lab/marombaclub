"use client";

import { useState } from "react";
import { Map, Layers } from "lucide-react";
import { DeliveriesMap } from "./deliveries-map";
import { DeliveriesMapLeaflet } from "./deliveries-map-leaflet";

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

type Provider = "mapcn" | "leaflet";

export function DeliveriesMapSwitcher({ deliveries }: Props) {
  const [provider, setProvider] = useState<Provider>("mapcn");

  if (deliveries.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Layers className="w-4 h-4" />
          <span>Provedor de mapa</span>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
          <button
            onClick={() => setProvider("mapcn")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              provider === "mapcn"
                ? "bg-primary text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            MapLibre
          </button>
          <button
            onClick={() => setProvider("leaflet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              provider === "leaflet"
                ? "bg-primary text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Leaflet
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border">
        {provider === "mapcn" ? (
          <DeliveriesMap deliveries={deliveries} hideTitleBar />
        ) : (
          <DeliveriesMapLeaflet deliveries={deliveries} />
        )}
      </div>
    </div>
  );
}
