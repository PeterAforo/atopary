"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Settings, Plus, Save, Trash2, Loader2, X, Edit2, Key,
  Globe, Palette, Phone, Mail, MapPin, Share2, CreditCard,
  Info, ExternalLink, FileText, Layout, Image,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

const emptyForm = { key: "", value: "", description: "" };

// Settings grouped by category with usage hints
const SETTING_GROUPS = [
  {
    id: "branding",
    label: "Branding & Identity",
    icon: Palette,
    keys: ["site_name", "site_tagline", "site_description", "site_logo", "site_favicon", "site_og_image"],
    hints: {
      site_name: "Displayed in the header, footer, and browser tab. Usage: {{site_name}}",
      site_tagline: "Short tagline shown in the hero section or alongside the logo. Usage: {{site_tagline}}",
      site_description: "Used in SEO meta tags across the website. Usage: {{site_description}}",
      site_logo: "URL to the logo image. Recommended: SVG or PNG with transparent background.",
      site_favicon: "URL to the favicon. Recommended: 32x32 ICO or PNG.",
      site_og_image: "Default Open Graph image for social sharing. Recommended: 1200x630 PNG.",
    },
  },
  {
    id: "contact",
    label: "Contact Information",
    icon: Phone,
    keys: ["contact_email", "contact_phone", "contact_address", "contact_whatsapp", "contact_hours"],
    hints: {
      contact_email: "Shown in the footer and contact page. Also used for system emails.",
      contact_phone: "Primary phone number displayed in header and footer. Format: +233 XX XXX XXXX",
      contact_address: "Physical office address shown in the footer and contact page.",
      contact_whatsapp: "WhatsApp number for the floating chat button. Format: 233XXXXXXXXX (no +)",
      contact_hours: "Business hours text, e.g. 'Mon-Fri 8am-5pm, Sat 9am-2pm'",
    },
  },
  {
    id: "social",
    label: "Social Media Links",
    icon: Share2,
    keys: ["social_facebook", "social_instagram", "social_twitter", "social_linkedin", "social_youtube", "social_tiktok"],
    hints: {
      social_facebook: "Full URL to your Facebook page. Shown in the footer social icons.",
      social_instagram: "Full URL to your Instagram profile.",
      social_twitter: "Full URL to your Twitter/X profile.",
      social_linkedin: "Full URL to your LinkedIn company page.",
      social_youtube: "Full URL to your YouTube channel.",
      social_tiktok: "Full URL to your TikTok profile.",
    },
  },
  {
    id: "seo",
    label: "SEO & Analytics",
    icon: Globe,
    keys: ["google_analytics_id", "google_tag_manager_id", "meta_keywords", "robots_txt"],
    hints: {
      google_analytics_id: "Google Analytics Measurement ID (e.g. G-XXXXXXXXXX).",
      google_tag_manager_id: "Google Tag Manager ID (e.g. GTM-XXXXXXX).",
      meta_keywords: "Comma-separated keywords for the site-wide meta keywords tag.",
      robots_txt: "Custom robots.txt content. Leave empty for default behavior.",
    },
  },
  {
    id: "business",
    label: "Business & Payments",
    icon: CreditCard,
    keys: ["currency_code", "currency_symbol", "default_country", "commission_rate", "mortgage_partner"],
    hints: {
      currency_code: "ISO currency code (e.g. GHS). Used in API responses.",
      currency_symbol: "Currency symbol for display (e.g. GH₵). Used on property cards.",
      default_country: "Default country for new properties. e.g. Ghana",
      commission_rate: "Commission percentage for property transactions. e.g. 2.5",
      mortgage_partner: "Name of the mortgage partner organization.",
    },
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SiteSetting | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [activeGroup, setActiveGroup] = useState("branding");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(Array.isArray(data) ? data : []);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSettingByKey = (key: string) => settings.find(s => s.key === key);

  const openCreate = (prefillKey = "") => {
    setEditing(null);
    setForm({ key: prefillKey, value: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (s: SiteSetting) => {
    setEditing(s);
    setForm({ key: s.key, value: s.value, description: s.description || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchSettings();
        showToast(editing ? "Setting updated" : "Setting created");
      }
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this setting?")) return;
    await fetch(`/api/admin/settings/${id}`, { method: "DELETE" });
    setSettings((prev) => prev.filter((s) => s.id !== id));
    showToast("Setting deleted");
  };

  // Get settings not in any predefined group (custom settings)
  const allGroupKeys = SETTING_GROUPS.flatMap(g => g.keys);
  const customSettings = settings.filter(s => !allGroupKeys.includes(s.key));

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
            <h2 className="text-2xl font-bold text-secondary">Site Settings</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Configure global site settings. These values are used across the website.
            </p>
          </div>
          <button onClick={() => openCreate()}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
            <Plus className="w-4 h-4" /> Add Custom Setting
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">How settings work</p>
              <p className="text-sm text-blue-700 mt-1">
                Settings are key-value pairs used across the website. Use the key in templates with {"{{key_name}}"} syntax.
                For page content (hero text, about sections, etc.), use the{" "}
                <Link href="/admin/cms" className="underline font-medium inline-flex items-center gap-0.5">
                  CMS sections <ExternalLink className="w-3 h-3" />
                </Link>{" "}
                or{" "}
                <Link href="/admin/sections" className="underline font-medium inline-flex items-center gap-0.5">
                  Page sections <ExternalLink className="w-3 h-3" />
                </Link>{" "}
                instead.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Group Navigation Tabs */}
            <div className="flex gap-2 flex-wrap">
              {SETTING_GROUPS.map(group => (
                <button key={group.id} onClick={() => setActiveGroup(group.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeGroup === group.id
                      ? "bg-primary text-white"
                      : "bg-white text-muted-foreground hover:bg-muted border border-border"
                  }`}>
                  <group.icon className="w-4 h-4" />
                  {group.label}
                </button>
              ))}
              {customSettings.length > 0 && (
                <button onClick={() => setActiveGroup("custom")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeGroup === "custom"
                      ? "bg-primary text-white"
                      : "bg-white text-muted-foreground hover:bg-muted border border-border"
                  }`}>
                  <Key className="w-4 h-4" /> Custom ({customSettings.length})
                </button>
              )}
            </div>

            {/* Active Group Settings */}
            {SETTING_GROUPS.filter(g => g.id === activeGroup).map(group => (
              <div key={group.id} className="bg-white rounded-xl border border-border">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <group.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary">{group.label}</h3>
                      <p className="text-xs text-muted-foreground">{group.keys.length} settings in this group</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {group.keys.map(key => {
                    const setting = getSettingByKey(key);
                    const hint = (group.hints as unknown as Record<string, string>)[key] || "";
                    return (
                      <div key={key} className="p-5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-mono font-semibold text-secondary bg-muted px-2 py-0.5 rounded">{key}</code>
                              {setting && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-green-100 text-green-700 rounded">SET</span>
                              )}
                              {!setting && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">NOT SET</span>
                              )}
                            </div>
                            {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
                            {setting && (
                              <p className="text-sm text-secondary mt-2 truncate max-w-xl">{setting.value}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {setting ? (
                              <>
                                <button onClick={() => openEdit(setting)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(setting.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => openCreate(key)}
                                className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                                Set Value
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Custom Settings */}
            {activeGroup === "custom" && (
              <div className="bg-white rounded-xl border border-border">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary">Custom Settings</h3>
                      <p className="text-xs text-muted-foreground">User-defined key-value settings not in a predefined group</p>
                    </div>
                  </div>
                </div>
                {customSettings.length === 0 ? (
                  <div className="p-12 text-center">
                    <Key className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No custom settings</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {customSettings.map(setting => (
                      <div key={setting.id} className="p-5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <code className="text-sm font-mono font-semibold text-secondary bg-muted px-2 py-0.5 rounded">{setting.key}</code>
                            {setting.description && <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>}
                            <p className="text-sm text-secondary mt-2 truncate max-w-xl">{setting.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Updated {formatDate(setting.updatedAt)}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => openEdit(setting)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(setting.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-secondary">
                    {editing ? "Edit Setting" : "New Setting"}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Key *</label>
                    <input
                      value={form.key}
                      onChange={(e) => setForm({ ...form, key: e.target.value })}
                      placeholder="site_name"
                      disabled={!!editing}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm font-mono disabled:opacity-50"
                    />
                    {!editing && (
                      <p className="text-xs text-muted-foreground mt-1">Use snake_case (e.g. my_setting_key)</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Value *</label>
                    <textarea
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      rows={3}
                      placeholder="Setting value..."
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="What this setting controls"
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.key || !form.value}
                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
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
