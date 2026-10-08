/*
 * Imports character kits from StarRailRes's game data index
 * (github.com/Mar-7th/StarRailRes, index_new/en) for every character in the
 * archive, and writes the result into the repo:
 *
 *   src/db/data/game/kits.json       skills, Traces, Eidolons, stats, material totals
 *   src/db/data/game/materials.json  every material those kits use
 *
 * Run after a game update, review the diff, then `npm run art:fetch` (for new
 * icons) and `npm run db:seed`. The output is committed so builds never depend
 * on the network and each patch's changes show up in git.
 *
 *   npm run data:import
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { artOf, CHARACTERS } from "../src/db/seed-data";
import type { Kit, KitSkill, Material, SkillKind } from "../src/lib/kit";

const INDEX = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/en";
const OUT_DIR = path.join("src", "db", "data", "game");

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function load(name: string): Promise<Raw> {
  const res = await fetch(`${INDEX}/${name}.json`, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

const KIND: Record<string, SkillKind> = {
  Normal: "basic", BPSkill: "skill", Ultra: "ultimate", Talent: "talent", Maze: "technique",
  MemospriteSkill: "memosprite-skill", MemospriteTalent: "memosprite-talent",
};

/** Stat values at each level milestone: Lv.1, the cap of each ascension phase, and the level after it. */
const MILESTONES: [number, number][] = [
  [1, 0], [20, 0], [20, 1], [30, 1], [30, 2], [40, 2], [40, 3], [50, 3], [50, 4], [60, 4], [60, 5], [70, 5], [70, 6], [80, 6],
];

function addTo(totals: Map<string, number>, materials: { id: string; num: number }[]) {
  for (const m of materials) totals.set(m.id, (totals.get(m.id) ?? 0) + m.num);
}

async function main() {
  const [chars, skills, trees, ranks, promotions, items, properties] = await Promise.all(
    ["characters", "character_skills", "character_skill_trees", "character_ranks", "character_promotions", "items", "properties"].map(load),
  );

  const kits: Record<string, Kit> = {};
  const usedItems = new Set<string>();

  for (const c of CHARACTERS) {
    // Variants of one character (Stelle/Caelus) share a kit; use the first.
    const gameId = artOf(c)[0]?.gameId;
    const raw = gameId && chars[gameId];
    if (!raw) { console.warn(`  no game data for ${c.slug}`); continue; }

    // Some older characters later received "Enhanced" versions, stored alongside the
    // originals under IDs prefixed with "1" (Seele's Thwack: 110201 → 1110201). This
    // archive covers characters as released, so those are left out. Memosprite entries
    // share the prefix but are told apart by their type.
    const enhancedPrefix = `1${gameId}`;
    const isEnhancedSkill = (id: string) => id.startsWith(enhancedPrefix) && !skills[id].type.startsWith("Memosprite");
    const treeIds = raw.skill_trees.filter((id: string) => !(id.startsWith(enhancedPrefix) && id.length === gameId.length + 4));
    const hasEnhanced = treeIds.length < raw.skill_trees.length;

    // Each skill's normal level cap comes from the Trace node that levels it.
    const normalMax = new Map<string, number>();
    for (const id of treeIds) for (const s of trees[id].level_up_skills) normalMax.set(s.id, trees[id].max_level);

    const seen = new Set<string>();
    const kitSkills: KitSkill[] = [];
    for (const id of raw.skills) {
      if (isEnhancedSkill(id)) continue;
      const s = skills[id];
      const kind = KIND[s.type];
      // Skip the overworld basic attack, and internal duplicates that share a name.
      if (!kind || seen.has(`${kind}:${s.name}`)) continue;
      seen.add(`${kind}:${s.name}`);
      kitSkills.push({
        id, kind, typeLabel: s.type_text || kind, name: s.name, tag: s.effect_text || null,
        summary: s.simple_desc || null, desc: s.desc, params: s.params,
        maxLevel: s.max_level, normalMaxLevel: normalMax.get(id) ?? s.max_level, icon: s.icon,
      });
    }

    const majorTraces = [];
    const statTotals = new Map<string, number>();
    const traceMaterials = new Map<string, number>();
    for (const id of treeIds) {
      const t = trees[id];
      for (const level of t.levels) addTo(traceMaterials, level.materials);
      const props = t.levels[0]?.properties ?? [];
      if (props.length) {
        for (const p of props) statTotals.set(p.type, (statTotals.get(p.type) ?? 0) + p.value);
      } else if (t.name && t.desc && !t.level_up_skills.length) {
        majorTraces.push({ name: t.name, desc: t.desc, params: t.params[0] ?? [], icon: t.icon, unlock: t.levels[0]?.promotion ?? 0 });
      }
    }

    const ascensionMaterials = new Map<string, number>();
    const promo = promotions[gameId];
    for (const phase of promo.materials ?? []) addTo(ascensionMaterials, phase);

    const statAt = (level: number, phase: number) => {
      const v = promo.values[phase];
      const at = (k: string) => Math.round((v[k].base + v[k].step * (level - 1)) * 10) / 10;
      return { level, ascension: phase, hp: at("hp"), atk: at("atk"), def: at("def"), spd: v.spd.base };
    };
    const top = promo.values.at(-1);

    const eidolons = raw.ranks.map((id: string) => {
      const r = ranks[id];
      return {
        rank: r.rank, name: r.name, desc: r.desc, icon: r.icon,
        // The game data repeats some boosts (one skill under two internal IDs); keep each skill once.
        levelUps: [...new Map(
          r.level_up_skills.map((u: { id: string; num: number }) => {
            const skill = skills[u.id]?.name ?? u.id;
            return [skill, { skill, levels: u.num }];
          }),
        ).values()],
      };
    });

    const toList = (m: Map<string, number>) =>
      [...m].map(([id, num]) => { usedItems.add(id); return { id, num }; }).sort((a, b) => Number(a.id) - Number(b.id));

    kits[c.slug] = {
      gameId,
      hasEnhanced,
      maxEnergy: raw.max_sp,
      skills: kitSkills,
      majorTraces,
      statBonuses: [...statTotals].map(([type, value]) => ({
        type, value: Math.round(value * 10000) / 10000,
        name: properties[type]?.name ?? type, percent: !!properties[type]?.percent, icon: properties[type]?.icon ?? null,
      })),
      eidolons,
      stats: MILESTONES.map(([level, phase]) => statAt(level, phase)),
      critRate: top.crit_rate.base, critDmg: top.crit_dmg.base, taunt: top.taunt.base,
      materials: { ascension: toList(ascensionMaterials), traces: toList(traceMaterials) },
    };
  }

  const materials: Material[] = [...usedItems].sort((a, b) => Number(a) - Number(b)).map((id) => {
    const it = items[id];
    return { id, name: it.name, rarity: it.rarity, type: it.type, subType: it.sub_type, icon: it.icon, sources: it.come_from ?? [] };
  });

  await mkdir(OUT_DIR, { recursive: true });
  const meta = { source: "https://github.com/Mar-7th/StarRailRes (index_new/en)", importedAt: new Date().toISOString().slice(0, 10) };
  await writeFile(path.join(OUT_DIR, "kits.json"), JSON.stringify({ ...meta, kits }, null, 1) + "\n");
  await writeFile(path.join(OUT_DIR, "materials.json"), JSON.stringify({ ...meta, materials }, null, 1) + "\n");
  console.log(`Imported ${Object.keys(kits).length} kits and ${materials.length} materials.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
