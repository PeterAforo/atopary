"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin, Navigation, Loader2, Bed, Bath, Maximize,
  ArrowRight, AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface NearbyProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  distance: number;
  images: { url: string; alt: string }[];
}

export default function NearMeSection() {
  const [properties, setProperties] = useState<NearbyProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setLocationStatus("granted");
        fetchNearby(loc.lat, loc.lng);
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchNearby = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/nearby?lat=${lat}&lng=${lng}&radius=100&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch { /* silently */ }
    finally { setLoading(false); }
  };

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)}km away`;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-4">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Location-Based</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
            Properties <span className="text-primary">Near You</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover properties close to your current location. The closer, the easier to visit!
          </p>
        </motion.div>

        {/* Location Status */}
        {locationStatus === "idle" || locationStatus === "requesting" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              {locationStatus === "requesting" ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Navigation className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <p className="text-muted-foreground mb-4">
              {locationStatus === "requesting"
                ? "Getting your location..."
                : "Enable location to see properties near you"}
            </p>
            {locationStatus === "idle" && (
              <button onClick={requestLocation}
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all">
                Enable Location
              </button>
            )}
          </motion.div>
        ) : locationStatus === "denied" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-muted-foreground mb-2">Location access was denied or is unavailable.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Please enable location permissions in your browser to see nearby properties.
            </p>
            <button onClick={requestLocation}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all">
              Try Again
            </button>
          </motion.div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No properties found within 100km of your location.</p>
            <Link href="/properties" className="inline-flex items-center gap-2 mt-4 text-primary font-semibold hover:underline">
              Browse all properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {userLocation && (
              <p className="text-center text-sm text-muted-foreground mb-8">
                Showing {properties.length} properties near your location
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link href={`/properties/${property.slug}`}>
                    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {property.images?.[0] ? (
                          <Image
                            src={property.images[0].url}
                            alt={property.images[0].alt || property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {formatDistance(property.distance)}
                        </div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-secondary rounded-lg">
                          {property.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-primary font-bold text-lg">{formatCurrency(property.price)}</p>
                        <h3 className="text-sm font-semibold text-secondary mt-1 truncate">{property.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {property.city}, {property.state}
                        </p>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms}</span>
                          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>
                          <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {property.area} sqft</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/properties"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all">
                View All Properties <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
