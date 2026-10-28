export type Enemy = {
  slug: string;
  name: string;
  tier: string;
  types: string[];
  weaknesses: string[];
  toughness: number | null;
  faction: string | null;
  location: string;
  abilities: string[];
  lore: string;
  res: Record<string, number>;
  debuffRes: Record<string, number>;
  hp: number | null;
  spd: number | null;
  effectRes: number | null;
  skills: { name: string; type: string; desc: string }[];
  image: string | null;
  releaseVersion: string;
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
