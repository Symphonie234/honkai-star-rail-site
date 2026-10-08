/*
 * Light Cone types (as imported by scripts/import-game-data.ts) and helpers.
 */

export type LightCone = {
  /** Game ID, which also names its art. */
  id: string;
  slug: string;
  name: string;
  rarity: 3 | 4 | 5;
  pathSlug: string;
  /** Version that introduced it (null if the wiki doesn't list it). */
  releaseVersion: string | null;
  /** The Light Cone's own story text. */
  lore: string;
  /** Passive ability name and description, with placeholders filled per Superimposition from `params`. */
  skill: string;
  desc: string;
  /** params[superimposition - 1][n - 1] is placeholder #n at that Superimposition (S1–S5). */
  params: number[][];
  stats: { level: number; ascension: number; hp: number; atk: number; def: number }[];
  /** Total ascension materials, Lv. 1 → 80. */
  materials: { id: string; num: number }[];
  /** Characters whose signature Light Cone this is. */
  signature: string[];
};

/** URL slug from a name: "Why Does the Ocean Sing" → "why-does-the-ocean-sing". */
export const lightConeSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’"!?.,:]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Rarity in the game's own colors: gold, violet, blue. */
export const rarityColor = (rarity: number) =>
  rarity === 5 ? "var(--color-gold)" : rarity === 4 ? "var(--color-violet)" : "var(--color-cyan)";
