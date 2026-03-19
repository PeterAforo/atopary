"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Building2,
  Loader2,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";

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

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      if (city) params.set("city", city);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (bedrooms) params.set("bedrooms", bedrooms);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }, [search, type, city, minPrice, maxPrice, bedrooms]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties(1);
  };

  return (
    <main>
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Browse <span className="text-primary">Properties</span>
            </h1>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Explore our curated collection of premium properties across Ghana
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="mt-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, property name..."
                  className="w-full bg-transparent text-secondary placeholder:text-gray-400 text-sm focus:outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-4 py-3 bg-white rounded-xl text-secondary text-sm focus:outline-none min-w-[150px]"
              >
                {propertyTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </motion.form>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 max-w-4xl mx-auto"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-lg text-secondary text-sm"
                      >
                        <option value="">All Cities</option>
                        {cities.filter(Boolean).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Min Price</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2.5 bg-white rounded-lg text-secondary text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Max Price</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full px-3 py-2.5 bg-white rounded-lg text-secondary text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Min Bedrooms</label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-lg text-secondary text-sm"
                      >
                        <option value="">Any</option>
                        {[1, 2, 3, 4, 5, 6].map((b) => (
                          <option key={b} value={b}>{b}+</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setCity("");
                        setMinPrice("");
                        setMaxPrice("");
                        setBedrooms("");
                        setSearch("");
                        setType("");
                      }}
                      className="px-4 py-2 text-white/60 text-sm hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => fetchProperties(1)}
                      className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-secondary">{pagination.total}</span>{" "}
              properties found
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* No Results */}
          {!loading && properties.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary">No Properties Found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search criteria or browse all properties
              </p>
            </motion.div>
          )}

          {/* Property Grid */}
          {!loading && properties.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {properties.map((property: any, index: number) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/properties/${property.slug}`}>
                    <div
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
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
                            <Building2 className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 text-secondary text-xs font-semibold rounded-lg backdrop-blur-sm">
                            {getPropertyTypeLabel(property.type)}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="text-2xl font-bold text-white">
                            {formatCurrency(property.price)}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-sm">
                            {property.address}, {property.city}
                          </span>
                        </div>
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
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchProperties(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => fetchProperties(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === page
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => fetchProperties(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
