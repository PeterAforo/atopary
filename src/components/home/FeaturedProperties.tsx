"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  ArrowRight,
  Eye,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface FeaturedProperty {
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
  isFeatured: boolean;
}

export default function FeaturedProperties() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties?limit=6&status=APPROVED&sort=newest")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || properties.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(".featured-header", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".featured-header",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".property-card", {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".property-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, properties]);

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="featured-header text-center mb-16">
          <motion.span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Featured Listings
          </motion.span>
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary">
            Discover Premium{" "}
            <span className="text-gradient">Properties</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Hand-picked properties that meet the highest standards of quality,
            location, and value.
          </p>
        </div>

        {/* Property Grid */}
        <div className="property-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="property-card group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/properties/${property.slug}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop"}
                      alt={property.images?.[0]?.alt || property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg">
                        Featured
                      </span>
                      <span className="px-3 py-1 bg-white/90 text-secondary text-xs font-semibold rounded-lg backdrop-blur-sm">
                        {getPropertyTypeLabel(property.type)}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-4 left-4">
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(property.price)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {property.address}, {property.city}
                      </span>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {property.bedrooms} Beds
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {property.bathrooms} Baths
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Maximize className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {property.area} m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link href="/properties">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all inline-flex items-center gap-2"
            >
              View All Properties
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}
