"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Home,
  DollarSign,
  Shield,
  Users,
  TrendingUp,
  Calculator,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Home,
    title: "Property Listing",
    description:
      "List your property with detailed descriptions, high-quality images, and virtual tours to attract the right buyers.",
    color: "bg-red-50 text-primary",
  },
  {
    icon: Users,
    title: "Buyer Matching",
    description:
      "We connect property owners with vetted prospective buyers, ensuring smooth and reliable transactions.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Calculator,
    title: "Mortgage Assistance",
    description:
      "Use our mortgage calculator to check eligibility and apply for financing directly through our platform.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Shield,
    title: "Verified Properties",
    description:
      "Every property listed on Atopary undergoes thorough verification to ensure authenticity and value.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description:
      "Stay informed with real-time market data, property valuations, and investment trends across Ghana.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: DollarSign,
    title: "Fair Pricing",
    description:
      "Transparent pricing with no hidden fees. We ensure both buyers and sellers get the best deal possible.",
    color: "bg-teal-50 text-teal-600",
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".service-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Our Services
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary">
            What We <span className="text-gradient">Offer</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive real estate services designed to make your property
            journey seamless and rewarding.
          </p>
        </div>

        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="service-card"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-8 h-full shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 group cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
