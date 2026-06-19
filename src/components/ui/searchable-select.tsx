"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { categoryIcons } from "@/lib/icons";

export type SearchResult = {
  id: string;
  name: string;
  creator?: string;
  image?: string | null;
  images?: string[];
  metadata?: Record<string, string>;
  description?: string;
};

type SearchableSelectProps = {
  category: string;
  value: string;
  onChange: (value: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
};

export function SearchableSelect({
  category,
  value,
  onChange,
  onResultSelect,
  placeholder = "Search or type...",
  className,
}: SearchableSelectProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/search/${category}?q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.items || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchResults(value);
      }, 500);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, fetchResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleResultClick(result: SearchResult) {
    onChange(result.name);
    onResultSelect?.(result);
    setShowDropdown(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
    setShowDropdown(true);
  }

  function handleInputFocus() {
    if (value.length >= 2 && results.length > 0) {
      setShowDropdown(true);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            "h-11 bg-transparent border-input text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg dark:bg-input/30",
            className
          )}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                >
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      {(() => {
                        const IconComponent = categoryIcons[category] || categoryIcons.music;
                        return <IconComponent className="w-5 h-5 text-muted-foreground" />;
                      })()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.name}
                    </p>
                    {result.creator && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.creator}
                      </p>
                    )}
                    {result.metadata &&
                      Object.values(result.metadata).some((v) => v) && (
                        <p className="text-xs text-muted-foreground/60 truncate">
                          {Object.values(result.metadata)
                            .filter((v) => v)
                            .slice(0, 2)
                            .join(" · ")}
                        </p>
                      )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
