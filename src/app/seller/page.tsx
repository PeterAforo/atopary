"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, MessageSquare, Eye, TrendingUp, PlusCircle,
  Loader2, ArrowUpRight, Clock, CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/seller/stats");
        if (res.ok) setStats(await res.json());
      } catch (error) {
        console.error("Error:", error);
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
    { label: "Total Properties", value: stats?.totalProperties || 0, icon: Building2, color: "bg-blue-50 text-blue-600" },
    { label: "Approved", value: stats?.approvedProperties || 0, icon: CheckCircle, color: "bg-green-50 text-green-600" },
    { label: "Pending", value: stats?.pendingProperties || 0, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Total Views", value: stats?.totalViews || 0, icon: Eye, color: "bg-purple-50 text-purple-600" },
    { label: "Inquiries", value: stats?.totalInquiries || 0, icon: MessageSquare, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white"
      >
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]}!</h1>
        <p className="mt-2 text-white/70">Manage your properties and track buyer interest from your dashboard.</p>
        <Link href="/seller/properties/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-3 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> Add New Property
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-5 border border-border"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-secondary">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Properties */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-secondary">My Properties</h2>
          <Link href="/seller/properties" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {stats?.recentProperties?.length ? (
            stats.recentProperties.map((prop: any) => (
              <div key={prop.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{prop.title}</p>
                  <p className="text-xs text-muted-foreground">{prop.city} · {formatCurrency(prop.price)}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" /> {prop.views}
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
            <div className="text-center py-8">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No properties yet</p>
              <Link href="/seller/properties/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                Add your first property
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
