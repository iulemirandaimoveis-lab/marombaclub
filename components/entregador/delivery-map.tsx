"use client";

import { useEffect, useState } from "react";
import { Truck, MapPin, Navigation } from "lucide-react";
import { Map, MapMarker, MapRoute, MarkerContent, MarkerTooltip } from "@/components/ui/map";

interface OsrmRoute {
  coordinates: [number, number][];
}

async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<OsrmRoute | null> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords) return null;
    return { coordinates: coords as [number, number][] };
  } catch {
    return null;
  }
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(address + ", Brasil");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "Accept-Language": "pt-BR" } }
    );
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    // geocoding failed
  }
  return null;
}

interface Props {
  deliveryAddress: {
    address?: string;
    city?: string;
    state?: string;
    cep?: string;
  } | null;
  driverLat?: number | null;
  driverLng?: number | null;
}

export function DeliveryMap({ deliveryAddress, driverLat, driverLng }: Props) {
  const [destPos, setDestPos] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [loading, setLoading] = useState(true);

  const driverPos =
    driverLat && driverLng ? { lat: driverLat, lng: driverLng } : null;

  useEffect(() => {
    if (!deliveryAddress) {
      setLoading(false);
      return;
    }
    const full = [
      deliveryAddress.address,
      deliveryAddress.city,
      deliveryAddress.state,
      deliveryAddress.cep,
    ]
      .filter(Boolean)
      .join(", ");

    geocodeAddress(full).then(async (pos) => {
      if (pos) {
        setDestPos(pos);
        if (driverPos) {
          const r = await fetchRoute(driverPos, pos);
          if (r) setRoute(r.coordinates);
        }
      }
      setLoading(false);
    });
  }, []);

  const centerPos = driverPos ?? destPos;

  if (!centerPos && !loading) {
    return (
      <div className="h-[260px] rounded-2xl bg-surface border border-border flex flex-col items-center justify-center gap-3">
        <Navigation className="w-8 h-8 text-muted/40" />
        <p className="text-sm text-muted">Endereço não disponível</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <Map
        className="h-[260px] w-full"
        loading={loading}
        center={centerPos ? [centerPos.lng, centerPos.lat] : [-47.882778, -15.793889]}
        zoom={14}
        styles={{
          light: "https://tiles.openfreemap.org/styles/bright",
          dark: "https://tiles.openfreemap.org/styles/dark",
        }}
      >
        {route && route.length > 0 && (
          <MapRoute
            id="delivery-route"
            coordinates={route}
            color="#F59E0B"
            width={5}
            opacity={0.8}
            interactive={false}
          />
        )}
        {driverPos && (
          <MapMarker longitude={driverPos.lng} latitude={driverPos.lat} offset={[0, 8]}>
            <MarkerContent>
              <div className="w-10 h-10 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-lg">
                <Truck className="w-5 h-5 text-background" />
              </div>
            </MarkerContent>
            <MarkerTooltip>Você está aqui</MarkerTooltip>
          </MapMarker>
        )}
        {destPos && (
          <MapMarker longitude={destPos.lng} latitude={destPos.lat}>
            <MarkerContent>
              <div className="w-9 h-9 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
            </MarkerContent>
            <MarkerTooltip>Endereço de entrega</MarkerTooltip>
          </MapMarker>
        )}
      </Map>
    </div>
  );
}
