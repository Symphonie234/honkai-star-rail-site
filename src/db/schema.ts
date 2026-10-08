import { relations, sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { Kit } from "../lib/kit";

/*
 * Slugs are primary keys: they're stable, human-readable, and double as URL segments.
 *
 * Versions ("1.0", "2.3") are stored as text. Two kinds, compared against the
 * reader's story-progress setting:
 *  - when something entered the game (releaseVersion / introducedVersion / version):
 *    "view as of vX" hides anything newer;
 *  - `spoilerVersion`: what it gives away; hidden until the reader's progress
 *    covers it. Null means spoiler-free.
 */

/** Game versions, with their official titles. Characters reference their release version. */
export const versions = pgTable("versions", {
  version: text("version").primaryKey(),
  title: text("title").notNull(),
  /** ISO date, e.g. "2025-04-09". */
  releaseDate: text("release_date").notNull(),
  major: integer("major").notNull(),
  minor: integer("minor").notNull(),
});

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
  /** The update whose story this chapter covers. */
  version: text("version").notNull().references(() => versions.version),
  spoilerVersion: text("spoiler_version"),
});

/** The god-like embodiments of concepts. Those with a playable Path link to it. */
export const aeons = pgTable("aeons", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  /** The concept the Aeon embodies, e.g. "Destruction". */
  concept: text("concept").notNull(),
  pathSlug: text("path_slug").references(() => paths.slug),
  /** When the story first brings the Aeon up. */
  introducedVersion: text("introduced_version").notNull().references(() => versions.version),
  /** Shown when the Aeon has no Path icon. */
  glyph: text("glyph").notNull(),
  /** Titles the Aeon is known by, e.g. "Amber Lord". */
  epithets: text("epithets").array().notNull().default(sql`'{}'::text[]`),
  /** Official art under /public, if any. */
  image: text("image"),
  /** One-paragraph summary; the full lore lives in aeon_lore. */
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

/** An Aeon's lore, in sections so each can carry its own spoiler level. */
export const aeonLore = pgTable("aeon_lore", {
  slug: text("slug").primaryKey(),
  aeonSlug: text("aeon_slug").notNull().references(() => aeons.slug),
  sortOrder: integer("sort_order").notNull(),
  title: text("title").notNull(),
  /** Plain text; paragraphs separated by blank lines. */
  body: text("body").notNull(),
  /** When this part of the lore enters the story. */
  version: text("version").notNull().references(() => versions.version),
  spoilerVersion: text("spoiler_version"),
});

export const factions = pgTable("factions", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  /** The faction's first story appearance. */
  introducedVersion: text("introduced_version").notNull().references(() => versions.version),
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
  releaseVersion: text("release_version").notNull().references(() => versions.version),
  /** ISO date the character was released. */
  releaseDate: text("release_date").notNull(),
  spoilerVersion: text("spoiler_version"),
  /** Signature Light Cone, if the character has one. */
  lightCone: text("light_cone"),
  /** English voice actor(s). */
  voiceEn: text("voice_en"),
  /**
   * Art variants, each a game character ID (see src/lib/images.ts). Usually one;
   * the Trailblazer has two (Stelle and Caelus) and the reader picks which to show.
   */
  art: jsonb("art").$type<ArtVariant[]>().notNull().default([]),
});

export type ArtVariant = { label: string; gameId: string };

/** A character's full kit (skills, Traces, Eidolons, stats), imported from game data. */
export const characterKits = pgTable("character_kits", {
  characterSlug: text("character_slug").primaryKey().references(() => characters.slug),
  kit: jsonb("kit").$type<Kit>().notNull(),
});

/** Upgrade materials (ascension, Traces), imported from game data. */
export const materials = pgTable("materials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  rarity: integer("rarity").notNull(),
  type: text("type").notNull(),
  subType: text("sub_type").notNull(),
  /** Game icon path, e.g. "icon/item/110251.png" (see gameIcon). */
  icon: text("icon").notNull(),
  /** Where to farm or obtain it. */
  sources: text("sources").array().notNull().default(sql`'{}'::text[]`),
});

/** Lore terms shown as hover definitions wherever they appear in lore text. */
export const glossaryTerms = pgTable("glossary_terms", {
  slug: text("slug").primaryKey(),
  term: text("term").notNull(),
  /** Other spellings that should link to this term (matched case-insensitively). */
  aliases: text("aliases").array().notNull().default(sql`'{}'::text[]`),
  definition: text("definition").notNull(),
  /** When the term enters the story. */
  version: text("version").notNull().references(() => versions.version),
  spoilerVersion: text("spoiler_version"),
});

export const characterKitsRelations = relations(characterKits, ({ one }) => ({
  character: one(characters, { fields: [characterKits.characterSlug], references: [characters.slug] }),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  element: one(elements, { fields: [characters.elementSlug], references: [elements.slug] }),
  path: one(paths, { fields: [characters.pathSlug], references: [paths.slug] }),
  faction: one(factions, { fields: [characters.factionSlug], references: [factions.slug] }),
  world: one(worlds, { fields: [characters.worldSlug], references: [worlds.slug] }),
  version: one(versions, { fields: [characters.releaseVersion], references: [versions.version] }),
  kit: one(characterKits, { fields: [characters.slug], references: [characterKits.characterSlug] }),
}));

export const versionsRelations = relations(versions, ({ many }) => ({
  characters: many(characters),
  chapters: many(worldChapters),
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
  lore: many(aeonLore),
}));

export const aeonLoreRelations = relations(aeonLore, ({ one }) => ({
  aeon: one(aeons, { fields: [aeonLore.aeonSlug], references: [aeons.slug] }),
}));
export const worldsRelations = relations(worlds, ({ many }) => ({
  characters: many(characters),
  chapters: many(worldChapters),
}));

export const worldChaptersRelations = relations(worldChapters, ({ one }) => ({
  world: one(worlds, { fields: [worldChapters.worldSlug], references: [worlds.slug] }),
  version: one(versions, { fields: [worldChapters.version], references: [versions.version] }),
}));
