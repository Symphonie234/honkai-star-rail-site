/*
 * Character kit types (as imported by scripts/import-game-data.ts) and helpers
 * for presenting them.
 */

export type SkillKind =
  | "basic" | "skill" | "ultimate" | "talent" | "technique" | "elation-skill" | "assist" | "memosprite-skill" | "memosprite-talent";

export type KitSkill = {
  id: string;
  kind: SkillKind;
  /** The game's label, e.g. "Basic ATK", "Memosprite Skill". */
  typeLabel: string;
  name: string;
  /** Targeting tag, e.g. "Single Target", "AoE". */
  tag: string | null;
  summary: string | null;
  /** Description with placeholders like "#1[i]%", filled per level from `params`. */
  desc: string;
  /** params[level - 1][n - 1] is placeholder #n at that level. */
  params: number[][];
  /** Highest level, including Eidolon boosts. */
  maxLevel: number;
  /** Highest level reachable through Traces alone. */
  normalMaxLevel: number;
  icon: string;
};

export type Kit = {
  gameId: string;
  /** The character later received an "Enhanced" version (not covered by this kit). */
  hasEnhanced: boolean;
  /** Null for characters who use another resource instead of Energy (e.g. Castorice). */
  maxEnergy: number | null;
  skills: KitSkill[];
  majorTraces: { name: string; desc: string; params: number[]; icon: string; /** Ascension phase that unlocks it. */ unlock: number }[];
  /** Minor stat Traces, summed. */
  statBonuses: { type: string; name: string; value: number; percent: boolean; icon: string | null }[];
  eidolons: {
    rank: number; name: string; desc: string; icon: string; levelUps: { skill: string; levels: number }[];
    /** The Eidolon's full card art, as a wiki file name (null if the wiki has none). */
    art: string | null;
  }[];
  stats: { level: number; ascension: number; hp: number; atk: number; def: number; spd: number }[];
  critRate: number;
  critDmg: number;
  taunt: number;
  materials: { ascension: { id: string; num: number }[]; traces: { id: string; num: number }[] };
};

export type Material = {
  id: string;
  name: string;
  rarity: number;
  type: string;
  subType: string;
  icon: string;
  sources: string[];
};

export type DescPart = string | { value: string };

/**
 * Splits a kit description into text and filled-in values: "#1[i]%" becomes the
 * first param ×100 as an integer with "%", "#2[f1]" the second param to one decimal.
 */
export function fillDescription(desc: string, params: number[] = []): DescPart[] {
  const parts: DescPart[] = [];
  let last = 0;
  for (const m of desc.matchAll(/#(\d+)\[(i|f\d)\](%?)/g)) {
    if (m.index > last) parts.push(desc.slice(last, m.index));
    const raw = params[Number(m[1]) - 1];
    if (raw === undefined) {
      parts.push({ value: "?" });
    } else {
      const n = m[3] ? raw * 100 : raw;
      const digits = m[2] === "i" ? 0 : Number(m[2].slice(1));
      // Trim float noise (0.1 * 3) and drop trailing zeros.
      const text = Number(n.toFixed(digits)).toLocaleString("en-US", { maximumFractionDigits: digits });
      parts.push({ value: `${text}${m[3]}` });
    }
    last = m.index + m[0].length;
  }
  if (last < desc.length) parts.push(desc.slice(last));
  return parts;
}

/** A stat bonus as shown in game: "+18.7%" or "+5". */
export const formatBonus = (value: number, percent: boolean) =>
  percent ? `+${Number((value * 100).toFixed(1))}%` : `+${Number(value.toFixed(1))}`;
