"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Home,
  Building2,
  Phone,
  Info,
  Calculator,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const getDashboardLink = () => {
    if (!session) return "/auth/login";
    switch (session.user.role) {
      case "ADMIN":
        return "/admin";
      case "SELLER":
        return "/seller";
      case "BUYER":
        return "/buyer";
      default:
        return "/";
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={isScrolled ? "/images/logo.png" : "/images/logo.png"}
                alt="Atopary Properties"
                width={50}
                height={50}
                loading="eager"
                priority
                className="object-contain"
              />
            </motion.div>
            <div className="hidden sm:block">
              <h1
                className={`text-xl font-bold tracking-tight ${
                  isScrolled ? "text-secondary" : "text-white"
                }`}
              >
                ATOPARY
              </h1>
              <p
                className={`text-[10px] tracking-[0.2em] uppercase ${
                  isScrolled ? "text-muted-foreground" : "text-white/70"
                }`}
              >
                Properties
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-primary/10 hover:text-primary ${
                  isScrolled
                    ? "text-secondary"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isScrolled
                      ? "bg-gray-100 text-secondary hover:bg-gray-200"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-secondary">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full uppercase">
                          {session.user.role}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/auth/login" })}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isScrolled
                      ? "text-secondary hover:text-primary"
                      : "text-white hover:text-primary-light"
                  }`}
                >
                  Sign In
                </Link>
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/30"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`lg:hidden p-2.5 rounded-lg ${
              isScrolled ? "text-secondary" : "text-white"
            }`}
          >
            {isMobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {session ? (
                  <>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/login" })}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileOpen(false)}
                      className="block px-4 py-3 text-center text-secondary font-medium hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileOpen(false)}
                      className="block px-4 py-3 text-center text-white font-semibold bg-primary hover:bg-primary-dark rounded-xl transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
