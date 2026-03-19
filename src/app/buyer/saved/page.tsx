"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart, MapPin, Bed, Bath, Maximize, Loader2, Trash2,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";

interface FavoriteItem {
  id: string;
  propertyId: string;
  createdAt: string;
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
}

export default function BuyerSavedPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (propertyId: string) => {
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    setFavorites((prev) => prev.filter((f) => f.propertyId !== propertyId));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Saved Properties</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {favorites.length} saved propert{favorites.length !== 1 ? "ies" : "y"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No saved properties yet</p>
            <Link
              href="/properties"
              className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all"
              >
                <Link href={`/properties/${fav.property.slug}`}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={fav.property.images?.[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop"}
                      alt={fav.property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 text-secondary text-xs font-semibold rounded-lg backdrop-blur-sm">
                        {getPropertyTypeLabel(fav.property.type)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-xl font-bold text-white drop-shadow-lg">
                        {formatCurrency(fav.property.price)}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/properties/${fav.property.slug}`}>
                    <h3 className="text-base font-bold text-secondary hover:text-primary transition-colors line-clamp-1">
                      {fav.property.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm">{fav.property.address}, {fav.property.city}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {fav.property.bedrooms > 0 && (
                        <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {fav.property.bedrooms}</span>
                      )}
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {fav.property.bathrooms}</span>
                      <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {fav.property.area}m²</span>
                    </div>
                    <button
                      onClick={() => removeFavorite(fav.propertyId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
