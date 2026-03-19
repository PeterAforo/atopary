"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield, Users, TrendingUp, Award, Target, Eye,
  CheckCircle, ArrowRight,
} from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const values = [
  { icon: Shield, title: "Integrity", description: "We uphold the highest standards of honesty and transparency in every transaction." },
  { icon: Users, title: "Client First", description: "Your satisfaction and success are at the heart of everything we do." },
  { icon: TrendingUp, title: "Innovation", description: "We leverage technology to make real estate accessible, efficient, and modern." },
  { icon: Award, title: "Excellence", description: "We strive for excellence in service delivery, property curation, and client experience." },
];

const team = [
  { name: "Atopary Team", role: "Founders & Directors", avatar: "AT", bio: "Leading Atopary's vision to transform Ghana's real estate landscape." },
  { name: "Operations Team", role: "Property Management", avatar: "OT", bio: "Ensuring every property listing meets our quality standards." },
  { name: "Finance Team", role: "Mortgage & Finance", avatar: "FT", bio: "Helping clients navigate financing options with confidence." },
  { name: "Tech Team", role: "Platform Development", avatar: "TT", bio: "Building the best digital real estate experience in Ghana." },
];

export default function AboutPage() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-hero-content", {
        y: 60, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out",
      });
      gsap.from(".value-card", {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: ".values-grid", start: "top 80%", toggleActions: "play none none none" },
      });
      gsap.from(".team-card", {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: ".team-grid", start: "top 80%", toggleActions: "play none none none" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={sectionRef}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full border border-primary/20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="about-hero-content inline-block px-4 py-1.5 bg-primary/20 text-primary-light text-sm font-semibold rounded-full mb-6">
              About Atopary
            </span>
            <h1 className="about-hero-content text-4xl lg:text-6xl font-bold leading-tight">
              Transforming Real Estate in <span className="text-primary">Ghana</span>
            </h1>
            <p className="about-hero-content mt-6 text-lg text-white/60 leading-relaxed">
              Atopary Properties is Ghana&apos;s premier digital real estate platform, connecting property
              owners with prospective buyers through a seamless, transparent, and technology-driven experience.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-secondary">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To democratize access to quality real estate in Ghana by providing a trusted platform
                where property owners can list, buyers can discover, and both parties can transact with
                confidence, transparency, and ease.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-secondary">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To become West Africa&apos;s most trusted and innovative real estate platform, setting new
                standards for property discovery, verification, and transaction management through
                cutting-edge technology and exceptional service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Our Values
            </span>
            <h2 className="text-4xl font-bold text-secondary">
              What Drives <span className="text-gradient">Us</span>
            </h2>
          </div>
          <div className="values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card bg-white rounded-2xl p-6 md:p-8 text-center border border-gray-200 shadow-sm hover:shadow-lg transition-all group"
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <value.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Our Team
            </span>
            <h2 className="text-4xl font-bold text-secondary">
              Meet The <span className="text-gradient">Team</span>
            </h2>
          </div>
          <div className="team-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="team-card bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                whileHover={{ y: -5 }}
              >
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-bold text-secondary">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div>
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4 text-white/60 text-lg">
              Join Atopary today and experience real estate the modern way.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register?role=BUYER">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2">
                  Find a Property <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/auth/register?role=SELLER">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
                  List Your Property
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
