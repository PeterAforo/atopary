"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UserPlus, Upload, CheckCircle, Handshake } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up as a property seller or buyer in minutes.",
    step: "01",
  },
  {
    icon: Upload,
    title: "List or Browse",
    description: "Sellers upload property details; buyers explore listings.",
    step: "02",
  },
  {
    icon: CheckCircle,
    title: "Verification",
    description: "Our team verifies and approves property listings.",
    step: "03",
  },
  {
    icon: Handshake,
    title: "Close the Deal",
    description: "We facilitate the connection and transaction process.",
    step: "04",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".step-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".connector-line", {
        scaleX: 0,
        duration: 1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-secondary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary-light text-sm font-semibold rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Simple Steps to Your{" "}
            <span className="text-primary">Dream Property</span>
          </h2>
        </div>

        <div className="steps-container relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2">
            <div className="connector-line absolute inset-0 bg-gradient-to-r from-primary to-primary-light origin-left" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="step-card relative"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all duration-500 group">
                  <div className="text-6xl font-bold text-white/5 absolute top-4 right-4 group-hover:text-primary/10 transition-colors">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/60">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
