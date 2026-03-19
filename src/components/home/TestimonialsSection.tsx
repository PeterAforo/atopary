"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id?: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  avatar: string | null;
}

const fallbackTestimonials: Testimonial[] = [
  {
    name: "Kwame Asante",
    role: "Property Buyer",
    content:
      "Atopary made finding our dream home an absolute breeze. The virtual tours saved us so much time, and the mortgage calculator helped us plan our finances perfectly.",
    rating: 5,
    avatar: null,
  },
  {
    name: "Ama Mensah",
    role: "Property Seller",
    content:
      "I listed my property and within weeks, Atopary connected me with serious buyers. The process was transparent, professional, and hassle-free.",
    rating: 5,
    avatar: null,
  },
  {
    name: "Joseph Owusu",
    role: "Real Estate Investor",
    content:
      "As an investor, I rely on Atopary for market insights and verified listings. Their platform has been instrumental in growing my property portfolio.",
    rating: 5,
    avatar: null,
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch(() => { /* use fallback */ });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".testimonials-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [testimonials]);

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary">
            What Our Clients <span className="text-gradient">Say</span>
          </h2>
        </div>

        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-muted rounded-2xl p-8 h-full relative group hover:shadow-lg transition-all duration-500">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {testimonial.avatar || testimonial.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
