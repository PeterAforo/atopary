"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Loader2, Search, ChevronDown, ChevronUp, Send, Trash2,
  X, CheckCircle, Clock, XCircle, MessageCircle,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [respondId, setRespondId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/inquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); setSelected(new Set()); }
  };

  useEffect(() => { fetchInquiries(); }, [statusFilter]);

  // ─── Status change ──────────────────────────────────────────
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { fetchInquiries(); showToast(`Status changed to ${status}`); }
    } catch (error) { console.error("Error:", error); }
  };

  // ─── Respond ────────────────────────────────────────────────
  const handleRespond = async (id: string) => {
    if (!responseText.trim()) return;
    setResponding(true);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseText, status: "RESPONDED" }),
      });
      if (res.ok) {
        setRespondId(null);
        setResponseText("");
        fetchInquiries();
        showToast("Response sent");
      }
    } catch (error) { console.error("Error:", error); }
    finally { setResponding(false); }
  };

  // ─── Bulk actions ───────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selected.size === inquiries.length) setSelected(new Set());
    else setSelected(new Set(inquiries.map(i => i.id)));
  };

  const handleBulkAction = async (action: string) => {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} inquiries?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (res.ok) { fetchInquiries(); showToast(`Action applied to ${selected.size} inquiries`); }
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
      <div>
        <h2 className="text-2xl font-bold text-secondary">All Inquiries</h2>
        <p className="text-sm text-muted-foreground">View, respond, and manage all property inquiries</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-border flex flex-wrap gap-2">
        {["", "NEW", "IN_PROGRESS", "RESPONDED", "CLOSED"].map((status) => (
          <button key={status} onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-gray-200"
            }`}>
            {status ? status.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-secondary text-white rounded-xl px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => handleBulkAction("in_progress")} disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50">
              <Clock className="w-3 h-3" /> In Progress
            </button>
            <button onClick={() => handleBulkAction("responded")} disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 flex items-center gap-1 disabled:opacity-50">
              <CheckCircle className="w-3 h-3" /> Responded
            </button>
            <button onClick={() => handleBulkAction("closed")} disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-600 hover:bg-gray-700 flex items-center gap-1 disabled:opacity-50">
              <XCircle className="w-3 h-3" /> Close
            </button>
            <button onClick={() => handleBulkAction("delete")} disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 flex items-center gap-1 disabled:opacity-50">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-2 p-1.5 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-border text-center py-20">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No inquiries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-3 px-2">
            <input type="checkbox" checked={selected.size === inquiries.length && inquiries.length > 0}
              onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Select all ({inquiries.length})</span>
          </div>

          {inquiries.map((inquiry: any) => (
            <div key={inquiry.id}
              className={`bg-white rounded-xl border overflow-hidden transition-colors ${selected.has(inquiry.id) ? "border-primary/40 bg-primary/5" : "border-border"}`}>
              <div className="p-5 flex items-center gap-4">
                <input type="checkbox" checked={selected.has(inquiry.id)}
                  onChange={() => toggleSelect(inquiry.id)} className="w-4 h-4 rounded border-gray-300 text-primary flex-shrink-0" />
                <div className="flex-1 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {inquiry.buyer?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary">
                        {inquiry.buyer?.name} → {inquiry.property?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={inquiry.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-lg border border-border ${getStatusColor(inquiry.status)}`}>
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESPONDED">RESPONDED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                    {expandedId === inquiry.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </div>

              {expandedId === inquiry.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border">
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Buyer</p>
                        <p className="text-sm text-secondary">{inquiry.buyer?.name} ({inquiry.buyer?.email})</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Property</p>
                        <p className="text-sm text-secondary">{inquiry.property?.title}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Message</p>
                      <p className="text-sm text-secondary bg-muted p-3 rounded-lg">{inquiry.message}</p>
                    </div>
                    {inquiry.response && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Response</p>
                        <p className="text-sm text-secondary bg-green-50 p-3 rounded-lg border border-green-200">{inquiry.response}</p>
                      </div>
                    )}

                    {/* Respond inline */}
                    {respondId === inquiry.id ? (
                      <div className="space-y-2">
                        <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)}
                          rows={3} placeholder="Type your response..."
                          className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => { setRespondId(null); setResponseText(""); }}
                            className="px-4 py-2 bg-gray-100 text-secondary rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
                          <button onClick={() => handleRespond(inquiry.id)} disabled={responding || !responseText.trim()}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-1 disabled:opacity-50">
                            {responding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Send Response
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => { setRespondId(inquiry.id); setResponseText(inquiry.response || ""); }}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-primary-dark">
                          <MessageCircle className="w-3 h-3" /> {inquiry.response ? "Edit Response" : "Respond"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
