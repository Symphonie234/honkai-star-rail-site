import { isAvailable, isRevealed, type StoryProgress } from "./spoilers";

export type SearchEntry = {
  t: string;
  n: string;
  s: string;
  u: string;
  v: string;
  sp: string | null;
  i: string | null;
  k?: string;
};

export const SEARCH_KINDS = [
  "Character", "Light Cone", "Relic", "Material", "Enemy", "World", "Area", "Aeon", "Story", "Glossary", "Version",
] as const;

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function searchEntries(entries: SearchEntry[], query: string, progress: StoryProgress, limit = 60) {
  const q = norm(query);
  if (!q) return [];
  const terms = q.split(" ");
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of entries) {
    if (!isAvailable(e.v, progress) || !isRevealed(e.sp, progress)) continue;
    const name = norm(e.n);
    const extra = norm(`${e.s} ${e.k ?? ""}`);
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.split(" ").some((w) => w.startsWith(q))) score = 65;
    else if (name.includes(q)) score = 50;
    else if (terms.every((t) => name.includes(t) || extra.includes(t))) score = terms.every((t) => name.includes(t)) ? 45 : 25;
    if (!score) continue;
    score -= Math.min(name.length, 40) / 40 + SEARCH_KINDS.indexOf(e.t as (typeof SEARCH_KINDS)[number]) * 0.01;
    scored.push({ e, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.e);
}
