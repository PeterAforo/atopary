"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare, Loader2, Building2, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function BuyerInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary">My Inquiries</h2>
        <p className="text-sm text-muted-foreground">Track the status of your property inquiries</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-border text-center py-20">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No inquiries yet</p>
          <Link href="/properties" className="text-sm text-primary hover:underline mt-2 inline-block">
            Browse properties
          </Link>
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
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">{inquiry.property?.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
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
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Your Message</p>
                      <p className="text-sm text-secondary bg-muted p-3 rounded-lg">{inquiry.message}</p>
                    </div>
                    {inquiry.response && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Seller Response</p>
                        <p className="text-sm text-secondary bg-green-50 p-3 rounded-lg border border-green-200">{inquiry.response}</p>
                      </div>
                    )}
                    <Link href={`/properties/${inquiry.property?.slug}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      View Property →
                    </Link>
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
