"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MortgageCalculator from "@/components/property/MortgageCalculator";
import {
  MapPin, Bed, Bath, Maximize, Calendar, Car, Sofa, Eye, Heart,
  Share2, Phone, Mail, MessageSquare, ChevronLeft, ChevronRight,
  Building2, Loader2, CheckCircle, Play, X, Calculator,
} from "lucide-react";
import { formatCurrency, getPropertyTypeLabel, formatDate } from "@/lib/utils";

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const { data: session } = useSession();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showMortgage, setShowMortgage] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProperty();
  }, [slug]);

  const handleInquiry = async () => {
    if (!session) {
      window.location.href = "/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inquiryMessage, propertyId: property.id }),
      });
      if (res.ok) {
        setSent(true);
        setInquiryMessage("");
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Building2 className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-secondary">Property Not Found</h2>
          <Link href="/properties" className="mt-4 text-primary hover:underline">
            Browse Properties
          </Link>
        </div>
      </main>
    );
  }

  const images = property.images?.length
    ? property.images
    : [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop", alt: property.title }];

  return (
    <main>
      <Navbar />

      <section className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-primary">Properties</Link>
            <span>/</span>
            <span className="text-secondary font-medium">{property.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div
                  className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                >
                  <Image
                    src={images[activeImage]?.url}
                    alt={images[activeImage]?.alt || property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-secondary text-sm rounded-lg flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {property.views} views
                    </span>
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage(Math.max(0, activeImage - 1)); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage(Math.min(images.length - 1, activeImage + 1)); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {images.map((img: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          activeImage === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Property Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-lg">
                    {getPropertyTypeLabel(property.type)}
                  </span>
                  {property.isFeatured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-lg">Featured</span>
                  )}
                  {property.furnished && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">Furnished</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary">{property.title}</h1>
                <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{property.address}, {property.city}, {property.state}, {property.country}</span>
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-bold text-primary">{formatCurrency(property.price)}</div>
              </motion.div>

              {/* Key Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              >
                {[
                  { icon: Bed, label: "Bedrooms", value: property.bedrooms },
                  { icon: Bath, label: "Bathrooms", value: property.bathrooms },
                  { icon: Maximize, label: "Area", value: `${property.area} m²` },
                  { icon: Car, label: "Parking", value: property.parking },
                  { icon: Calendar, label: "Year Built", value: property.yearBuilt || "N/A" },
                  { icon: Sofa, label: "Furnished", value: property.furnished ? "Yes" : "No" },
                ].map((detail, i) => (
                  <div key={i} className="bg-muted rounded-xl p-4 text-center">
                    <detail.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{detail.label}</p>
                    <p className="text-lg font-bold text-secondary">{detail.value}</p>
                  </div>
                ))}
              </motion.div>

              {/* Description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-2xl font-bold text-secondary mb-4">Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              </motion.div>

              {/* Features */}
              {property.features?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h2 className="text-2xl font-bold text-secondary mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Virtual Tour */}
              {property.virtualTour && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <h2 className="text-2xl font-bold text-secondary mb-4">Virtual Tour</h2>
                  <div className="relative h-[250px] sm:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden bg-secondary">
                    <iframe
                      src={property.virtualTour}
                      className="w-full h-full"
                      allowFullScreen
                      title="Virtual Tour"
                    />
                  </div>
                </motion.div>
              )}

              {/* Videos */}
              {property.videos?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <h2 className="text-2xl font-bold text-secondary mb-4">Property Videos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.videos.map((video: any) => (
                      <div key={video.id} className="relative h-56 rounded-xl overflow-hidden bg-secondary">
                        <iframe
                          src={video.url}
                          className="w-full h-full"
                          allowFullScreen
                          title={video.title || "Property Video"}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Mortgage Calculator */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-secondary">Mortgage Calculator</h2>
                  <button
                    onClick={() => setShowMortgage(!showMortgage)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-all"
                  >
                    <Calculator className="w-4 h-4" />
                    {showMortgage ? "Hide" : "Calculate"}
                  </button>
                </div>
                <AnimatePresence>
                  {showMortgage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <MortgageCalculator propertyPrice={property.price} propertyId={property.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Seller Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28"
              >
                <h3 className="text-lg font-bold text-secondary mb-4">Contact Seller</h3>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {property.seller?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{property.seller?.name}</p>
                    <p className="text-sm text-muted-foreground">Property Owner</p>
                  </div>
                </div>

                {sent ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-700">Inquiry Sent!</p>
                    <p className="text-sm text-green-600 mt-1">We&apos;ll get back to you soon.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      rows={4}
                      placeholder="Hi, I'm interested in this property. Please share more details..."
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-secondary placeholder:text-gray-400 text-sm resize-none transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInquiry}
                      disabled={!inquiryMessage.trim() || sending}
                      className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Send Inquiry
                        </>
                      )}
                    </motion.button>

                    {property.seller?.phone && (
                      <a
                        href={`tel:${property.seller.phone}`}
                        className="w-full py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Call Seller
                      </a>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                  <button className="flex-1 py-2.5 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4" /> Save
                  </button>
                  <button className="flex-1 py-2.5 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Mortgage CTA */}
                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <h4 className="font-semibold text-secondary text-sm">Need Financing?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your mortgage eligibility and apply directly.
                  </p>
                  <button
                    onClick={() => setShowMortgage(true)}
                    className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-1"
                  >
                    <Calculator className="w-4 h-4" />
                    Mortgage Calculator
                  </button>
                </div>

                {/* Property Details Summary */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <h4 className="font-semibold text-secondary">Property Details</h4>
                  {[
                    { label: "Type", value: getPropertyTypeLabel(property.type) },
                    { label: "Status", value: property.status },
                    { label: "Listed", value: formatDate(property.createdAt) },
                    { label: "ID", value: property.id.slice(0, 8).toUpperCase() },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-secondary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-5xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={images[activeImage]?.url}
                alt={images[activeImage]?.alt || ""}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(Math.max(0, activeImage - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveImage(Math.min(images.length - 1, activeImage + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
