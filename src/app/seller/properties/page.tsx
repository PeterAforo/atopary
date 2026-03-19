"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, Search, Eye, Edit, Trash2, PlusCircle,
  Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel, getStatusColor, formatDate } from "@/lib/utils";

export default function SellerPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?mine=true&page=${page}&limit=15`);
      const data = await res.json();
      setProperties(data.properties || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) fetchProperties(pagination.page);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">My Properties</h2>
          <p className="text-sm text-muted-foreground">Manage your property listings</p>
        </div>
        <Link href="/seller/properties/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Add Property
          </motion.button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No properties yet</p>
            <Link href="/seller/properties/new" className="text-sm text-primary hover:underline mt-2 inline-block">
              Add your first property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Property</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Views</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property: any) => (
                  <tr key={property.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary truncate max-w-[200px]">{property.title}</p>
                          <p className="text-xs text-muted-foreground">{property.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{getPropertyTypeLabel(property.type)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-secondary">{formatCurrency(property.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusColor(property.status)}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{property.views}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(property.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/properties/${property.slug}`} target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(property.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-1">
              <button onClick={() => fetchProperties(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => fetchProperties(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
