"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Filter,
  Search,
  Loader2,
  Home,
  Bed,
  Bath,
  Maximize,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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

interface MapProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  address: string;
  city: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: { url: string; alt?: string }[];
  latitude?: number;
  longitude?: number;
}

export default function PropertiesMapPage() {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  const propertyTypes = [
    { label: "All Types", value: "" },
    { label: "House", value: "HOUSE" },
    { label: "Apartment", value: "APARTMENT" },
    { label: "Condo", value: "CONDO" },
    { label: "Townhouse", value: "TOWNHOUSE" },
    { label: "Villa", value: "VILLA" },
    { label: "Land", value: "LAND" },
    { label: "Commercial", value: "COMMERCIAL" },
    { label: "Office", value: "OFFICE" },
  ];

  const cities = ["", "Accra", "Kumasi", "Tema", "Tamale", "Cape Coast", "Takoradi"];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (type) params.set("type", type);
        if (city) params.set("city", city);
        if (priceRange.min) params.set("minPrice", priceRange.min);
        if (priceRange.max) params.set("maxPrice", priceRange.max);

        const res = await fetch(`/api/properties?${params.toString()}`);
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Error fetching properties for map:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [search, type, city, priceRange]);

  const filteredProperties = properties.filter(
    (property) => property.latitude && property.longitude
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearch("");
    setType("");
    setCity("");
    setPriceRange({ min: "", max: "" });
  };

  // Ghana center coordinates
  const ghanaCenter: [number, number] = [7.9465, -1.0232];

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-secondary mb-2">
              Property <span className="text-primary">Map</span>
            </h1>
            <p className="text-muted-foreground mb-6">
              Explore properties on an interactive map. Click on markers to view details.
            </p>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by location, property name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {propertyTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">All Cities</option>
                        {cities.filter(Boolean).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="md:col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              </div>
            ) : (
              <div className="h-[600px]">
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
                  {filteredProperties.map((property) => (
                    <Marker
                      key={property.id}
                      position={[property.latitude || 7.9465, property.longitude || -1.0232]}
                      icon={defaultIcon}
                    >
                      <Popup>
                        <div className="min-w-[250px] p-3">
                          <div className="flex items-start gap-3">
                            {property.images?.[0]?.url && (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-secondary mb-1">{property.title}</h4>
                              <p className="text-primary font-bold text-lg mb-1">
                                {formatCurrency(property.price)}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                <MapPin className="w-3 h-3" />
                                <span>{property.address}, {property.city}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {property.bedrooms > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Bed className="w-3 h-3" />
                                    {property.bedrooms}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Bath className="w-3 h-3" />
                                  {property.bathrooms}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Maximize className="w-3 h-3" />
                                  {property.area}m²
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {getPropertyTypeLabel(property.type)}
                                </span>
                              </div>
                              <Link
                                href={`/properties/${property.slug}`}
                                className="inline-block mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Showing {filteredProperties.length} of {properties.length} properties on map
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
