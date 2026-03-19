"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSent(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: "Visit Us", detail: "Accra, Greater Accra Region, Ghana" },
    { icon: Phone, title: "Call Us", detail: "+233 XX XXX XXXX" },
    { icon: Mail, title: "Email Us", detail: "info@atopary.com" },
    { icon: Clock, title: "Working Hours", detail: "Mon - Fri: 8AM - 6PM" },
  ];

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary-light text-sm font-semibold rounded-full mb-6">
              Contact Us
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold">
              Get In <span className="text-primary">Touch</span>
            </h1>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Have questions about buying, selling, or listing a property? We&apos;re here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-secondary">Contact Information</h2>
              <p className="text-muted-foreground">
                Reach out to us through any of these channels and we&apos;ll respond promptly.
              </p>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 rounded-2xl p-12 text-center border border-green-200"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-700">Message Sent!</h3>
                  <p className="mt-2 text-green-600">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl p-8 border border-border space-y-6"
                >
                  <h2 className="text-2xl font-bold text-secondary">Send Us a Message</h2>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Full Name *</label>
                      <input
                        type="text" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Email *</label>
                      <input
                        type="email" required value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Phone</label>
                      <input
                        type="tel" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+233 XX XXX XXXX"
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Subject *</label>
                      <input
                        type="text" required value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Message *</label>
                    <textarea
                      required rows={5} value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm resize-none transition-all"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={sending}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                  </motion.button>
                </motion.form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
