"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { categoryLabels, categoryCreatorLabels, categoryGradients } from "@/lib/categories";
import { categoryIcons, RatingStars } from "@/lib/icons";

type Experience = {
  id: string;
  category: string;
  name: string;
  creator: string | null;
  slug: string;
  description: string | null;
  coverImage: string | null;
  averageScore: number;
  createdAt: string;
};

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchExperiences();
  }, []);

  async function fetchExperiences() {
    try {
      const res = await fetch("/api/experiences");
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredExperiences = experiences
    .filter(
      (exp) => categoryFilter === "all" || exp.category === categoryFilter
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "highest":
          return b.averageScore - a.averageScore;
        case "lowest":
          return a.averageScore - b.averageScore;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="h-10 w-full sm:w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full sm:w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl bg-card border border-border animate-pulse overflow-hidden">
              <div className="h-48 bg-muted/50" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-32 bg-muted/50 rounded" />
                <div className="h-4 w-24 bg-muted/30 rounded" />
                <div className="h-3 w-full bg-muted/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Experiences</h1>
          <p className="text-muted-foreground mt-1">
            {experiences.length} experience{experiences.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/experiences/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            + New Experience
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
              categoryFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            All
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                categoryFilter === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort</span>
          <div className="flex bg-muted rounded-lg p-1 overflow-x-auto">
            {[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "highest", label: "Top" },
              { value: "lowest", label: "Low" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  sortBy === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredExperiences.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-lg mb-4">
            {experiences.length === 0
              ? "No experiences yet. Start by adding one!"
              : "No experiences match your filters."}
          </p>
          {experiences.length === 0 && (
            <Link href="/experiences/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                + Add Your First Experience
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredExperiences.map((experience, index) => {
              const IconComponent = categoryIcons[experience.category] || categoryIcons.music;
              return (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <Link href={`/experiences/${experience.slug}`} className="h-full block">
                    <div className="rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group h-full flex flex-col overflow-hidden shadow-sm">
                      <div className="relative h-48 w-full">
                        {experience.coverImage ? (
                          <img
                            src={experience.coverImage}
                            alt={experience.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-br ${
                              categoryGradients[experience.category] ||
                              categoryGradients.music
                            } flex items-center justify-center`}
                          >
                            <IconComponent className="w-12 h-12 opacity-20 text-white" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-white" />
                          <span className="text-xs font-medium text-white uppercase tracking-wider bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                            {categoryLabels[experience.category]}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {experience.name}
                        </h3>
                        {experience.creator && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {categoryCreatorLabels[experience.category]}:{" "}
                            {experience.creator}
                          </p>
                        )}
                        {experience.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {experience.description}
                          </p>
                        )}
                        {!experience.description && <div className="flex-1" />}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <RatingStars value={experience.averageScore} />
                            <span className="text-sm text-muted-foreground">
                              {experience.averageScore.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(experience.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
