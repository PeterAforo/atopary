"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3, Eye, MessageSquare, Building2, TrendingUp,
  CheckCircle, Clock, XCircle, Loader2, ExternalLink,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";

interface Analytics {
  overview: {
    totalProperties: number;
    approvedProperties: number;
    pendingProperties: number;
    rejectedProperties: number;
    totalInquiries: number;
    pendingInquiries: number;
    respondedInquiries: number;
    totalViews: number;
    responseRate: number;
  };
  topProperties: {
    id: string;
    title: string;
    slug: string;
    city: string;
    price: number;
    status: string;
    views: number;
    type: string;
    createdAt: string;
    inquiryCount: number;
  }[];
  typeBreakdown: { type: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
}

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  SOLD: "bg-blue-100 text-blue-700",
};

export default function SellerAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/analytics")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.overview) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to load analytics data</p>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, topProperties, typeBreakdown, statusBreakdown } = data;

  const statCards = [
    { label: "Total Properties", value: overview.totalProperties, icon: Building2, color: "bg-blue-50 text-blue-600" },
    { label: "Total Views", value: overview.totalViews, icon: Eye, color: "bg-purple-50 text-purple-600" },
    { label: "Total Inquiries", value: overview.totalInquiries, icon: MessageSquare, color: "bg-green-50 text-green-600" },
    { label: "Response Rate", value: `${overview.responseRate}%`, icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track your property performance and engagement
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-border p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-secondary mt-1">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Status Breakdown */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold text-secondary mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.status === "APPROVED" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {item.status === "PENDING" && <Clock className="w-4 h-4 text-yellow-500" />}
                    {item.status === "REJECTED" && <XCircle className="w-4 h-4 text-red-500" />}
                    {!["APPROVED", "PENDING", "REJECTED"].includes(item.status) && <Building2 className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm text-secondary capitalize">{item.status.toLowerCase()}</span>
                  </div>
                  <span className="text-sm font-bold text-secondary">{item.count}</span>
                </div>
              ))}
              {statusBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground">No properties yet</p>
              )}
            </div>
          </div>

          {/* Property Type Breakdown */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold text-secondary mb-4">Property Types</h3>
            <div className="space-y-3">
              {typeBreakdown.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-secondary">{getPropertyTypeLabel(item.type)}</span>
                  <span className="text-sm font-bold text-secondary">{item.count}</span>
                </div>
              ))}
              {typeBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground">No properties yet</p>
              )}
            </div>
          </div>

          {/* Inquiry Summary */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold text-secondary mb-4">Inquiry Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-sm font-bold text-yellow-600">{overview.pendingInquiries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Responded</span>
                <span className="text-sm font-bold text-green-600">{overview.respondedInquiries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-secondary">{overview.totalInquiries}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">Response Rate</span>
                  <span className="text-sm font-bold text-primary">{overview.responseRate}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${overview.responseRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Properties by Views */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold text-secondary mb-4">Top Properties by Views</h3>
          {topProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No properties yet. Start listing!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Property</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Views</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Inquiries</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {topProperties.map((prop) => (
                    <tr key={prop.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-secondary line-clamp-1">{prop.title}</p>
                        <p className="text-xs text-muted-foreground">{prop.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{getPropertyTypeLabel(prop.type)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[prop.status] || "bg-gray-100 text-gray-700"}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-secondary">{formatCurrency(prop.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" /> {prop.views}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="w-3.5 h-3.5" /> {prop.inquiryCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/properties/${prop.slug}`} className="text-primary hover:underline">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
