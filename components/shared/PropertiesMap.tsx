"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const { BaseLayer } = LayersControl;

const statusColors: Record<string, string> = {
  ACTIVE: "#1B3FA0",
  DISPUTED: "#DC2626",
  PENDING_APPROVAL: "#D97706",
  DRAFT: "#6B7280",
  TRANSFERRED: "#059669",
  ARCHIVED: "#9CA3AF",
};

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

interface Props {
  properties: any[];
}

export default function PropertiesMap({ properties }: Props) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [map, setMap] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-full bg-gray-100 animate-pulse rounded-xl" />;

  const districts = [...new Set(properties.map((p) => p.district))].sort();

  const filtered = properties.filter((p) => {
    if (districtFilter && p.district !== districtFilter) return false;
    if (search && !p.plotNumber.toLowerCase().includes(search.toLowerCase()) && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return p.latitude && p.longitude;
  });

  function flyTo(p: any) {
    if (map && p.latitude && p.longitude) {
      map.flyTo([p.latitude, p.longitude], 16, { duration: 1.2 });
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* Controls overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            const match = filtered.find((p) =>
              p.plotNumber.toLowerCase().includes(e.target.value.toLowerCase())
            );
            if (match) flyTo(match);
          }}
          placeholder="Search plot number..."
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm shadow-md bg-white w-52 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm shadow-md bg-white w-52 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        >
          <option value="">All Districts</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white rounded-xl shadow-md p-3 text-xs space-y-1.5">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: color }} />
            <span className="text-gray-600">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      <MapContainer
        center={[0.3476, 32.5825]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        ref={setMap}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Street">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              attribution="Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
        </LayersControl>

        {filtered.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={makeIcon(statusColors[p.status] || "#6B7280")}
          >
            <Popup>
              <div className="text-sm min-w-[180px]">
                <div className="font-semibold text-brand-blue mb-1">{p.title}</div>
                <div className="text-gray-500 text-xs mb-1">{p.plotNumber} · {p.district}</div>
                <div className="text-xs mb-2">
                  <span className="font-medium">Status:</span> {p.status.replace("_", " ")}
                </div>
                <Link
                  href={`/listings/${p.plotNumber}`}
                  className="text-xs text-brand-blue-light hover:underline"
                >
                  View Full Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
