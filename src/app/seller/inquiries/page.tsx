"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Loader2, Building2, Send, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function SellerInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await fetch("/api/inquiries");
        if (res.ok) {
          const data = await res.json();
          setInquiries(data.inquiries || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) return;
    setResponding(true);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseText, status: "RESPONDED" }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === id ? { ...inq, response: responseText, status: "RESPONDED" } : inq
          )
        );
        setResponseText("");
        setExpandedId(null);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary">Property Inquiries</h2>
        <p className="text-sm text-muted-foreground">View and respond to inquiries managed by Atopary on your behalf</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-border text-center py-20">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry: any) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">Inquiry via Atopary</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {inquiry.property?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</span>
                  {expandedId === inquiry.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedId === inquiry.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border"
                >
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Message</p>
                      <p className="text-sm text-secondary bg-muted p-3 rounded-lg">{inquiry.message}</p>
                    </div>

                    {inquiry.response && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Your Response</p>
                        <p className="text-sm text-secondary bg-green-50 p-3 rounded-lg border border-green-200">{inquiry.response}</p>
                      </div>
                    )}

                    {inquiry.status !== "RESPONDED" && inquiry.status !== "CLOSED" && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Your response will be forwarded to the buyer by Atopary.</p>
                        <div className="flex gap-2">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response to Atopary..."
                            rows={3}
                            className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm resize-none"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRespond(inquiry.id)}
                            disabled={responding || !responseText.trim()}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold self-end disabled:opacity-50 flex items-center gap-1"
                          >
                            {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3 h-3" /> Reply</>}
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
