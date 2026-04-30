"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";

const { BaseLayer } = LayersControl;

const tenureColors: Record<string, string> = {
  TITLED: "#16a34a",
  MAILO: "#1B3FA0",
  KIBANJA: "#d97706",
  LEASEHOLD: "#7c3aed",
  FREEHOLD: "#0d9488",
};

function makeIcon(tenure: string) {
  const color = tenureColors[tenure] || "#6b7280";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:32px;height:38px;position:relative;
        filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 22 16 22S32 26 32 16C32 7.163 24.837 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
        </svg>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -40],
  });
}

function fixIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Fly to a property when selected
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

import type { ListingProperty } from "@/types/types";

interface Props {
  properties: ListingProperty[];
  onSelectProperty?: (id: string) => void;
  selectedId?: string | null;
  height?: string;
}

function formatUGX(amount: any) {
  if (!amount) return "Price on request";
  return `UGX ${Number(amount).toLocaleString()}`;
}

export default function PublicPropertiesMap({
  properties,
  onSelectProperty,
  selectedId,
  height = "500px",
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fixIcons();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedId) {
      const p = properties.find((p) => p.id === selectedId);
      if (p?.latitude && p?.longitude) {
        setFlyTarget({ lat: p.latitude, lng: p.longitude });
      }
    }
  }, [selectedId, properties]);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="bg-gradient-to-br from-brand-blue-pale to-blue-100 rounded-2xl flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3 text-brand-blue">
          <MapPin className="h-8 w-8 animate-bounce" />
          <span className="text-sm font-medium">Loading map...</span>
        </div>
      </div>
    );
  }

  const mapped = properties.filter((p) => p.latitude && p.longitude);

  return (
    <div style={{ height }} className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Legend */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-3 text-xs space-y-1.5">
        <div className="font-semibold text-gray-700 mb-2">Tenure Type</div>
        {Object.entries(tenureColors).map(([tenure, color]) => (
          <div key={tenure} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: color }} />
            <span className="text-gray-600">{tenure}</span>
          </div>
        ))}
      </div>

      {/* Count badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-brand-blue text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
        {mapped.length} properties on map
      </div>

      <MapContainer
        center={[0.3476, 32.5825]}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <LayersControl position="bottomright">
          <BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="Topo">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
        </LayersControl>

        {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}

        {mapped.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude!, p.longitude!]}
            icon={makeIcon(p.tenure)}
            eventHandlers={{
              click: () => onSelectProperty?.(p.id),
            }}
          >
            <Popup maxWidth={260} className="property-popup">
              <div className="p-1 min-w-[200px]">
                <div className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{p.title}</div>
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                  <MapPin className="h-3 w-3" />
                  {[p.subcounty, p.district].filter(Boolean).join(", ")}
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  <div className="bg-gray-50 rounded-lg p-1.5 text-center">
                    <div className="text-xs text-gray-400">Size</div>
                    <div className="text-xs font-semibold">{Number(p.size)} {p.sizeUnit}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5 text-center">
                    <div className="text-xs text-gray-400">Tenure</div>
                    <div className="text-xs font-semibold">{p.tenure}</div>
                  </div>
                </div>
                <div className="font-bold text-brand-blue text-sm mb-2">{formatUGX(p.price)}</div>
                <Link
                  href={`/listings/${p.plotNumber}`}
                  className="flex items-center justify-center gap-1.5 w-full bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
