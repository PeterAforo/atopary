"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Link from "next/link";
import {
  Search,
  MapPin,
  Home,
  Building2,
  ArrowRight,
  Play,
  ChevronDown,
} from "lucide-react";

const stats = [
  { value: "500+", label: "Properties Listed" },
  { value: "200+", label: "Happy Clients" },
  { value: "50+", label: "Cities Covered" },
  { value: "98%", label: "Satisfaction Rate" },
];

const propertyTypes = [
  { label: "All Types", value: "" },
  { label: "Houses", value: "HOUSE" },
  { label: "Apartments", value: "APARTMENT" },
  { label: "Villas", value: "VILLA" },
  { label: "Land", value: "LAND" },
  { label: "Commercial", value: "COMMERCIAL" },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".hero-badge", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".hero-title-line",
          {
            y: 80,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-subtitle",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-search",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-stat",
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.3"
        );

      gsap.to(".hero-bg-shape", {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: "none",
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="hero-bg-shape absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-white/5" />
      <div className="hero-bg-shape absolute -bottom-60 -left-60 w-[800px] h-[800px] rounded-full border border-primary/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40 w-full">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-medium">
              Ghana&apos;s Premier Real Estate Platform
            </span>
          </motion.div>

          {/* Title */}
          <h1 ref={titleRef} className="space-y-2">
            <div className="hero-title-line overflow-hidden">
              <span className="block text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
                Discover Your
              </span>
            </div>
            <div className="hero-title-line overflow-hidden">
              <span className="block text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-primary">Perfect</span>{" "}
                <span className="text-white">Property</span>
              </span>
            </div>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle mt-6 text-lg sm:text-xl text-white/60 max-w-2xl leading-relaxed">
            From luxury homes to commercial spaces, Atopary Properties connects
            you with the finest real estate opportunities across Ghana. Buy,
            sell, or invest with confidence.
          </p>

          {/* Search Bar */}
          <div className="hero-search mt-10 bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20 max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, property name..."
                  className="w-full bg-transparent text-secondary placeholder:text-gray-400 text-sm focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative flex items-center gap-2 bg-white rounded-xl px-4 py-3 min-w-[160px]">
                <Building2 className="w-5 h-5 text-gray-400" />
                <select
                  className="w-full bg-transparent text-secondary text-sm focus:outline-none appearance-none cursor-pointer pr-6"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
              </div>
              <Link
                href={`/properties?search=${searchQuery}&type=${selectedType}`}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                >
                  Search
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="hero-stat">
                <div className="text-3xl lg:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-6 h-6 text-white/50" />
      </motion.div>
    </section>
  );
}
