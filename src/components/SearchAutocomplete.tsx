"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Building2, Loader2 } from "lucide-react";

interface SearchSuggestion {
  type: "property" | "city" | "location";
  text: string;
  data?: any;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search by location, property name...",
  className = ""
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    
    // Debounce suggestions fetch
    const timeoutId = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);

    // Clear previous timeout
    return () => clearTimeout(timeoutId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          onChange(selected.text);
          setIsOpen(false);
          setSelectedIndex(-1);
          onSearch(selected.text);
        } else {
          onSearch(value);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearch(suggestion.text);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "property":
        return <Building2 className="w-4 h-4" />;
      case "city":
        return <MapPin className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.length >= 2) {
              fetchSuggestions(value);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                  index === selectedIndex
                    ? "bg-primary text-white"
                    : "hover:bg-muted text-secondary"
                }`}
              >
                <div className="flex-shrink-0">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{suggestion.text}</div>
                  {suggestion.data && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {suggestion.type === "property" && (
                        <>
                          {suggestion.data.city && <span>{suggestion.data.city}</span>}
                          {suggestion.data.price && (
                            <span className="text-primary font-semibold">
                              {new Intl.NumberFormat("en-GH", {
                                style: "currency",
                                currency: "GHS",
                                minimumFractionDigits: 0,
                              }).format(suggestion.data.price)}
                            </span>
                          )}
                        </>
                      )}
                      {suggestion.type === "city" && (
                        <span className="text-xs text-primary">City</span>
                      )}
                      {suggestion.type === "location" && (
                        <span className="text-xs text-primary">Location</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
