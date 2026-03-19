"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Plus, Edit, Trash2, Eye, Loader2, Save, X,
  Globe, EyeOff,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCMSPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "", slug: "", content: "", metaTitle: "", metaDesc: "", isPublished: false,
  });

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/cms");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const openForm = (page?: any) => {
    if (page) {
      setEditing(page);
      setFormData({
        title: page.title, slug: page.slug, content: page.content,
        metaTitle: page.metaTitle || "", metaDesc: page.metaDesc || "",
        isPublished: page.isPublished,
      });
    } else {
      setEditing(null);
      setFormData({ title: "", slug: "", content: "", metaTitle: "", metaDesc: "", isPublished: false });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/admin/cms/${editing.id}` : "/api/admin/cms";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        fetchPages();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    try {
      await fetch(`/api/admin/cms/${id}`, { method: "DELETE" });
      fetchPages();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">CMS Pages</h2>
          <p className="text-sm text-muted-foreground">Manage website content pages</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openForm()}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> New Page
        </motion.button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-secondary">
                {editing ? "Edit Page" : "Create New Page"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Title *</label>
                  <input
                    type="text" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Slug</label>
                  <input
                    type="text" value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Content *</label>
                <textarea
                  rows={10} value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Meta Title</label>
                  <input
                    type="text" value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Meta Description</label>
                  <input
                    type="text" value={formData.metaDesc}
                    onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox" id="isPublished" checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-gray-300"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-secondary">Publish this page</label>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.content}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing ? "Update" : "Create"} Page
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Pages List */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No pages created yet</p>
            <button onClick={() => openForm()} className="text-primary hover:underline text-sm mt-2">
              Create your first page
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Page</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Slug</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Updated</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page: any) => (
                  <tr key={page.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-secondary">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">/{page.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        page.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {page.isPublished ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {page.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(page.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openForm(page)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(page.id)}
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
      </div>
    </div>
  );
}
