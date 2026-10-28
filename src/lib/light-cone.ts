export type LightCone = {
  id: string;
  slug: string;
  name: string;
  rarity: 3 | 4 | 5;
  pathSlug: string;
  releaseVersion: string | null;
  lore: string;
  skill: string;
  desc: string;
  params: number[][];
  stats: { level: number; ascension: number; hp: number; atk: number; def: number }[];
  materials: { id: string; num: number }[];
  signature: string[];
};

export const lightConeSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’"!?.,:]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const rarityColor = (rarity: number) =>
  rarity === 5 ? "var(--color-gold)" : rarity === 4 ? "var(--color-violet)" : "var(--color-cyan)";
