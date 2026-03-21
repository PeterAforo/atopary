"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Users, Send, Loader2, Search, Trash2, X, Save, Plus,
  ChevronLeft, ChevronRight, Eye, EyeOff, FileText, Clock, CheckCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type Tab = "subscribers" | "campaigns";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface Campaign {
  id: string;
  subject: string;
  content: string;
  sentAt: string | null;
  sentCount: number;
  status: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [tab, setTab] = useState<Tab>("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [activeCount, setActiveCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Campaign modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({ subject: "", content: "" });
  const [campaignSaving, setCampaignSaving] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("tab", tab);
      params.set("page", page.toString());
      if (search && tab === "subscribers") params.set("search", search);

      const res = await fetch(`/api/admin/newsletter?${params.toString()}`);
      const data = await res.json();

      if (tab === "subscribers") {
        setSubscribers(data.subscribers || []);
        setActiveCount(data.activeCount || 0);
      } else {
        setCampaigns(data.campaigns || []);
      }
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      setSelected(new Set());
    } catch { /* silently */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  // Selection
  const items = tab === "subscribers" ? subscribers : campaigns;
  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i: any) => i.id)));
  };

  const handleBulkAction = async (action: string) => {
    if (selected.size === 0) return;
    if (action.includes("delete") && !confirm(`Delete ${selected.size} items?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (res.ok) { fetchData(pagination.page); showToast(`Action applied to ${selected.size} items`); }
    } catch { /* silently */ }
    finally { setBulkLoading(false); }
  };

  // Campaign CRUD
  const openCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({ subject: "", content: "" });
    setShowCampaignModal(true);
  };

  const openEditCampaign = (c: Campaign) => {
    setEditingCampaign(c);
    setCampaignForm({ subject: c.subject, content: c.content });
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = async () => {
    setCampaignSaving(true);
    try {
      if (editingCampaign) {
        const res = await fetch(`/api/admin/newsletter/${editingCampaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campaignForm),
        });
        if (res.ok) { setShowCampaignModal(false); fetchData(pagination.page); showToast("Campaign updated"); }
      } else {
        const res = await fetch("/api/admin/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campaignForm),
        });
        if (res.ok) { setShowCampaignModal(false); fetchData(1); showToast("Campaign created"); }
      }
    } catch { /* silently */ }
    finally { setCampaignSaving(false); }
  };

  const handleSendCampaign = async (id: string) => {
    if (!confirm("Send this campaign to all active subscribers? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });
      if (res.ok) { fetchData(pagination.page); showToast("Campaign marked as sent"); }
    } catch { /* silently */ }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      fetchData(pagination.page);
      showToast("Campaign deleted");
    } catch { /* silently */ }
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Newsletter</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} active subscriber{activeCount !== 1 ? "s" : ""} &middot; Manage subscribers and campaigns
          </p>
        </div>
        {tab === "campaigns" && (
          <button onClick={openCreateCampaign}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "subscribers" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted border border-border"
          }`}>
          <Users className="w-4 h-4" /> Subscribers
        </button>
        <button onClick={() => setTab("campaigns")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "campaigns" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted border border-border"
          }`}>
          <FileText className="w-4 h-4" /> Campaigns
        </button>
      </div>

      {/* Search (subscribers only) */}
      {tab === "subscribers" && (
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by email or name..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
              className="w-full bg-transparent text-sm focus:outline-none" />
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-secondary text-white rounded-xl px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            {tab === "subscribers" && (
              <>
                <button onClick={() => handleBulkAction("deactivate_subscribers")} disabled={bulkLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-50">
                  Deactivate
                </button>
                <button onClick={() => handleBulkAction("activate_subscribers")} disabled={bulkLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50">
                  Activate
                </button>
                <button onClick={() => handleBulkAction("delete_subscribers")} disabled={bulkLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50">
                  Delete
                </button>
              </>
            )}
            {tab === "campaigns" && (
              <button onClick={() => handleBulkAction("delete_campaigns")} disabled={bulkLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50">
                Delete
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="ml-2 p-1.5 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : tab === "subscribers" ? (
          /* Subscribers Table */
          subscribers.length === 0 ? (
            <div className="text-center py-20">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No subscribers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selected.size === subscribers.length && subscribers.length > 0}
                        onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-primary" />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(sub => (
                    <tr key={sub.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${selected.has(sub.id) ? "bg-primary/5" : ""}`}>
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selected.has(sub.id)} onChange={() => toggleSelect(sub.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium text-secondary">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{sub.name || "—"}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          sub.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {sub.isActive ? "Active" : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(sub.subscribedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Campaigns */
          campaigns.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No campaigns yet</p>
              <button onClick={openCreateCampaign}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
                <Plus className="w-4 h-4" /> Create First Campaign
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="p-5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input type="checkbox" checked={selected.has(campaign.id)} onChange={() => toggleSelect(campaign.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-secondary truncate">{campaign.subject}</h4>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                            campaign.status === "sent" ? "bg-green-100 text-green-700" :
                            campaign.status === "draft" ? "bg-gray-100 text-gray-600" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {campaign.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{campaign.content.replace(/<[^>]*>/g, "").slice(0, 150)}...</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Created {formatDate(campaign.createdAt)}
                          </span>
                          {campaign.sentAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" /> Sent to {campaign.sentCount} subscribers
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {campaign.status === "draft" && (
                        <>
                          <button onClick={() => openEditCampaign(campaign)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSendCampaign(campaign.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Send">
                            <Send className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteCampaign(campaign.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-1">
              <button onClick={() => fetchData(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchData(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCampaignModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary">
                  {editingCampaign ? "Edit Campaign" : "New Campaign"}
                </h3>
                <button onClick={() => setShowCampaignModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Subject *</label>
                  <input value={campaignForm.subject} onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm"
                    placeholder="Newsletter subject line..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Content (HTML supported) *</label>
                  <textarea value={campaignForm.content} onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                    rows={10} className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm resize-none font-mono"
                    placeholder="<h1>Hello!</h1><p>Your newsletter content...</p>" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCampaignModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">Cancel</button>
                <button onClick={handleSaveCampaign}
                  disabled={campaignSaving || !campaignForm.subject || !campaignForm.content}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {campaignSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingCampaign ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
