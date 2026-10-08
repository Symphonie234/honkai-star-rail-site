/*
 * Areas of a world and their in-game maps, as imported by scripts/import-wiki-data.ts
 * from the Honkai: Star Rail Wiki (area pages and its interactive maps).
 */

/** A labelled point on a map. Coordinates are fractions of the map image (0–1, from the top left). */
export type MapMarker = {
  id: string;
  /** MapCategory id. */
  cat: string;
  x: number;
  y: number;
  title: string;
  desc: string;
  rewards: { name: string; count: number }[];
  /** In-game screenshot of the spot (wiki file name), shown as "In-game view". */
  image: string | null;
};

export type MapCategory = {
  id: string;
  name: string;
  /** Game map icon (wiki file name). */
  icon: string | null;
  /** Shown by default (landmarks, Space Anchors, domains, shops…); the rest can be switched on. */
  defaultOn: boolean;
};

export type AreaFloor = {
  /** Short label for tabs: "F1", "B2", or "Map". */
  label: string;
  /** Wiki file name of the in-game map. */
  image: string;
  width: number;
  height: number;
  markers: MapMarker[];
};

export type Area = {
  slug: string;
  name: string;
  worldSlug: string;
  /** e.g. "Underworld", "Dreamscape", "Glee". */
  region: string | null;
  description: string;
  /** How it's unlocked, e.g. 'after completing "The Past Will Return as an Avalanche"'. */
  unlock: string | null;
  /** Wiki file name of the in-game area art. */
  image: string | null;
  connections: { name: string; slug: string | null; oneWay: boolean }[];
  releaseVersion: string;
  /** Areas that open later in a world's story give it away; null for each world's first areas. */
  spoilerVersion: string | null;
  floors: AreaFloor[];
  categories: MapCategory[];
  enemies: { normal: string[]; elite: string[] };
  activities: string[];
  collectibles: { name: string; count: number }[];
  shops: string[];
  sortOrder: number;
};

/** URL slug: '"Eternal Holy City" Okhema' → "eternal-holy-city-okhema". */
export const areaSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/™/g, "")
    .replace(/['’"!?.,:()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
