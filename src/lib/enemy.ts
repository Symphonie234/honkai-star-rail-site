/*
 * Enemies, as imported by scripts/import-wiki-data.ts from the Honkai: Star Rail Wiki.
 */

export type Enemy = {
  slug: string;
  name: string;
  /** Normal, Elite, Boss, Echo of War… as the wiki lists it. */
  tier: string;
  /** Combat types it deals (element slugs). */
  types: string[];
  /** Element slugs it's weak to. */
  weaknesses: string[];
  toughness: number | null;
  faction: string | null;
  /** Where it's fought (domains, areas), as text. */
  location: string;
  abilities: string[];
  /** Lore, as the game words it (paragraphs, <i>). */
  lore: string;
  /** Resistances by element slug (0.2 = 20%), and debuff resistances by name. */
  res: Record<string, number>;
  debuffRes: Record<string, number>;
  /** Base multipliers as listed on the wiki. */
  hp: number | null;
  spd: number | null;
  effectRes: number | null;
  skills: { name: string; type: string; desc: string }[];
  /** Wiki file name of the enemy's art. */
  image: string | null;
  releaseVersion: string;
  /** Story bosses give the plot away; null for ordinary enemies. */
  spoilerVersion: string | null;
};

export const enemySlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’"!?.,:()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
