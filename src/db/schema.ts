import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  real,
  pgEnum,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categoryEnum = pgEnum("category", [
  "music",
  "game",
  "movie",
  "book",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const experiences = pgTable("experiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category: categoryEnum("category").notNull(),
  name: text("name").notNull(),
  creator: text("creator"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverImage: text("cover_image"),
  metadata: jsonb("metadata").default({}).notNull(),
  averageScore: real("average_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  sliderKey: text("slider_key").notNull(),
  sliderLabel: text("slider_label").notNull(),
  sliderDescription: text("slider_description").notNull(),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revisits = pgTable("revisits", {
  id: uuid("id").defaultRandom().primaryKey(),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  notes: text("notes"),
  isOriginal: boolean("is_original").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revisitRatings = pgTable("revisit_ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  revisitId: uuid("revisit_id")
    .notNull()
    .references(() => revisits.id, { onDelete: "cascade" }),
  sliderKey: text("slider_key").notNull(),
  value: integer("value").notNull(),
});

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experiences.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  experiences: many(experiences),
}));

export const experiencesRelations = relations(experiences, ({ one, many }) => ({
  user: one(users, {
    fields: [experiences.userId],
    references: [users.id],
  }),
  ratings: many(ratings),
  revisits: many(revisits),
  images: many(images),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  experience: one(experiences, {
    fields: [ratings.experienceId],
    references: [experiences.id],
  }),
}));

export const revisitsRelations = relations(revisits, ({ one, many }) => ({
  experience: one(experiences, {
    fields: [revisits.experienceId],
    references: [experiences.id],
  }),
  ratings: many(revisitRatings),
}));

export const revisitRatingsRelations = relations(revisitRatings, ({ one }) => ({
  revisit: one(revisits, {
    fields: [revisitRatings.revisitId],
    references: [revisits.id],
  }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  experience: one(experiences, {
    fields: [images.experienceId],
    references: [experiences.id],
  }),
}));
