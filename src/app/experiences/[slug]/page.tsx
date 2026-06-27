"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePicker } from "@/components/ui/image-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react";
import {
  categorySliders,
  categoryLabels,
  categoryCreatorLabels,
  categoryGradients,
  SliderDefinition,
} from "@/lib/categories";
import { categoryIcons, RatingStars, StarIcon } from "@/lib/icons";

type Experience = {
  id: string;
  category: string;
  name: string;
  creator: string | null;
  slug: string;
  description: string | null;
  coverImage: string | null;
  metadata: Record<string, string>;
  averageScore: number;
  createdAt: string;
};

const creatorKeys: Record<string, string> = {
  game: "developer",
  movie: "director",
  music: "artist",
  book: "author",
  series: "network",
};

function filterMetadata(metadata: Record<string, string>, category: string) {
  const skip = creatorKeys[category];
  return Object.entries(metadata).filter(([key]) => key !== skip);
}

type Rating = {
  id: string;
  sliderKey: string;
  sliderLabel: string;
  sliderDescription: string;
  value: number;
};

type Revisit = {
  id: string;
  notes: string | null;
  isOriginal: boolean;
  createdAt: string;
  ratings: { sliderKey: string; value: number }[];
};

export default function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [revisits, setRevisits] = useState<Revisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRevisitForm, setShowRevisitForm] = useState(false);
  const [revisitNotes, setRevisitNotes] = useState("");
  const [revisitRatings, setRevisitRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editCreator, setEditCreator] = useState("");
  const [editMetadata, setEditMetadata] = useState<Record<string, string>>({});
  const [searchImages, setSearchImages] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState("");

  const sliders: SliderDefinition[] = experience
    ? categorySliders[experience.category]
    : [];

  useEffect(() => {
    fetchExperience();
  }, [slug]);

  async function fetchExperience() {
    try {
      const res = await fetch(`/api/experiences/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setExperience(data.experience);
        setRatings(data.ratings);
        setRevisits(data.revisits);

        const initialRatings: Record<string, number> = {};
        data.ratings.forEach((rating: { sliderKey: string; value: number }) => {
          initialRatings[rating.sliderKey] = rating.value;
        });
        setRevisitRatings(initialRatings);
      } else {
        router.push("/experiences");
      }
    } catch (error) {
      console.error("Failed to fetch experience:", error);
      router.push("/experiences");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevisit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/experiences/${slug}/revisit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: revisitNotes.trim() || null,
          ratings: sliders.map((slider) => ({
            key: slider.key,
            value: revisitRatings[slider.key],
          })),
        }),
      });

      if (res.ok) {
        setShowRevisitForm(false);
        setRevisitNotes("");
        fetchExperience();
      } else {
        setError("Failed to save revisit");
      }
    } catch {
      setError("Failed to save revisit");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/experiences/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/experiences");
      } else {
        setError("Failed to delete experience");
      }
    } catch {
      setError("Failed to delete experience");
    } finally {
      setDeleting(false);
    }
  }

  function startEditing() {
    setEditImage(experience?.coverImage || null);
    setEditDescription(experience?.description || "");
    setEditName(experience?.name || "");
    setEditCreator(experience?.creator || "");
    setEditMetadata(experience?.metadata || {});
    setSearchImages([]);
    setEditing(true);

    if (experience) {
      fetch(`/api/search/${experience.category}?q=${encodeURIComponent(experience.name)}`)
        .then((res) => res.json())
        .then((data) => {
          const images: string[] = (data.items || [])
            .flatMap((item: { image?: string; images?: string[] }) => [item.image, ...(item.images || [])])
            .filter((img: string | undefined): img is string => Boolean(img));
          setSearchImages([...new Set(images)]);
        })
        .catch(() => {});
    }
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/experiences/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          creator: editCreator.trim() || null,
          coverImage: editImage,
          description: editDescription.trim() || null,
          metadata: editMetadata,
        }),
      });

      if (res.ok) {
        setEditing(false);
        fetchExperience();
      } else {
        setError("Failed to save changes");
      }
    } catch {
      setError("Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-2 ml-auto">
            <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            <div className="h-9 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="relative h-80 w-full rounded-xl bg-muted animate-pulse mb-6" />
        <div className="h-5 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="flex gap-3 mb-4">
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-4" />
        <div className="flex items-center gap-4 mb-8">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="h-6 w-20 bg-muted rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-28 bg-muted rounded animate-pulse mb-1" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-28 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!experience) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/experiences")}
            className="border-border text-foreground hover:bg-accent"
          >
            Back
          </Button>
          <div className="flex items-center gap-3 ml-auto">
            {!editing && (
              <>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                  />
                }
              >
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400">
                    <Trash2Icon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{experience?.name}&quot;? This
                    will permanently remove all ratings, journal entries, and
                    images. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    variant="destructive"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
                <Button
                  onClick={startEditing}
                  variant="outline"
                  className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50"
                >
                  Edit
                </Button>
              </>
            )}
            {editing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="border-border text-foreground hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="mb-8">
          {editing ? (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Cover Image</p>
              <ImagePicker
                category={experience.category}
                value={editImage}
                onChange={setEditImage}
                searchImages={searchImages}
                searchQuery={
                  experience.category === "game"
                    ? experience.name
                    : experience.category === "music"
                    ? `${experience.name} ${experience.creator || ""}`.trim()
                    : experience.category === "book"
                    ? `${experience.name} by ${experience.creator || ""}`.trim()
                    : experience.name
                }
                currentImage={experience.coverImage}
              />
            </div>
          ) : (
            <div className="relative h-80 w-full rounded-xl overflow-hidden mb-6">
              {experience.coverImage ? (
                <img
                  src={experience.coverImage}
                  alt={experience.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    categoryGradients[experience.category] || categoryGradients.music
                  } flex items-center justify-center`}
                >
                  {(() => {
                    const IconComponent = categoryIcons[experience.category] || categoryIcons.music;
                    return <IconComponent className="w-24 h-24 opacity-20 text-white" />;
                  })()}
                </div>
              )}
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const IconComponent = categoryIcons[experience.category] || categoryIcons.music;
                    return <IconComponent className="w-5 h-5 text-white" />;
                  })()}
                  <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                    {categoryLabels[experience.category]}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{experience.name}</h1>
              </div>
            </div>
          )}

          {editing ? (
            <div className="space-y-3 mb-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  {categoryCreatorLabels[experience.category]}
                </label>
                <Input
                  value={editCreator}
                  onChange={(e) => setEditCreator(e.target.value)}
                  placeholder={categoryCreatorLabels[experience.category]}
                  className="h-10"
                />
              </div>
              {Object.keys(filterMetadata(editMetadata, experience.category)).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filterMetadata(editMetadata, experience.category)
                    .map(([key]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm text-muted-foreground">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <Input
                        value={editMetadata[key] || ""}
                        onChange={(e) =>
                          setEditMetadata((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="h-10"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {experience.creator && (
                <p className="text-lg text-muted-foreground mb-2">
                  {categoryCreatorLabels[experience.category]}: {experience.creator}
                </p>
              )}
              {experience.metadata && filterMetadata(experience.metadata, experience.category).length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {filterMetadata(experience.metadata, experience.category)
                    .map(([key, value]) =>
                    value ? (
                      <span
                        key={key}
                        className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </>
          )}
          {editing ? (
            <div className="space-y-2 mb-4">
              <label className="text-sm text-muted-foreground">Description</label>
              <AutoResizeTextarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="What did you think about it?"
                minRows={3}
              />
            </div>
          ) : experience.description ? (
            <p className="text-muted-foreground text-lg whitespace-pre-wrap">{experience.description}</p>
          ) : null}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <RatingStars value={experience.averageScore} size="md" />
              <span className="text-foreground font-medium">
                {experience.averageScore.toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">
              {new Date(experience.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ratings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">{rating.sliderLabel}</p>
                    <p className="text-xs text-muted-foreground">{rating.sliderDescription}</p>
                  </div>
                  <RatingStars value={rating.value} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Journal</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowRevisitForm(!showRevisitForm)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {showRevisitForm ? "Cancel" : "+ Add Revisit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showRevisitForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6 p-4 rounded-lg bg-muted border border-border"
                >
                  <h4 className="text-foreground font-medium mb-3">Revisit Notes</h4>
                  <Textarea
                    placeholder="How do you feel about it now?"
                    value={revisitNotes}
                    onChange={(e) => setRevisitNotes(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground mb-4"
                  />
                  <h4 className="text-foreground font-medium mb-3">Updated Ratings</h4>
                  <div className="space-y-3 mb-4">
                    {sliders.map((slider) => (
                      <div key={slider.key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{slider.label}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                setRevisitRatings((prev) => ({
                                  ...prev,
                                  [slider.key]: star,
                                }))
                              }
                              className="transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <StarIcon filled={star <= revisitRatings[slider.key]} className="w-5 h-5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleRevisit}
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {submitting ? "Saving..." : "Save Revisit"}
                  </Button>
                </motion.div>
              )}

              {revisits.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No revisits yet. Come back later to re-rate!
                </p>
              ) : (
                <div className="space-y-4">
                  {revisits.map((revisit) => (
                    <div
                      key={revisit.id}
                      className={`p-4 rounded-lg border ${
                        revisit.isOriginal
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(revisit.createdAt).toLocaleDateString()}
                        </p>
                        {revisit.isOriginal && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Original
                          </span>
                        )}
                      </div>
                      {revisit.notes && (
                        <p className="text-foreground mb-3">{revisit.notes}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {revisit.ratings.map((rating) => {
                          const slider = sliders.find((s) => s.key === rating.sliderKey);
                          return slider ? (
                            <span
                              key={rating.sliderKey}
                              className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground flex items-center gap-1"
                            >
                              {slider.label}:
                              <RatingStars value={rating.value} size="sm" />
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </motion.div>
    </div>
  );
}
