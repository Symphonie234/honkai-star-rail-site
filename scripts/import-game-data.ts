import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { artOf, CHARACTERS, VERSIONS } from "../src/db/seed-data";
import type { Kit, KitSkill, Material, SkillKind } from "../src/lib/kit";
import { lightConeSlug, type LightCone } from "../src/lib/light-cone";
import type { RelicSet, RelicSlot, RelicStats } from "../src/lib/relic";
import { cleanGameText } from "./lib/wikitext";

const INDEX = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/en";
const OUT_DIR = path.join("src", "db", "data", "game");
const WIKI_API = "https://honkai-star-rail.fandom.com/api.php";
const YATTA = "https://sr.yatta.moe/api/v2/en";
const WIKI_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36" };

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function load(name: string): Promise<Raw> {
  const res = await fetch(`${INDEX}/${name}.json`, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

const KIND: Record<string, SkillKind> = {
  Normal: "basic", BPSkill: "skill", Ultra: "ultimate", Talent: "talent", Maze: "technique",
  ElationDamage: "elation-skill", Assist: "assist",
  MemospriteSkill: "memosprite-skill", MemospriteTalent: "memosprite-talent",
};

const PATH_SLUG: Record<string, string> = {
  Warrior: "destruction", Rogue: "hunt", Mage: "erudition", Shaman: "harmony", Warlock: "nihility",
  Knight: "preservation", Priest: "abundance", Memory: "remembrance", Elation: "elation",
};

const cleanText = (text: string) =>
  text
    .replace(/\{NICKNAME\}/g, "Trailblazer")
    .replace(/\{M#([^}]*)\}\{F#([^}]*)\}/g, "$1/$2")
    .replace(/\{F#([^}]*)\}\{M#([^}]*)\}/g, "$2/$1");

async function yatta(pathname: string): Promise<Raw | null> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(`${YATTA}/${pathname}`, { headers: WIKI_HEADERS, signal: AbortSignal.timeout(60_000) });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return ((await res.json()) as Raw).data ?? null;
    } catch (err) {
      if (i >= 4) throw new Error(`yatta ${pathname}: ${err}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    for (let i = next++; i < items.length; i = next++) out[i] = await fn(items[i]);
  }));
  return out;
}

async function wiki(params: Record<string, string>) {
  const url = `${WIKI_API}?${new URLSearchParams({ format: "json", ...params })}`;
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: WIKI_HEADERS, signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Raw;
    } catch (err) {
      if (i >= 3) throw err;
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

async function releaseVersions() {
  const lightCones = new Map<string, string>();
  const relics = new Map<string, string>();
  for (const { version } of VERSIONS) {
    let text = "";
    for (let attempt = 1; !text && attempt <= 4; attempt++) {
      const data = await wiki({ action: "parse", page: `Version ${version}`, prop: "wikitext", redirects: "1" });
      text = data.parse?.wikitext?.["*"] ?? "";
      if (!text) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
    if (!text) throw new Error(`wiki page "Version ${version}" unavailable`);
    for (const m of text.matchAll(/Light Cone Intro\|([^}|]+)/g)) {
      const name = m[1].replace(/\s*\(Light Cone\)\s*$/, "").replace(/&#39;/g, "'").trim().toLowerCase();
      if (!lightCones.has(name)) lightCones.set(name, version);
    }
    const heading = /^===\s*Relics\s*===[ \t]*$/m.exec(text);
    if (heading) {
      const rest = text.slice(heading.index + heading[0].length);
      const end = rest.search(/^===?[^=]/m);
      for (const m of (end >= 0 ? rest.slice(0, end) : rest).matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
        for (const raw of [m[1], m[2]]) {
          const name = raw?.replace(/&commat;/g, "@").replace(/&#39;/g, "'").trim().toLowerCase();
          if (name && !relics.has(name)) relics.set(name, version);
        }
      }
    }
  }
  for (const [now, then] of Object.entries(RELIC_RENAMES)) {
    if (relics.has(then) && !relics.has(now)) relics.set(now, relics.get(then)!);
  }
  return { lightCones, relics };
}

const RELIC_RENAMES: Record<string, string> = {
  "pan-cosmic commercial enterprise": "pan-galactic commercial enterprise",
};

const EIDOLON_ART_NAME: Record<string, string> = { "march-7th": "March 7th (Preservation)" };
const eidolonArtName = (slug: string, name: string) =>
  EIDOLON_ART_NAME[slug] ?? (slug.startsWith("trailblazer-") ? "Trailblazer Female" : name.replace(/ & /g, " and "));

async function existingWikiFiles(files: string[]) {
  const exists = new Set<string>();
  for (let i = 0; i < files.length; i += 50) {
    const batch = files.slice(i, i + 50);
    const data = await wiki({ action: "query", titles: batch.map((f) => `File:${f}`).join("|"), prop: "imageinfo" });
    for (const page of Object.values(data.query.pages) as Raw[]) {
      if (page.imageinfo) exists.add(page.title.replace(/^File:/, ""));
    }
  }
  return exists;
}

const MILESTONES: [number, number][] = [
  [1, 0], [20, 0], [20, 1], [30, 1], [30, 2], [40, 2], [40, 3], [50, 3], [50, 4], [60, 4], [60, 5], [70, 5], [70, 6], [80, 6],
];

function addTo(totals: Map<string, number>, materials: { id: string; num: number }[]) {
  for (const m of materials) totals.set(m.id, (totals.get(m.id) ?? 0) + m.num);
}

async function main() {
  const [chars, skills, trees, ranks, promotions, items, properties, cones, coneRanks, conePromotions, relicSets, relicPieces, mainAffixes, subAffixes] =
    await Promise.all(
      [
        "characters", "character_skills", "character_skill_trees", "character_ranks", "character_promotions", "items", "properties",
        "light_cones", "light_cone_ranks", "light_cone_promotions", "relic_sets", "relics", "relic_main_affixes", "relic_sub_affixes",
      ].map(load),
    );

  const kits: Record<string, Kit> = {};
  const usedItems = new Set<string>();

  for (const c of CHARACTERS) {
    const gameId = artOf(c)[0]?.gameId;
    const raw = gameId && chars[gameId];
    if (!raw) { console.warn(`  no game data for ${c.slug}`); continue; }

    const enhancedPrefix = `1${gameId}`;
    const isEnhancedSkill = (id: string) => id.startsWith(enhancedPrefix) && !skills[id].type.startsWith("Memosprite");
    const treeIds = raw.skill_trees.filter((id: string) => !(id.startsWith(enhancedPrefix) && id.length === gameId.length + 4));
    const hasEnhanced = treeIds.length < raw.skill_trees.length;

    const normalMax = new Map<string, number>();
    for (const id of treeIds) for (const s of trees[id].level_up_skills) normalMax.set(s.id, trees[id].max_level);

    const seen = new Set<string>();
    const kitSkills: KitSkill[] = [];
    for (const id of raw.skills) {
      if (isEnhancedSkill(id)) continue;
      const s = skills[id];
      const kind = KIND[s.type];
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
        art: `Character ${eidolonArtName(c.slug, c.name)} Eidolon ${r.rank}.png` as string | null,
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

  const artFiles = await existingWikiFiles(Object.values(kits).flatMap((k) => k.eidolons.flatMap((e) => (e.art ? [e.art] : []))));
  for (const [slug, kit] of Object.entries(kits)) {
    for (const e of kit.eidolons) if (e.art && !artFiles.has(e.art)) e.art = null;
    const missing = kit.eidolons.filter((e) => !e.art).length;
    if (missing) console.warn(`  ${slug}: no wiki art for ${missing} Eidolon(s)`);
  }

  const released = await releaseVersions();
  const versions = released.lightCones;
  const coneStories = new Map<string, string>();
  await mapLimit(Object.keys(cones), 6, async (id) => {
    const d = await yatta(`equipment/${id}`);
    if (d?.description) coneStories.set(id, cleanGameText(d.description));
  });
  const signatures = new Map<string, string[]>();
  for (const c of CHARACTERS) {
    if (c.lightCone) signatures.set(c.lightCone.toLowerCase(), [...(signatures.get(c.lightCone.toLowerCase()) ?? []), c.slug]);
  }
  const lightCones: LightCone[] = Object.values(cones as Record<string, Raw>).map((lc) => {
    const rank = coneRanks[lc.id];
    const promo = conePromotions[lc.id];
    const total = new Map<string, number>();
    for (const phase of promo.materials ?? []) addTo(total, phase);
    const statAt = (level: number, phase: number) => {
      const v = promo.values[phase];
      const at = (k: string) => Math.round((v[k].base + v[k].step * (level - 1)) * 10) / 10;
      return { level, ascension: phase, hp: at("hp"), atk: at("atk"), def: at("def") };
    };
    const releaseVersion = versions.get(lc.name.toLowerCase()) ?? null;
    if (!releaseVersion) console.warn(`  no release version for Light Cone ${lc.name}`);
    return {
      id: lc.id, slug: lightConeSlug(lc.name), name: lc.name, rarity: lc.rarity, pathSlug: PATH_SLUG[lc.path] ?? lc.path,
      releaseVersion, lore: coneStories.get(lc.id) ?? cleanText(lc.desc), skill: rank.skill, desc: cleanText(rank.desc), params: rank.params,
      stats: MILESTONES.map(([level, phase]) => statAt(level, phase)),
      materials: [...total].map(([id, num]) => { usedItems.add(id); return { id, num }; }).sort((a, b) => Number(a.id) - Number(b.id)),
      signature: signatures.get(lc.name.toLowerCase()) ?? [],
    };
  });
  if (new Set(lightCones.map((l) => l.slug)).size !== lightCones.length) throw new Error("duplicate Light Cone slugs");
  for (const name of signatures.keys()) {
    if (!lightCones.some((l) => l.name.toLowerCase() === name)) console.warn(`  signature Light Cone not found: ${name}`);
  }

  const relics: RelicSet[] = await mapLimit(Object.values(relicSets as Record<string, Raw>), 6, async (set) => {
    const d = await yatta(`relic/${set.id}`);
    const pieces = (Object.values(relicPieces as Record<string, Raw>))
      .filter((p) => p.set_id === set.id && p.rarity === 5)
      .map((p) => ({
        slot: p.type as RelicSlot,
        name: p.name,
        description: cleanGameText(d?.suite?.[p.type]?.description ?? ""),
        story: cleanGameText(d?.suite?.[p.type]?.story ?? ""),
        icon: p.icon,
      }));
    const planar = pieces.some((p) => p.slot === "NECK" || p.slot === "OBJECT");
    const releaseVersion = released.relics.get(set.name.toLowerCase()) ?? null;
    if (!releaseVersion) console.warn(`  no release version for relic set ${set.name}`);
    return {
      id: set.id, slug: lightConeSlug(set.name), name: set.name, kind: planar ? "planar" : "cavern", releaseVersion,
      bonuses: (set.desc as string[]).map((desc, i) => ({ pieces: i === 0 ? 2 : 4, desc: cleanGameText(desc) })),
      pieces, icon: set.icon,
    } satisfies RelicSet;
  });
  const SLOTS: RelicSlot[] = ["HEAD", "HAND", "BODY", "FOOT", "NECK", "OBJECT"];
  const relicStats: RelicStats = {
    main: SLOTS.map((slot, i) => ({
      slot,
      stats: Object.values(mainAffixes[String(51 + i)].affixes as Record<string, Raw>).map((a) => ({
        name: properties[a.property]?.name ?? a.property,
        max: Math.round((a.base + a.step * 15) * 10000) / 10000,
        percent: !!properties[a.property]?.percent,
      })),
    })),
    sub: Object.values(subAffixes["5"].affixes as Record<string, Raw>).map((a) => ({
      name: properties[a.property]?.name ?? a.property,
      rolls: [0, 1, 2].map((k) => Math.round((a.base + a.step * k) * 100000) / 100000) as [number, number, number],
      percent: !!properties[a.property]?.percent,
    })),
  };

  const MATERIAL_TYPES = new Set([1, 2, 3, 4, 5, 6, 7, 11, 17, 18]);
  const itemList = await yatta("item");
  const typeNames: Record<string, string> = itemList?.types ?? {};
  for (const it of Object.values((itemList?.items ?? {}) as Record<string, Raw>)) {
    if (MATERIAL_TYPES.has(it.type) && items[String(it.id)]) usedItems.add(String(it.id));
  }
  const details = new Map<string, Raw>();
  await mapLimit([...usedItems], 8, async (id) => {
    const d = await yatta(`item/${id}`);
    if (d) details.set(id, d);
  });

  const materials: Material[] = [...usedItems].sort((a, b) => Number(a) - Number(b)).map((id) => {
    const it = items[id];
    const d = details.get(id);
    const synthesis = (d?.source as Raw[] | undefined)?.flatMap((src) => src.recipe ?? []).find((r: Raw) => r.materialCost);
    const sources = ((d?.source as Raw[] | undefined)?.map((src) => cleanGameText(src.description)) ?? it.come_from ?? [])
      .filter((src: string) => src && !src.includes("{"));
    return {
      id, name: it.name, rarity: it.rarity, type: it.type, subType: it.sub_type, icon: it.icon, sources,
      category: cleanGameText(String(d?.type?.name ?? typeNames[d?.type?.id] ?? it.sub_type)).replace(/\n/g, " · "),
      description: cleanGameText(d?.description ?? ""),
      story: cleanGameText(d?.story ?? ""),
      synthesis: synthesis
        ? {
            items: Object.entries(synthesis.materialCost as Record<string, Raw>).map(([mid, m]) => ({ id: mid, count: m.count })),
            credits: synthesis.coinCost ?? null,
          }
        : null,
    };
  });

  await mkdir(OUT_DIR, { recursive: true });
  const meta = { source: "https://github.com/Mar-7th/StarRailRes (index_new/en); text: https://sr.yatta.moe", importedAt: new Date().toISOString().slice(0, 10) };
  await writeFile(path.join(OUT_DIR, "kits.json"), JSON.stringify({ ...meta, kits }, null, 1) + "\n");
  await writeFile(path.join(OUT_DIR, "light-cones.json"), JSON.stringify({ ...meta, lightCones }, null, 1) + "\n");
  await writeFile(path.join(OUT_DIR, "relics.json"), JSON.stringify({ ...meta, relics, stats: relicStats }, null, 1) + "\n");
  await writeFile(path.join(OUT_DIR, "materials.json"), JSON.stringify({ ...meta, materials }, null, 1) + "\n");
  console.log(`Imported ${Object.keys(kits).length} kits, ${lightCones.length} Light Cones, ${relics.length} relic sets and ${materials.length} materials.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
