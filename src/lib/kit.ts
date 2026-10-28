export type SkillKind =
  | "basic" | "skill" | "ultimate" | "talent" | "technique" | "elation-skill" | "assist" | "memosprite-skill" | "memosprite-talent";

export type KitSkill = {
  id: string;
  kind: SkillKind;
  typeLabel: string;
  name: string;
  tag: string | null;
  summary: string | null;
  desc: string;
  params: number[][];
  maxLevel: number;
  normalMaxLevel: number;
  icon: string;
};

export type Kit = {
  gameId: string;
  hasEnhanced: boolean;
  maxEnergy: number | null;
  skills: KitSkill[];
  majorTraces: { name: string; desc: string; params: number[]; icon: string; unlock: number }[];
  statBonuses: { type: string; name: string; value: number; percent: boolean; icon: string | null }[];
  eidolons: {
    rank: number; name: string; desc: string; icon: string; levelUps: { skill: string; levels: number }[];
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
  slug?: string;
  name: string;
  rarity: number;
  type: string;
  subType: string;
  icon: string;
  sources: string[];
  category: string;
  description: string;
  story: string;
  synthesis: { items: { id: string; count: number }[]; credits: number | null } | null;
};

export type DescPart = string | { value: string };

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
      const text = Number(n.toFixed(digits)).toLocaleString("en-US", { maximumFractionDigits: digits });
      parts.push({ value: `${text}${m[3]}` });
    }
    last = m.index + m[0].length;
  }
  if (last < desc.length) parts.push(desc.slice(last));
  return parts;
}

export const formatBonus = (value: number, percent: boolean) =>
  percent ? `+${Number((value * 100).toFixed(1))}%` : `+${Number(value.toFixed(1))}`;
