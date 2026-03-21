"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Building2, Users, MessageSquare, Calculator, TrendingUp,
  ArrowUpRight, ArrowDownRight, Eye, DollarSign, Clock,
  CheckCircle, XCircle, Loader2, Map,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PropertyMap = dynamic(() => import("@/components/admin/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl bg-muted flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  ),
});

interface RecentProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
  views: number;
  createdAt: string;
}

interface RecentInquiry {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  buyer?: { name: string };
  property?: { title: string };
}

interface DashboardStats {
  totalProperties: number;
  pendingProperties: number;
  totalUsers: number;
  totalInquiries: number;
  totalMortgages: number;
  pendingMortgages: number;
  recentProperties: RecentProperty[];
  recentInquiries: RecentInquiry[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Properties",
      value: stats?.totalProperties || 0,
      icon: Building2,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/properties",
    },
    {
      label: "Pending Approval",
      value: stats?.pendingProperties || 0,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
      href: "/admin/properties?status=PENDING",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-green-50 text-green-600",
      href: "/admin/users",
    },
    {
      label: "Inquiries",
      value: stats?.totalInquiries || 0,
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/inquiries",
    },
    {
      label: "Mortgage Apps",
      value: stats?.totalMortgages || 0,
      icon: Calculator,
      color: "bg-orange-50 text-orange-600",
      href: "/admin/mortgages",
    },
    {
      label: "Pending Mortgages",
      value: stats?.pendingMortgages || 0,
      icon: DollarSign,
      color: "bg-red-50 text-red-600",
      href: "/admin/mortgages?status=PENDING",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={card.href}>
              <div className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-3xl font-bold text-secondary">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-border"
      >
        <h2 className="text-lg font-bold text-secondary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Review Properties", href: "/admin/properties?status=PENDING", icon: Building2, color: "bg-primary" },
            { label: "Manage Users", href: "/admin/users", icon: Users, color: "bg-blue-600" },
            { label: "View Inquiries", href: "/admin/inquiries", icon: MessageSquare, color: "bg-purple-600" },
            { label: "CMS Manager", href: "/admin/cms", icon: Eye, color: "bg-green-600" },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <div className={`${action.color} rounded-xl p-4 text-white text-center hover:opacity-90 transition-opacity`}>
                <action.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Property Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-secondary">Property Map</h2>
              <p className="text-xs text-muted-foreground">All properties with GPS data across Ghana</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Approved</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Pending</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Rejected</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Sold</span>
          </div>
        </div>
        <PropertyMap />
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-secondary">Recent Properties</h2>
            <Link href="/admin/properties" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentProperties?.length ? (
              stats.recentProperties.map((prop) => (
                <div key={prop.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate">{prop.title}</p>
                    <p className="text-xs text-muted-foreground">{prop.city} · {formatCurrency(prop.price)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    prop.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    prop.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {prop.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No properties yet</p>
            )}
          </div>
        </motion.div>

        {/* Recent Inquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-secondary">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentInquiries?.length ? (
              stats.recentInquiries.map((inq) => (
                <div key={inq.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {inq.buyer?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate">{inq.buyer?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{inq.property?.title}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    inq.status === "NEW" ? "bg-blue-100 text-blue-700" :
                    inq.status === "RESPONDED" ? "bg-green-100 text-green-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {inq.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No inquiries yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
