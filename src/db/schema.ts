import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

/*
 * Slugs are primary keys: they're stable, human-readable, and double as URL segments.
 *
 * Versions ("1.0", "2.3") are stored as text. `spoilerVersion` marks content that
 * reveals story from that version onward; null means spoiler-free. The spoiler
 * system (Phase 3) compares it against the reader's progress.
 */

export const paths = pgTable("paths", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  aeon: text("aeon").notNull(),
  blurb: text("blurb").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const elements = pgTable("elements", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const worlds = pgTable("worlds", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  arcOrder: integer("arc_order").notNull(),
  releaseVersion: text("release_version").notNull(),
});

export const factions = pgTable("factions", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
});

export const characters = pgTable("characters", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  rarity: integer("rarity").notNull(),
  elementSlug: text("element_slug").notNull().references(() => elements.slug),
  pathSlug: text("path_slug").notNull().references(() => paths.slug),
  factionSlug: text("faction_slug").references(() => factions.slug),
  worldSlug: text("world_slug").references(() => worlds.slug),
  bio: text("bio").notNull(),
  releaseVersion: text("release_version").notNull(),
  spoilerVersion: text("spoiler_version"),
});

export const charactersRelations = relations(characters, ({ one }) => ({
  element: one(elements, { fields: [characters.elementSlug], references: [elements.slug] }),
  path: one(paths, { fields: [characters.pathSlug], references: [paths.slug] }),
  faction: one(factions, { fields: [characters.factionSlug], references: [factions.slug] }),
  world: one(worlds, { fields: [characters.worldSlug], references: [worlds.slug] }),
}));

export const pathsRelations = relations(paths, ({ many }) => ({ characters: many(characters) }));
export const elementsRelations = relations(elements, ({ many }) => ({ characters: many(characters) }));
export const factionsRelations = relations(factions, ({ many }) => ({ characters: many(characters) }));
export const worldsRelations = relations(worlds, ({ many }) => ({ characters: many(characters) }));
