"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/utils";

// Fix Leaflet default marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const statusColors: Record<string, string> = {
  APPROVED: "#16a34a",
  PENDING: "#ca8a04",
  REJECTED: "#dc2626",
  SOLD: "#6b7280",
  ARCHIVED: "#9ca3af",
};

function getMarkerIcon(status: string) {
  const color = statusColors[status] || "#C41E24";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

interface MapProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  city: string;
  state: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
}

export default function PropertyMap() {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/admin/properties-map");
        if (res.ok) {
          const data = await res.json();
          setProperties(data || []);
        }
      } catch { /* silently */ }
      finally { setLoading(false); }
    };
    fetchProperties();
  }, []);

  // Ghana center coordinates
  const ghanaCenter: [number, number] = [7.9465, -1.0232];

  if (loading) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={ghanaCenter}
        zoom={7}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={getMarkerIcon(property.status)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h4 className="font-semibold text-sm mb-1">{property.title}</h4>
                <p className="text-primary font-bold text-sm">{formatCurrency(property.price)}</p>
                <p className="text-xs text-gray-500 mt-1">{property.city}, {property.state}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span className="capitalize">{property.type.toLowerCase()}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    property.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    property.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    property.status === "SOLD" ? "bg-gray-100 text-gray-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {property.status}
                  </span>
                </div>
                <a href={`/admin/properties/${property.id}/edit`}
                  className="mt-2 inline-block text-xs text-blue-600 hover:underline">
                  Edit Property →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
