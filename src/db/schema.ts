import { relations, sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { Area } from "../lib/area";
import type { Enemy } from "../lib/enemy";
import type { Kit } from "../lib/kit";
import type { LightCone } from "../lib/light-cone";
import type { RelicSet } from "../lib/relic";

export const versions = pgTable("versions", {
  version: text("version").primaryKey(),
  title: text("title").notNull(),
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
  color: text("color").notNull(),
  mapX: integer("map_x").notNull(),
  mapY: integer("map_y").notNull(),
  image: text("image"),
});

export const worldChapters = pgTable("world_chapters", {
  slug: text("slug").primaryKey(),
  worldSlug: text("world_slug").notNull().references(() => worlds.slug),
  sortOrder: integer("sort_order").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  version: text("version").notNull().references(() => versions.version),
  spoilerVersion: text("spoiler_version"),
});

export const aeons = pgTable("aeons", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  concept: text("concept").notNull(),
  pathSlug: text("path_slug").references(() => paths.slug),
  introducedVersion: text("introduced_version").notNull().references(() => versions.version),
  glyph: text("glyph").notNull(),
  epithets: text("epithets").array().notNull().default(sql`'{}'::text[]`),
  image: text("image"),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const aeonLore = pgTable("aeon_lore", {
  slug: text("slug").primaryKey(),
  aeonSlug: text("aeon_slug").notNull().references(() => aeons.slug),
  sortOrder: integer("sort_order").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  version: text("version").notNull().references(() => versions.version),
  spoilerVersion: text("spoiler_version"),
});

export const factions = pgTable("factions", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  introducedVersion: text("introduced_version").notNull().references(() => versions.version),
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
  releaseDate: text("release_date").notNull(),
  spoilerVersion: text("spoiler_version"),
  lightCone: text("light_cone"),
  voiceEn: text("voice_en"),
  art: jsonb("art").$type<ArtVariant[]>().notNull().default([]),
});

export type ArtVariant = { label: string; gameId: string };

export const characterKits = pgTable("character_kits", {
  characterSlug: text("character_slug").primaryKey().references(() => characters.slug),
  kit: jsonb("kit").$type<Kit>().notNull(),
});

export const lightCones = pgTable("light_cones", {
  slug: text("slug").primaryKey(),
  gameId: text("game_id").notNull(),
  name: text("name").notNull(),
  rarity: integer("rarity").notNull(),
  pathSlug: text("path_slug").notNull().references(() => paths.slug),
  releaseVersion: text("release_version").references(() => versions.version),
  data: jsonb("data").$type<LightCone>().notNull(),
});

export const materials = pgTable("materials", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().default(""),
  name: text("name").notNull(),
  rarity: integer("rarity").notNull(),
  type: text("type").notNull(),
  subType: text("sub_type").notNull(),
  icon: text("icon").notNull(),
  sources: text("sources").array().notNull().default(sql`'{}'::text[]`),
  category: text("category").notNull().default(""),
  description: text("description").notNull().default(""),
  story: text("story").notNull().default(""),
  synthesis: jsonb("synthesis").$type<{ items: { id: string; count: number }[]; credits: number | null }>(),
});

export const areas = pgTable("areas", {
  slug: text("slug").primaryKey(),
  worldSlug: text("world_slug").notNull().references(() => worlds.slug),
  name: text("name").notNull(),
  region: text("region"),
  releaseVersion: text("release_version").notNull().references(() => versions.version),
  spoilerVersion: text("spoiler_version"),
  sortOrder: integer("sort_order").notNull(),
  data: jsonb("data").$type<Area>().notNull(),
});

export const enemies = pgTable("enemies", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  faction: text("faction"),
  releaseVersion: text("release_version").notNull().references(() => versions.version),
  spoilerVersion: text("spoiler_version"),
  data: jsonb("data").$type<Enemy>().notNull(),
});

export const relicSets = pgTable("relic_sets", {
  slug: text("slug").primaryKey(),
  gameId: text("game_id").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  releaseVersion: text("release_version").references(() => versions.version),
  data: jsonb("data").$type<RelicSet>().notNull(),
});

export const glossaryTerms = pgTable("glossary_terms", {
  slug: text("slug").primaryKey(),
  term: text("term").notNull(),
  aliases: text("aliases").array().notNull().default(sql`'{}'::text[]`),
  definition: text("definition").notNull(),
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

export const pathsRelations = relations(paths, ({ many }) => ({ characters: many(characters), lightCones: many(lightCones) }));

export const lightConesRelations = relations(lightCones, ({ one }) => ({
  path: one(paths, { fields: [lightCones.pathSlug], references: [paths.slug] }),
}));
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
  areas: many(areas),
}));

export const areasRelations = relations(areas, ({ one }) => ({
  world: one(worlds, { fields: [areas.worldSlug], references: [worlds.slug] }),
}));

export const worldChaptersRelations = relations(worldChapters, ({ one }) => ({
  world: one(worlds, { fields: [worldChapters.worldSlug], references: [worlds.slug] }),
  version: one(versions, { fields: [worldChapters.version], references: [versions.version] }),
}));
