"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, MessageSquare, Calculator, Heart, Loader2,
  ArrowUpRight, Search, Eye,
} from "lucide-react";

export default function BuyerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/buyer/stats");
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
    { label: "My Inquiries", value: stats?.totalInquiries || 0, icon: MessageSquare, color: "bg-blue-50 text-blue-600", href: "/buyer/inquiries" },
    { label: "Mortgage Apps", value: stats?.totalMortgages || 0, icon: Calculator, color: "bg-green-50 text-green-600", href: "/buyer/mortgages" },
    { label: "Saved Properties", value: 0, icon: Heart, color: "bg-pink-50 text-pink-600", href: "/buyer/saved" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-secondary to-gray-800 rounded-2xl p-8 text-white"
      >
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]}!</h1>
        <p className="mt-2 text-white/70">Find your dream property and track your interests from here.</p>
        <Link href="/properties">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <Search className="w-5 h-5" /> Browse Properties
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={card.href}>
              <div className="bg-white rounded-xl p-6 border border-border hover:shadow-lg transition-all group">
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

      {/* Recent Inquiries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-secondary">Recent Inquiries</h2>
          <Link href="/buyer/inquiries" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {stats?.recentInquiries?.length ? (
            stats.recentInquiries.map((inq: any) => (
              <div key={inq.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{inq.property?.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{inq.message}</p>
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
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No inquiries yet</p>
              <Link href="/properties" className="text-sm text-primary hover:underline mt-1 inline-block">
                Browse properties to get started
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
