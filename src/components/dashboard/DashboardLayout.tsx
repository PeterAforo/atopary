"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Users, MessageSquare, Calculator,
  FileText, Settings, LogOut, Menu, X, ChevronDown, Bell,
  Home, ShoppingBag, PlusCircle, BarChart3, Globe, Layers,
  Mail, Star, UserPlus, Loader2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Properties", href: "/admin/properties", icon: Building2 },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { label: "Mortgages", href: "/admin/mortgages", icon: Calculator },
    { label: "CMS Pages", href: "/admin/cms", icon: FileText },
    { label: "CMS Sections", href: "/admin/sections", icon: Layers },
    { label: "Testimonials", href: "/admin/testimonials", icon: Star },
    { label: "Messages", href: "/admin/messages", icon: Mail },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  SELLER: [
    { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
    { label: "My Properties", href: "/seller/properties", icon: Building2 },
    { label: "Add Property", href: "/seller/properties/new", icon: PlusCircle },
    { label: "Inquiries", href: "/seller/inquiries", icon: MessageSquare },
    { label: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { label: "Profile", href: "/seller/profile", icon: Settings },
  ],
  BUYER: [
    { label: "Dashboard", href: "/buyer", icon: LayoutDashboard },
    { label: "Browse Properties", href: "/properties", icon: Building2 },
    { label: "My Inquiries", href: "/buyer/inquiries", icon: MessageSquare },
    { label: "Mortgage Apps", href: "/buyer/mortgages", icon: Calculator },
    { label: "Saved Properties", href: "/buyer/saved", icon: ShoppingBag },
    { label: "Profile", href: "/buyer/profile", icon: Settings },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Determine which role section this page belongs to
  const pageRole = pathname.startsWith("/admin")
    ? "ADMIN"
    : pathname.startsWith("/seller")
    ? "SELLER"
    : pathname.startsWith("/buyer")
    ? "BUYER"
    : null;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated" && session?.user && pageRole) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== pageRole && userRole !== "ADMIN") {
        switch (userRole) {
          case "ADMIN": router.push("/admin"); break;
          case "SELLER": router.push("/seller"); break;
          case "BUYER": router.push("/buyer"); break;
          default: router.push("/");
        }
      }
    }
  }, [status, session, pageRole, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const role = (session.user as { role: string }).role;

  // Block access if user role doesn't match page section (admin can access all)
  if (pageRole && role !== pageRole && role !== "ADMIN") return null;

  const items = navItems[role] || [];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-border z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Atopary" width={36} height={36} />
              <div>
                <h2 className="text-lg font-bold text-secondary">ATOPARY</h2>
                <p className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground">
                  {role === "ADMIN" ? "Admin Panel" : role === "SELLER" ? "Seller Portal" : "Buyer Portal"}
                </p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-secondary"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-secondary">
                {items.find((i) => i.href === pathname)?.label || "Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Link href="/" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Globe className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
