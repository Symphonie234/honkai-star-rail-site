export type CwUnit = {
  slug: string;
  name: string;
  costs: number[];
  advisor: boolean;
  field: "On Field" | "Off Field" | "On/Off Field";
  roles: string[];
  bonds: string[];
  abilities: { name: string; type: string; desc: string }[];
  stars: { hp: string; onField: string; offField: string; spd: string }[];
  eidolons: { name: string; desc: string }[];
  lightCone: { name: string; desc: string } | null;
  equipment: string[];
  notes: string[];
  image: string | null;
};

export type CwBond = {
  slug: string;
  name: string;
  kind: "Faction" | "School" | "Unique";
  members: string[];
  effect: string;
  tiers: { count: number; effect: string }[];
  notes: string;
};

export type CwEquipment = {
  slug: string;
  name: string;
  category: string;
  tags: string[];
  stats: string;
  effect: string;
  users: string[];
  recipe: string[];
  image: string | null;
};

export type CwInvestment = { name: string; effect: string; rarity: string | null; planes: string | null; image: string | null };

export type CwOpponent = { name: string; boss: string; elites: string[]; normals: string[] };

export type CwData = {
  period: { name: string; start: string; end: string | null; versions: string };
  shopOdds: { level: number; odds: number[] }[];
  units: CwUnit[];
  bonds: CwBond[];
  equipment: CwEquipment[];
  environments: CwInvestment[];
  strategies: CwInvestment[];
  opponents: CwOpponent[];
  affixes: { name: string; effect: string }[];
};

export const COST_COLOR = ["", "#9aa1b5", "#4fbf86", "#4f9bea", "#a07ce8", "#e8c46a"];

export const cwSlug = (name: string) =>
  name.toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "").replace(/&/g, "and").replace(/['’"!?.,:()•]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type ActiveBond = { bond: CwBond; count: number; tier: number; next: number | null; members: string[] };

/** Bonds a lineup activates: unique units per Bond, the tier reached and the next threshold. */
export function activeBonds(lineup: CwUnit[], bonds: CwBond[]): ActiveBond[] {
  const names = [...new Set(lineup.map((u) => u.name))];
  return bonds
    .map((bond) => {
      const members = names.filter((n) => bond.members.includes(n));
      const reached = bond.tiers.filter((t) => t.count <= members.length);
      const next = bond.tiers.find((t) => t.count > members.length)?.count ?? null;
      return { bond, count: members.length, tier: reached.length, next, members };
    })
    .filter((b) => b.count > 0)
    .sort((a, b) => b.tier - a.tier || b.count - a.count || a.bond.name.localeCompare(b.bond.name));
}

export type Suggestion = { unit: CwUnit; score: number; reasons: string[] };

/**
 * Units worth adding to a lineup: each Bond it advances scores by how close that
 * brings the next tier (completing one scores most), plus a little for cost, and
 * a balance nudge toward on-field and off-field coverage.
 */
export function suggestUnits(lineup: CwUnit[], units: CwUnit[], bonds: CwBond[], opts: { maxCost?: number; limit?: number } = {}): Suggestion[] {
  const have = new Set(lineup.map((u) => u.name));
  const current = new Map(activeBonds(lineup, bonds).map((a) => [a.bond.name, a]));
  const onField = lineup.filter((u) => u.field !== "Off Field").length;
  const offField = lineup.filter((u) => u.field !== "On Field").length;
  const out: Suggestion[] = [];
  for (const unit of units) {
    if (have.has(unit.name) || unit.advisor) continue;
    const cost = Math.min(...unit.costs);
    if (opts.maxCost && cost > opts.maxCost) continue;
    let score = cost * 0.3;
    const reasons: string[] = [];
    for (const name of unit.bonds) {
      const bond = bonds.find((b) => b.name === name);
      if (!bond || bond.tiers.length === 0) continue;
      const had = current.get(name)?.count ?? 0;
      const count = had + 1;
      const next = bond.tiers.find((t) => t.count >= count);
      if (!next) continue;
      // Building on a Bond already in play beats starting a new one.
      const depth = had > 0 ? 1.5 : 1;
      if (next.count === 1) {
        score += 1;
      } else if (next.count === count) {
        score += (4 + bond.tiers.indexOf(next) * 3) * depth;
        reasons.push(`reaches ${name} ${count}`);
      } else if (count > 1) {
        score += (3 / (next.count - count + 1)) * depth;
        reasons.push(`${name} ${count}/${next.count}`);
      }
    }
    if (unit.field === "Off Field" && offField < onField - 1) { score += 1; reasons.push("adds off-field support"); }
    if (unit.field === "On Field" && onField < 2) { score += 1.5; reasons.push("adds an on-field fighter"); }
    out.push({ unit, score: Math.round(score * 10) / 10, reasons });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, opts.limit ?? 8);
}

/** A lineup of `size` built around one Bond: its strongest members, then the best suggestions. */
export function buildAround(bond: CwBond, size: number, units: CwUnit[], bonds: CwBond[]): CwUnit[] {
  const byCost = (a: CwUnit, b: CwUnit) => Math.max(...b.costs) - Math.max(...a.costs);
  const target = bond.tiers.filter((t) => t.count <= size).at(-1)?.count ?? Math.min(size, bond.members.length);
  const lineup = units.filter((u) => !u.advisor && bond.members.includes(u.name)).sort(byCost).slice(0, target);
  while (lineup.length < size) {
    const next = suggestUnits(lineup, units, bonds, { limit: 1 })[0];
    if (!next) break;
    lineup.push(next.unit);
  }
  return lineup;
}
