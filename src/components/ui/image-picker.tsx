"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MusicIcon, GameIcon, MovieIcon, BookIcon } from "@/lib/icons";

type ImagePickerProps = {
  category: string;
  value: string | null;
  onChange: (value: string | null) => void;
  searchImages?: string[];
  searchQuery?: string;
  currentImage?: string | null;
  className?: string;
};

const categoryGradients: Record<string, string> = {
  music: "bg-gradient-to-br from-purple-600 via-pink-500 to-red-500",
  game: "bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500",
  movie: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600",
  book: "bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  music: MusicIcon,
  game: GameIcon,
  movie: MovieIcon,
  book: BookIcon,
};

type ImageSource = "gradient" | "current" | "search" | "web" | "upload";

export function ImagePicker({
  category,
  value,
  onChange,
  searchImages = [],
  searchQuery = "",
  currentImage = null,
  className,
}: ImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ImageSource>(currentImage ? "current" : "gradient");
  const [webImages, setWebImages] = useState<string[]>([]);
  const [loadingWeb, setLoadingWeb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uniqueSearchImages = [...new Set(searchImages)].filter(Boolean);
  const hasSearchImages = uniqueSearchImages.length > 0;

  const IconComponent = iconMap[category] || MusicIcon;

  useEffect(() => {
    if (activeTab === "web" && searchQuery.length >= 2) {
      fetchWebImages();
    }
  }, [searchQuery, activeTab]);

  async function fetchWebImages() {
    if (!searchQuery || loadingWeb) return;
    setLoadingWeb(true);
    try {
      const res = await fetch(
        `/api/search/images/duckduckgo?q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        const urls = data.items?.map((item: { url: string }) => item.url) || [];
        setWebImages(urls);
      }
    } catch (error) {
      console.error("Web search error:", error);
    } finally {
      setLoadingWeb(false);
    }
  }

  function handleTabChange(tab: ImageSource) {
    setActiveTab(tab);
    setCarouselIndex(0);

    if (tab === "current" && currentImage) {
      onChange(currentImage);
    } else if (tab === "web" && webImages.length === 0) {
      fetchWebImages();
    }

    if (tab === "gradient") {
      onChange(null);
    } else if (tab === "search" && uniqueSearchImages.length > 0) {
      onChange(uniqueSearchImages[0]);
    } else if (tab === "web" && webImages.length > 0) {
      onChange(webImages[0]);
    }
  }

  function getCurrentImages(): string[] {
    switch (activeTab) {
      case "search":
        return uniqueSearchImages;
      case "web":
        return webImages;
      default:
        return [];
    }
  }

  const currentImages = getCurrentImages();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        setActiveTab("upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  }

  function handleNextImage() {
    if (currentImages.length === 0) return;
    const next = (carouselIndex + 1) % currentImages.length;
    setCarouselIndex(next);
    onChange(currentImages[next]);
  }

  function handlePrevImage() {
    if (currentImages.length === 0) return;
    const next = (carouselIndex - 1 + currentImages.length) % currentImages.length;
    setCarouselIndex(next);
    onChange(currentImages[next]);
  }

  const tabs: { id: ImageSource; label: string }[] = [
    ...(currentImage ? [{ id: "current" as ImageSource, label: "Current" }] : []),
    { id: "gradient", label: "None" },
    ...(hasSearchImages ? [{ id: "search" as ImageSource, label: "Source" }] : []),
    { id: "web", label: "Web Search" },
    { id: "upload", label: "Upload" },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-1.5 bg-muted rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {activeTab === "gradient" && (
          <motion.div
            key="gradient"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "w-full aspect-[4/3] rounded-xl flex items-center justify-center",
              categoryGradients[category] || categoryGradients.music
            )}
          >
            <IconComponent className="w-16 h-16 opacity-30 text-white" />
          </motion.div>
        )}

        {activeTab === "current" && currentImage && (
          <motion.div
            key="current"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full aspect-[4/3] rounded-xl overflow-hidden"
          >
            <img
              src={currentImage}
              alt="Current"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {activeTab === "web" && (
          <motion.div
            key="web"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {loadingWeb ? (
              <div className="w-full aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
              </div>
            ) : webImages.length === 0 ? (
              <div className="w-full aspect-[4/3] rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                No results found
              </div>
            ) : (
              <ImageCarousel
                images={webImages}
                index={carouselIndex}
                value={value}
                onIndexChange={setCarouselIndex}
                onSelect={onChange}
              />
            )}
          </motion.div>
        )}

        {activeTab === "search" && hasSearchImages && (
          <motion.div
            key="search"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ImageCarousel
              images={uniqueSearchImages}
              index={carouselIndex}
              value={value}
              onIndexChange={setCarouselIndex}
              onSelect={onChange}
            />
          </motion.div>
        )}

        {activeTab === "upload" && value && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full aspect-[4/3] rounded-xl overflow-hidden"
          >
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {activeTab === "upload" && !value && (
          <motion.div
            key="upload-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <svg className="w-10 h-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-sm text-muted-foreground">Click to upload</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "upload" && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-accent hover:text-foreground transition-colors"
        >
          {uploading ? "Uploading..." : "Choose File"}
        </button>
      )}
    </div>
  );
}

function ImageCarousel({
  images,
  index,
  value,
  onIndexChange,
  onSelect,
}: {
  images: string[];
  index: number;
  value: string | null;
  onIndexChange: (i: number) => void;
  onSelect: (url: string) => void;
}) {
  function handleNext() {
    const next = (index + 1) % images.length;
    onIndexChange(next);
    onSelect(images[next]);
  }

  function handlePrev() {
    const next = (index - 1 + images.length) % images.length;
    onIndexChange(next);
    onSelect(images[next]);
  }

  return (
    <div>
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            alt="Selected"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </>
        )}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onIndexChange(i);
                onSelect(images[i]);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === index ? "bg-amber-400" : "bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onIndexChange(i);
                onSelect(img);
              }}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                img === value ? "border-primary" : "border-border hover:border-muted-foreground"
              )}
            >
              <img src={img} alt={`Option ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
