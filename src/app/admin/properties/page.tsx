"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Building2, Search, Eye, CheckCircle, XCircle, Trash2,
  Loader2, ChevronLeft, ChevronRight, Edit2, X, Star, StarOff, Archive, Plus,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel, getStatusColor, formatDate } from "@/lib/utils";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      setSelected(new Set());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [statusFilter]);

  // ─── Single actions ─────────────────────────────────────────
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { fetchProperties(pagination.page); showToast(`Property ${status.toLowerCase()}`); }
    } catch (error) { console.error("Error:", error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) { fetchProperties(pagination.page); showToast("Property deleted"); }
    } catch (error) { console.error("Error:", error); }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
      });
      if (res.ok) { fetchProperties(pagination.page); showToast(!current ? "Marked as featured" : "Removed from featured"); }
    } catch (error) { console.error("Error:", error); }
  };

  // ─── Bulk actions ───────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === properties.length) setSelected(new Set());
    else setSelected(new Set(properties.map(p => p.id)));
  };

  const handleBulkAction = async (action: string) => {
    if (selected.size === 0) return;
    const label = action.charAt(0).toUpperCase() + action.slice(1);
    if (action === "delete" && !confirm(`Delete ${selected.size} properties? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/properties", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (res.ok) { fetchProperties(pagination.page); showToast(`${label} applied to ${selected.size} properties`); }
    } catch (error) { console.error("Error:", error); }
    finally { setBulkLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 bg-secondary text-white text-sm font-medium rounded-xl shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Properties Management</h2>
          <p className="text-sm text-muted-foreground">Manage, approve, and edit property listings ({pagination.total} total)</p>
        </div>
        <Link href="/admin/properties/add"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-border flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search properties..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProperties(1)}
            className="w-full bg-transparent text-sm focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["", "PENDING", "APPROVED", "REJECTED", "SOLD", "ARCHIVED"].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-gray-200"
              }`}>
              {status || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-secondary text-white rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            {[
              { label: "Approve", action: "approve", icon: CheckCircle, color: "bg-green-600 hover:bg-green-700" },
              { label: "Reject", action: "reject", icon: XCircle, color: "bg-orange-600 hover:bg-orange-700" },
              { label: "Feature", action: "feature", icon: Star, color: "bg-yellow-600 hover:bg-yellow-700" },
              { label: "Unfeature", action: "unfeature", icon: StarOff, color: "bg-gray-600 hover:bg-gray-700" },
              { label: "Archive", action: "archive", icon: Archive, color: "bg-blue-600 hover:bg-blue-700" },
              { label: "Delete", action: "delete", icon: Trash2, color: "bg-red-600 hover:bg-red-700" },
            ].map(({ label, action, icon: Icon, color }) => (
              <button key={action} onClick={() => handleBulkAction(action)} disabled={bulkLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1 ${color} disabled:opacity-50`}>
                {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
                {label}
              </button>
            ))}
            <button onClick={() => setSelected(new Set())} className="ml-2 p-1.5 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No properties found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === properties.length && properties.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Seller</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Featured</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property: any) => (
                  <tr key={property.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${selected.has(property.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.has(property.id)}
                        onChange={() => toggleSelect(property.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary truncate max-w-[180px]">{property.title}</p>
                          <p className="text-xs text-muted-foreground">{property.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{getPropertyTypeLabel(property.type)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-secondary">{formatCurrency(property.price)}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{property.seller?.name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusColor(property.status)}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleToggleFeatured(property.id, property.isFeatured)}
                        className={`p-1.5 rounded-lg transition-colors ${property.isFeatured ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-300 hover:bg-gray-50 hover:text-yellow-500"}`}
                        title={property.isFeatured ? "Remove featured" : "Mark featured"}>
                        <Star className={`w-4 h-4 ${property.isFeatured ? "fill-yellow-500" : ""}`} />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(property.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/properties/${property.slug}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" target="_blank" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/properties/${property.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {property.status === "PENDING" && (
                          <>
                            <button onClick={() => handleStatusChange(property.id, "APPROVED")}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatusChange(property.id, "REJECTED")}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(property.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * 15 + 1} to {Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
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
