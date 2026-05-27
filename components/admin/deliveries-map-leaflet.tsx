"use client";

import { useEffect, useRef } from "react";

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

export function DeliveriesMapLeaflet({ deliveries }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || deliveries.length === 0) return;

    let map: any;

    async function initMap() {
      const L = (await import("leaflet")).default;
      // @ts-expect-error leaflet css
      await import("leaflet/dist/leaflet.css");
      if (!containerRef.current) return;

      const center = deliveries[0];
      map = L.map(containerRef.current).setView([center.lat, center.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const active = deliveries.filter((d) => d.status !== "ENTREGUE");
      const done = deliveries.filter((d) => d.status === "ENTREGUE");

      const activeIcon = L.divIcon({
        className: "",
        html: `<div style="width:36px;height:36px;background:#F59E0B;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(245,158,11,0.5)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-1 11H9a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/></svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const doneIcon = L.divIcon({
        className: "",
        html: `<div style="width:30px;height:30px;background:#10b981;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(16,185,129,0.4)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      active.forEach((d) => {
        L.marker([d.lat, d.lng], { icon: activeIcon })
          .addTo(map)
          .bindPopup(
            `<b>${d.customerName ?? "Em rota"}</b>${d.address ? `<br/><small>${d.address}</small>` : ""}`
          );
      });

      done.forEach((d) => {
        L.marker([d.lat, d.lng], { icon: doneIcon })
          .addTo(map)
          .bindPopup(`<b>${d.customerName ?? "Entregue"}</b>`);
      });

      if (deliveries.length > 1) {
        const bounds = L.latLngBounds(deliveries.map((d) => [d.lat, d.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    initMap();
    return () => { if (map) map.remove(); };
  }, []);

  if (deliveries.length === 0) return null;

  return <div ref={containerRef} style={{ height: 400, width: "100%" }} />;
}
