"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2, MapPin, DollarSign, Bed, Bath, Maximize,
  Car, Calendar, Upload, Plus, X, Loader2, CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

const propertyTypes = [
  { label: "House", value: "HOUSE" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Condo", value: "CONDO" },
  { label: "Townhouse", value: "TOWNHOUSE" },
  { label: "Villa", value: "VILLA" },
  { label: "Land", value: "LAND" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Office", value: "OFFICE" },
];

const featureOptions = [
  "Swimming Pool", "Garden", "Garage", "Security", "Air Conditioning",
  "Solar Panels", "Gym", "Balcony", "Rooftop", "Smart Home",
  "Elevator", "Storage Room", "Laundry Room", "CCTV", "Generator",
  "Borehole", "Boys Quarters", "Gate House",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ghana",
    type: "HOUSE",
    bedrooms: "3",
    bathrooms: "2",
    area: "",
    yearBuilt: "",
    parking: "1",
    furnished: false,
    features: [] as string[],
    virtualTour: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const images = imageUrls
        .filter((url) => url.trim())
        .map((url, i) => ({ url, alt: formData.title, isPrimary: i === 0 }));

      const videos = videoUrls
        .filter((url) => url.trim())
        .map((url) => ({ url, title: "", isVirtual: false }));

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, images, videos }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/seller/properties"), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create property");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-20 text-center"
      >
        <div className="bg-green-50 rounded-2xl p-12 border border-green-200">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700">Property Submitted!</h2>
          <p className="mt-2 text-green-600">
            Your property has been submitted for review. Our team will verify and approve it shortly.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-secondary mb-1">Add New Property</h2>
        <p className="text-muted-foreground mb-8">Fill in the details below to list your property on Atopary</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 border border-border space-y-5">
            <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Property Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Modern 4-Bedroom Villa in East Legon"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe your property in detail..."
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Property Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
                >
                  {propertyTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Price (GHS) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 bg-muted border border-border rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-6 border border-border space-y-5">
            <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Location
            </h3>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Address *</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Street address"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">City *</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Accra"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">State/Region *</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Greater Accra"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Zip Code *</label>
                <input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 00233"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-2xl p-6 border border-border space-y-5">
            <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
              <Maximize className="w-5 h-5 text-primary" /> Property Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Bedrooms</label>
                <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} min="0"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Bathrooms</label>
                <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} min="0"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Area (m²) *</label>
                <input name="area" type="number" value={formData.area} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Parking</label>
                <input name="parking" type="number" value={formData.parking} onChange={handleChange} min="0"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Year Built</label>
                <input name="yearBuilt" type="number" value={formData.yearBuilt} onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="furnished"
                name="furnished"
                checked={formData.furnished}
                onChange={handleChange}
                className="w-4 h-4 text-primary rounded border-gray-300"
              />
              <label htmlFor="furnished" className="text-sm font-medium text-secondary">Furnished</label>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl p-6 border border-border space-y-5">
            <h3 className="text-lg font-bold text-secondary">Features & Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.features.includes(feature)
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl p-6 border border-border space-y-5">
            <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Property Images
            </h3>
            <p className="text-sm text-muted-foreground">Upload images or add image URLs. The first image will be the primary image.</p>

            {/* Upload Dropzone */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors">
              <UploadDropzone
                endpoint="propertyImage"
                onClientUploadComplete={(res) => {
                  if (res) {
                    const newUrls = res.map((file) => file.ufsUrl);
                    setImageUrls((prev) => [...prev.filter((u) => u.trim()), ...newUrls]);
                  }
                }}
                onUploadError={(error: Error) => {
                  setError(`Upload failed: ${error.message}`);
                }}
              />
            </div>

            {/* Uploaded & URL images */}
            {imageUrls.filter((u) => u.trim()).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageUrls.filter((u) => u.trim()).map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded">Primary</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Manual URL input */}
            <details className="text-sm">
              <summary className="text-muted-foreground cursor-pointer hover:text-primary">Or add image URLs manually</summary>
              <div className="mt-3 space-y-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...imageUrls];
                        newUrls[index] = e.target.value;
                        setImageUrls(newUrls);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setImageUrls([...imageUrls, ""])}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add another image URL
                </button>
              </div>
            </details>
          </div>

          {/* Videos & Virtual Tour */}
          <div className="bg-white rounded-2xl p-6 border border-border space-y-5">
            <h3 className="text-lg font-bold text-secondary">Videos & Virtual Tour</h3>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Virtual Tour URL</label>
              <input
                name="virtualTour"
                value={formData.virtualTour}
                onChange={handleChange}
                placeholder="https://my.matterport.com/show/?m=..."
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Video URLs</label>
              {videoUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...videoUrls];
                      newUrls[index] = e.target.value;
                      setVideoUrls(newUrls);
                    }}
                    placeholder="https://youtube.com/embed/..."
                    className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setVideoUrls(videoUrls.filter((_, i) => i !== index))}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setVideoUrls([...videoUrls, ""])}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Plus className="w-4 h-4" /> Add video
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 bg-gray-100 text-secondary rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Property for Review"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
