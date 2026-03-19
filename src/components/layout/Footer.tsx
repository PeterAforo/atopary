"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUpRight,
} from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Team", href: "/about#team" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  properties: [
    { label: "Browse All", href: "/properties" },
    { label: "Houses", href: "/properties?type=HOUSE" },
    { label: "Apartments", href: "/properties?type=APARTMENT" },
    { label: "Commercial", href: "/properties?type=COMMERCIAL" },
    { label: "Land", href: "/properties?type=LAND" },
  ],
  services: [
    { label: "Sell Property", href: "/auth/register?role=SELLER" },
    { label: "Buy Property", href: "/properties" },
    { label: "Mortgage Calculator", href: "/mortgage-calculator" },
    { label: "Property Valuation", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Section */}
        <div className="py-12 lg:py-16 border-b border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Ready to Find Your{" "}
                <span className="text-primary">Dream Home?</span>
              </h2>
              <p className="mt-2 text-white/60 text-lg">
                Let us help you navigate the real estate market with confidence.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/properties" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                >
                  Browse Properties
                </motion.button>
              </Link>
              <Link href="/auth/register?role=SELLER" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                >
                  List Property
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Atopary Properties"
                width={45}
                height={45}
              />
              <div>
                <h3 className="text-xl font-bold">ATOPARY</h3>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                  Properties
                </p>
              </div>
            </Link>
            <p className="mt-6 text-white/60 leading-relaxed max-w-sm">
              Your trusted real estate partner in Ghana. We connect property
              owners with prospective buyers, making real estate transactions
              seamless and transparent.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm">+233 XX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm">info@atopary.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Properties</h4>
            <ul className="space-y-3">
              {footerLinks.properties.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Atopary Properties. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-primary hover:text-white transition-all"
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
