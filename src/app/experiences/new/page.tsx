"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SearchableSelect,
  type SearchResult,
} from "@/components/ui/searchable-select";
import { ImagePicker } from "@/components/ui/image-picker";
import {
  categorySliders,
  categoryLabels,
  categoryCreatorLabels,
  categoryExtraFields,
  SliderDefinition,
} from "@/lib/categories";
import { categoryIcons, StarIcon } from "@/lib/icons";

type Step = "category" | "details" | "ratings";

export default function NewExperiencePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<string>("");
  const [name, setName] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [searchImages, setSearchImages] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sliders: SliderDefinition[] = category
    ? categorySliders[category]
    : [];

  function handleCategorySelect(selectedCategory: string) {
    setCategory(selectedCategory);
    const initialRatings: Record<string, number> = {};
    categorySliders[selectedCategory].forEach((slider) => {
      initialRatings[slider.key] = 3;
    });
    setRatings(initialRatings);
    setStep("details");
  }

  function handleSearchResultSelect(result: SearchResult) {
    setName(result.name);
    if (result.creator) {
      setCreator(result.creator);
    }
    const allImages = [result.image, ...(result.images || [])].filter(
      (img): img is string => Boolean(img)
    );
    const uniqueImages = [...new Set(allImages)];
    setSearchImages(uniqueImages);
    if (uniqueImages.length > 0 && !coverImage) {
      setCoverImage(uniqueImages[0]);
    }
    if (result.metadata) {
      const mappedMetadata: Record<string, string> = {};
      if (result.metadata.developer) mappedMetadata.developer = result.metadata.developer;
      if (result.metadata.director) mappedMetadata.director = result.metadata.director;
      if (result.metadata.year) mappedMetadata.year = result.metadata.year;
      if (result.metadata.genre) mappedMetadata.genre = result.metadata.genre;
      if (result.metadata.album) mappedMetadata.album = result.metadata.album;
      if (result.metadata.platform) mappedMetadata.platform = result.metadata.platform;
      if (result.metadata.pages) mappedMetadata.pages = result.metadata.pages;
      setExtraFields((prev) => ({ ...prev, ...mappedMetadata }));
    }
    if (result.description) {
      setDescription(result.description);
    }
  }

  function handleRatingChange(key: string, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          name: name.trim(),
          creator: creator.trim() || null,
          description: description.trim() || null,
          coverImage,
          metadata: extraFields,
          ratings: sliders.map((slider) => ({
            key: slider.key,
            label: slider.label,
            description: slider.description,
            value: ratings[slider.key],
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create experience");
        return;
      }

      const experience = await res.json();
      router.push(`/experiences/${experience.slug}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "h-11 bg-transparent border-input text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg dark:bg-input/30";
  const btnPrimaryClass = "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold";
  const btnOutlineClass = "border-border text-foreground hover:bg-accent";

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">New Experience</h1>
        <p className="text-muted-foreground mb-8">Rate something you&apos;ve enjoyed</p>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "category" && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">What are you rating?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(categoryLabels).map(([key, label], index) => {
                      const IconComponent = categoryIcons[key] || categoryIcons.music;
                      const isLast = index === Object.keys(categoryLabels).length - 1;
                      return (
                        <button
                          key={key}
                          onClick={() => handleCategorySelect(key)}
                          className={`p-6 rounded-xl bg-muted border border-border hover:border-primary/30 transition-all duration-300 hover:bg-accent text-center group${isLast ? " col-span-2 justify-self-center w-1/2" : ""}`}
                        >
                          <IconComponent className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    {(() => {
                      const IconComponent = categoryIcons[category] || categoryIcons.music;
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                    <span>Tell us about it</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-muted-foreground">
                      {category === "music"
                        ? "Song / Album Name"
                        : category === "game"
                        ? "Game Title"
                        : category === "movie"
                        ? "Movie Title"
                        : category === "series"
                        ? "Series Title"
                        : "Book Title"}
                    </Label>
                    <SearchableSelect
                      category={category}
                      value={name}
                      onChange={setName}
                      onResultSelect={handleSearchResultSelect}
                      placeholder={`e.g., ${
                        category === "music"
                          ? "Bohemian Rhapsody"
                          : category === "game"
                          ? "The Witcher 3"
                          : category === "movie"
                          ? "Inception"
                          : category === "series"
                          ? "Breaking Bad"
                          : "Dune"
                      }`}
                    />
                    <p className="text-xs text-muted-foreground">Search or enter manually</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Cover Image</Label>
                    <ImagePicker
                      category={category}
                      value={coverImage}
                      onChange={setCoverImage}
                      searchImages={searchImages}
                      searchQuery={
                        category === "game"
                          ? name
                          : category === "music"
                          ? `${name} ${creator}`.trim()
                          : category === "book"
                          ? `${name} by ${creator}`.trim()
                          : name
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creator" className="text-muted-foreground">
                      {categoryCreatorLabels[category]}
                    </Label>
                    <Input
                      id="creator"
                      placeholder={
                        category === "music"
                          ? "e.g., Queen"
                          : category === "game"
                          ? "e.g., CD Projekt Red"
                          : category === "movie"
                          ? "e.g., Christopher Nolan"
                          : category === "series"
                          ? "e.g., Vince Gilligan"
                          : "e.g., Frank Herbert"
                      }
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {categoryExtraFields[category]?.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key} className="text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        id={field.key}
                        placeholder={field.placeholder}
                        value={extraFields[field.key] || ""}
                        onChange={(e) =>
                          setExtraFields((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-muted-foreground">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="What did you think about it?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${inputClass} min-h-[100px]`}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep("category")} className={btnOutlineClass}>
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (!name.trim()) {
                          setError("Please enter a name");
                          return;
                        }
                        setError("");
                        setStep("ratings");
                      }}
                      className={`flex-1 ${btnPrimaryClass}`}
                    >
                      Continue to Ratings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "ratings" && (
            <motion.div
              key="ratings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    {(() => {
                      const IconComponent = categoryIcons[category] || categoryIcons.music;
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                    <span>Rate {name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {sliders.map((slider) => (
                    <div key={slider.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-foreground">{slider.label}</Label>
                          <p className="text-xs text-muted-foreground mt-1">{slider.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(slider.key, star)}
                              className="transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <StarIcon filled={star <= ratings[slider.key]} className="w-7 h-7" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep("details")} className={btnOutlineClass}>
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className={`flex-1 ${btnPrimaryClass}`}>
                      {loading ? "Creating..." : "Create Experience"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
