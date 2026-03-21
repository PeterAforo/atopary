"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, Loader2, Plus, X, ImageIcon,
  Building2, MapPin, DollarSign, Bed, Bath, Maximize,
  Car, Calendar, Star, Layers, Video, Globe, Navigation, Crosshair,
} from "lucide-react";

const PROPERTY_TYPES = [
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDO", label: "Condo" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "VILLA", label: "Villa" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "OFFICE", label: "Office" },
];

const STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SOLD", label: "Sold" },
  { value: "ARCHIVED", label: "Archived" },
];

const COMMON_FEATURES = [
  "Swimming Pool", "Garden", "Garage", "Security", "CCTV", "Generator",
  "Air Conditioning", "Balcony", "Gym", "Elevator", "Rooftop", "Smart Home",
  "Solar Panels", "Water Storage", "Boys Quarters", "Gate House",
  "Paved Compound", "Internet Ready", "Fully Tiled", "Walk-in Closet",
];

export default function AdminAddPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ghana",
    type: "HOUSE",
    status: "APPROVED",
    bedrooms: "0",
    bathrooms: "0",
    area: "",
    yearBuilt: "",
    parking: "0",
    furnished: false,
    isFeatured: false,
    features: [] as string[],
    virtualTour: "",
    latitude: "",
    longitude: "",
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const [images, setImages] = useState<{ url: string; alt: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [videos, setVideos] = useState<{ url: string; title: string }[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const updateField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField("latitude", String(position.coords.latitude));
        updateField("longitude", String(position.coords.longitude));
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || "Failed to get location");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, { url: newImageUrl.trim(), alt: form.title || "Property image" }]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addVideo = () => {
    if (!newVideoUrl.trim()) return;
    setVideos(prev => [...prev, { url: newVideoUrl.trim(), title: newVideoTitle.trim() || "Property video" }]);
    setNewVideoUrl("");
    setNewVideoTitle("");
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.title || !form.description || !form.price || !form.address || !form.city || !form.state || !form.area) {
      setError("Please fill in all required fields (Title, Description, Price, Address, City, State, Area).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images: images.length > 0 ? images : undefined,
          videos: videos.length > 0 ? videos : undefined,
        }),
      });
      if (res.ok) {
        showToast("Property created successfully");
        setTimeout(() => router.push("/admin/properties"), 1000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create property");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 bg-green-600 text-white text-sm font-medium rounded-xl shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/properties"
          className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-secondary" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-secondary">Add New Property</h2>
          <p className="text-sm text-muted-foreground">Create a new property listing</p>
        </div>
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Create Property
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Title *</label>
            <input value={form.title} onChange={e => updateField("title", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="e.g. Modern Villa in East Legon" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description *</label>
            <textarea value={form.description} onChange={e => updateField("description", e.target.value)}
              rows={5} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm resize-none"
              placeholder="Detailed property description..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                <DollarSign className="w-3.5 h-3.5 inline mr-1" />Price (GH₵) *
              </label>
              <input type="number" value={form.price} onChange={e => updateField("price", e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                <Layers className="w-3.5 h-3.5 inline mr-1" />Property Type *
              </label>
              <select value={form.type} onChange={e => updateField("type", e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm">
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Status</label>
              <select value={form.status} onChange={e => updateField("status", e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Location
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Address *</label>
            <input value={form.address} onChange={e => updateField("address", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="Street address" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">City *</label>
              <input value={form.city} onChange={e => updateField("city", e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="e.g. Accra" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">State/Region *</label>
              <input value={form.state} onChange={e => updateField("state", e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="e.g. Greater Accra" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Zip Code</label>
              <input value={form.zipCode} onChange={e => updateField("zipCode", e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="e.g. 00233" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Country</label>
              <input value={form.country} onChange={e => updateField("country", e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="mt-4 p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-secondary">GPS Coordinates</span>
                <span className="text-xs text-muted-foreground">(helps buyers find exact location)</span>
              </div>
              <button type="button" onClick={getCurrentLocation} disabled={gpsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
                {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                {gpsLoading ? "Getting Location..." : "Get Current Location"}
              </button>
            </div>
            {gpsError && <p className="text-xs text-red-500 mb-2">{gpsError}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={e => updateField("latitude", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm" placeholder="e.g. 5.6037" />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={e => updateField("longitude", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm" placeholder="e.g. -0.1870" />
              </div>
            </div>
            {form.latitude && form.longitude && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location set: {parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
          <Maximize className="w-5 h-5 text-primary" /> Property Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              <Bed className="w-3.5 h-3.5 inline mr-1" />Bedrooms
            </label>
            <input type="number" min="0" value={form.bedrooms} onChange={e => updateField("bedrooms", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              <Bath className="w-3.5 h-3.5 inline mr-1" />Bathrooms
            </label>
            <input type="number" min="0" value={form.bathrooms} onChange={e => updateField("bathrooms", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              <Maximize className="w-3.5 h-3.5 inline mr-1" />Area (sqft) *
            </label>
            <input type="number" min="0" value={form.area} onChange={e => updateField("area", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />Year Built
            </label>
            <input type="number" value={form.yearBuilt} onChange={e => updateField("yearBuilt", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="e.g. 2024" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              <Car className="w-3.5 h-3.5 inline mr-1" />Parking
            </label>
            <input type="number" min="0" value={form.parking} onChange={e => updateField("parking", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 px-4 py-3 bg-muted border border-border rounded-xl cursor-pointer">
              <input type="checkbox" checked={form.furnished} onChange={e => updateField("furnished", e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary" />
              <span className="text-sm text-secondary">Furnished</span>
            </label>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => updateField("isFeatured", e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary" />
            <Star className={`w-4 h-4 ${form.isFeatured ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
            <span className="text-sm font-medium text-secondary">Featured Property</span>
          </label>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">Features & Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map(feature => (
            <button key={feature} onClick={() => toggleFeature(feature)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                form.features.includes(feature)
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-gray-200"
              }`}>
              {feature}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" /> Images
        </h3>
        <div className="flex gap-2 mb-4">
          <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm"
            placeholder="Paste image URL..." onKeyDown={e => e.key === "Enter" && addImage()} />
          <button onClick={addImage}
            className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-video">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded">Primary</span>
                )}
                <button onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length === 0 && (
          <p className="text-sm text-muted-foreground">No images added yet. The first image will be the primary image.</p>
        )}
      </div>

      {/* Videos & Virtual Tour */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" /> Videos & Virtual Tour
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              <Globe className="w-3.5 h-3.5 inline mr-1" />Virtual Tour URL
            </label>
            <input value={form.virtualTour} onChange={e => updateField("virtualTour", e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
              placeholder="e.g. https://my.matterport.com/show/?m=..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Property Videos</label>
            <div className="flex gap-2 mb-3">
              <input value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)}
                className="w-40 px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="Video title" />
              <input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm" placeholder="Video URL"
                onKeyDown={e => e.key === "Enter" && addVideo()} />
              <button onClick={addVideo}
                className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((vid, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <Video className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary truncate">{vid.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{vid.url}</p>
                    </div>
                    <button onClick={() => removeVideo(i)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href="/admin/properties"
          className="px-6 py-3 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm">
          Cancel
        </Link>
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Create Property
        </button>
      </div>
    </div>
  );
}
