"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail, MailOpen, Trash2, Loader2, Search, Eye, Calendar, User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === "unread") params.set("isRead", "false");
      if (filter === "read") params.set("isRead", "true");
      const res = await fetch(`/api/admin/messages?${params.toString()}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/admin/messages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Contact Messages</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground hover:bg-gray-50 border border-border"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => { setSelected(msg); if (!msg.isRead) markAsRead(msg.id); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === msg.id
                      ? "bg-primary/5 border-primary"
                      : msg.isRead
                      ? "bg-white border-border hover:bg-gray-50"
                      : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                        <p className={`text-sm truncate ${!msg.isRead ? "font-bold text-secondary" : "font-medium text-secondary"}`}>
                          {msg.name}
                        </p>
                      </div>
                      <p className="text-sm text-secondary truncate mt-1">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{msg.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-border p-6"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-secondary">{selected.subject}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" /> {selected.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {selected.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {formatDate(selected.createdAt)}
                        </span>
                      </div>
                      {selected.phone && (
                        <p className="text-sm text-muted-foreground mt-1">Phone: {selected.phone}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-secondary leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Reply via Email
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl border border-border p-12 text-center">
                  <MailOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a message to read</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
