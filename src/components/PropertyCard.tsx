"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";

interface PropertyCardProps {
  property: {
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
  };
  viewMode?: "grid" | "list";
  index?: number;
}

export default function PropertyCard({ property, viewMode = "grid", index = 0 }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const toggleFavorite = async () => {
    setIsFavoriteLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      <Link href={`/properties/${property.slug}`}>
        <div
          className={`relative overflow-hidden ${
            viewMode === "list" ? "w-80 h-56" : "h-64"
          }`}
        >
          {property.images?.[0]?.url ? (
            <Image
              src={property.images[0].url}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-300 rounded" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 text-secondary text-xs font-semibold rounded-lg backdrop-blur-sm">
              {getPropertyTypeLabel(property.type)}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="text-xl font-bold text-white drop-shadow-lg">
              {formatCurrency(property.price)}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/properties/${property.slug}`}>
            <h3 className="text-lg font-bold text-secondary hover:text-primary transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite();
            }}
            disabled={isFavoriteLoading}
            className={`p-2 rounded-lg transition-colors ${
              isFavorited
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            } ${isFavoriteLoading ? "opacity-50" : ""}`}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm">{property.address}, {property.city}</span>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {property.bedrooms} Beds
              </span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {property.bathrooms} Baths
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {property.area} m²
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
