"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Plus, Edit2, Trash2, Loader2, X, Save, Eye, EyeOff,
  Instagram, Youtube, ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SocialEmbed {
  id: string;
  platform: string;
  postUrl: string;
  embedCode: string | null;
  caption: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { value: "tiktok", label: "TikTok", color: "bg-black" },
  { value: "youtube", label: "YouTube", color: "bg-red-600" },
  { value: "facebook", label: "Facebook", color: "bg-blue-600" },
  { value: "twitter", label: "Twitter / X", color: "bg-gray-900" },
];

const emptyForm = { platform: "instagram", postUrl: "", embedCode: "", caption: "", order: 0, isActive: true };

export default function AdminSocialMediaPage() {
  const [embeds, setEmbeds] = useState<SocialEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SocialEmbed | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchEmbeds = async () => {
    try {
      const res = await fetch("/api/admin/social-media");
      const data = await res.json();
      setEmbeds(Array.isArray(data) ? data : []);
    } catch { /* silently */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmbeds(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (e: SocialEmbed) => {
    setEditing(e);
    setForm({
      platform: e.platform,
      postUrl: e.postUrl,
      embedCode: e.embedCode || "",
      caption: e.caption || "",
      order: e.order,
      isActive: e.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/admin/social-media/${editing.id}` : "/api/admin/social-media";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchEmbeds();
        showToast(editing ? "Embed updated" : "Embed added");
      }
    } catch { /* silently */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this embed?")) return;
    await fetch(`/api/admin/social-media/${id}`, { method: "DELETE" });
    setEmbeds(prev => prev.filter(e => e.id !== id));
    showToast("Embed deleted");
  };

  const toggleActive = async (e: SocialEmbed) => {
    await fetch(`/api/admin/social-media/${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !e.isActive }),
    });
    setEmbeds(prev => prev.map(item => item.id === e.id ? { ...item, isActive: !item.isActive } : item));
  };

  const getPlatformInfo = (platform: string) => PLATFORMS.find(p => p.value === platform) || { label: platform, color: "bg-gray-500" };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 bg-green-600 text-white text-sm font-medium rounded-xl shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Social Media Embeds</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage social media posts displayed on the website ({embeds.length} embed{embeds.length !== 1 ? "s" : ""})
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
          <Plus className="w-4 h-4" /> Add Embed
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium text-blue-900 mb-1">How social embeds work</p>
        <p>
          Add social media post URLs from Instagram, TikTok, YouTube, etc. The posts will be displayed in a
          &ldquo;Social Media&rdquo; section on the website. You can optionally provide custom embed HTML code
          for more control over the display.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : embeds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No social media embeds yet</p>
          <button onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
            <Plus className="w-4 h-4" /> Add First Embed
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {embeds.map(embed => {
            const platform = getPlatformInfo(embed.platform);
            return (
              <motion.div key={embed.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border p-5 ${embed.isActive ? "border-border" : "border-gray-200 opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold text-white rounded-lg ${platform.color}`}>
                      {platform.label}
                    </span>
                    <span className="text-xs text-muted-foreground">#{embed.order}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(embed)}
                      className={`p-1.5 rounded-lg transition-colors ${embed.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                      {embed.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(embed)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(embed.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <a href={embed.postUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate block mb-2 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{embed.postUrl}</span>
                </a>
                {embed.caption && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{embed.caption}</p>
                )}
                {embed.embedCode && (
                  <p className="text-[10px] text-muted-foreground mt-2 bg-muted px-2 py-1 rounded">Custom embed code provided</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">
                  {editing ? "Edit Embed" : "New Social Media Embed"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Platform *</label>
                    <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm">
                      {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Order</label>
                    <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Post URL *</label>
                  <input value={form.postUrl} onChange={(e) => setForm({ ...form, postUrl: e.target.value })}
                    placeholder="https://www.instagram.com/p/..." className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Caption</label>
                  <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })}
                    placeholder="Optional caption" className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Custom Embed Code <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea value={form.embedCode} onChange={(e) => setForm({ ...form, embedCode: e.target.value })}
                    rows={4} placeholder="<iframe>...</iframe> or <blockquote>...</blockquote>"
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm resize-none font-mono" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the embed code from the social platform. If empty, the post URL will be used to generate an embed automatically.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary" />
                  <span className="text-sm text-secondary">Active (visible on website)</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.platform || !form.postUrl}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
