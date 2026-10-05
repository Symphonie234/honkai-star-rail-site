import { relations, sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

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
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  arcOrder: integer("arc_order").notNull(),
  releaseVersion: text("release_version").notNull(),
  /** Theme color token name, e.g. "cyan" → var(--color-cyan). */
  color: text("color").notNull(),
  /** Position on the star map, in percent of the map's width/height. */
  mapX: integer("map_x").notNull(),
  mapY: integer("map_y").notNull(),
  /** Optional banner image path under /public (e.g. "/worlds/penacony.webp"); a CSS planet is drawn otherwise. */
  image: text("image"),
});

/** Story recap for a world, split into chapters so each can carry its own spoiler level. */
export const worldChapters = pgTable("world_chapters", {
  slug: text("slug").primaryKey(),
  worldSlug: text("world_slug").notNull().references(() => worlds.slug),
  sortOrder: integer("sort_order").notNull(),
  title: text("title").notNull(),
  /** Plain text; paragraphs separated by blank lines. */
  body: text("body").notNull(),
  spoilerVersion: text("spoiler_version"),
});

/** The god-like embodiments of concepts. Those with a playable Path link to it. */
export const aeons = pgTable("aeons", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  /** The concept the Aeon embodies, e.g. "Destruction". */
  concept: text("concept").notNull(),
  pathSlug: text("path_slug").references(() => paths.slug),
  /** Shown when the Aeon has no Path icon. */
  glyph: text("glyph").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const factions = pgTable("factions", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  /** The Aeon the faction is devoted to, if any. */
  aeonSlug: text("aeon_slug").references(() => aeons.slug),
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
  /**
   * Art variants, each a game character ID (see src/lib/images.ts). Usually one;
   * the Trailblazer has two (Stelle and Caelus) and the reader picks which to show.
   */
  art: jsonb("art").$type<ArtVariant[]>().notNull().default([]),
});

export type ArtVariant = { label: string; gameId: string };

/** Lore terms shown as hover definitions wherever they appear in lore text. */
export const glossaryTerms = pgTable("glossary_terms", {
  slug: text("slug").primaryKey(),
  term: text("term").notNull(),
  /** Other spellings that should link to this term (matched case-insensitively). */
  aliases: text("aliases").array().notNull().default(sql`'{}'::text[]`),
  definition: text("definition").notNull(),
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
export const factionsRelations = relations(factions, ({ one, many }) => ({
  characters: many(characters),
  aeon: one(aeons, { fields: [factions.aeonSlug], references: [aeons.slug] }),
}));

export const aeonsRelations = relations(aeons, ({ one, many }) => ({
  path: one(paths, { fields: [aeons.pathSlug], references: [paths.slug] }),
  factions: many(factions),
}));
export const worldsRelations = relations(worlds, ({ many }) => ({
  characters: many(characters),
  chapters: many(worldChapters),
}));

export const worldChaptersRelations = relations(worldChapters, ({ one }) => ({
  world: one(worlds, { fields: [worldChapters.worldSlug], references: [worlds.slug] }),
}));
