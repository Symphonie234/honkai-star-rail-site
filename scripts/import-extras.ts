/*
 * Imports achievements and Simulated / Divergent Universe content into
 * src/db/data/game/achievements.json and simulated.json.
 * Sources: StarRailRes (text) and TurnBasedGameData (series, rarity, blessing Paths).
 *
 *   npm run data:extras
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { areaSlug } from "../src/lib/area";
import { JADE, type Achievement, type AchievementSeries, type Blessing, type Curio, type Domain, type Occurrence } from "../src/lib/extras";
import { cleanGameText } from "./lib/wikitext";

const RES = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/en";
const RAW = "https://raw.githubusercontent.com/DimbreathBot/TurnBasedGameData/main";
const OUT_DIR = path.join("src", "db", "data", "game");

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function fetchText(url: string) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(300_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i >= 3) throw new Error(`${url}: ${err}`);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
}

// Text hashes exceed 2^53, so they're read as strings.
const json = async (url: string): Promise<Raw> => JSON.parse((await fetchText(url)).replace(/"Hash":\s*(-?\d+)/g, '"Hash":"$1"'));
const res = (name: string) => json(`${RES}/${name}.json`);
const excel = async (name: string) => {
  const data = await json(`${RAW}/ExcelOutput/${name}.json`);
  return (Array.isArray(data) ? data : Object.values(data)) as Raw[];
};

const clean = (s: string | undefined) => cleanGameText(s ?? "").replace(/<[^>]+>/g, (t) => (t === "<i>" || t === "</i>" ? t : ""));

async function main() {
  const [achievementText, blessingText, curioText, eventText, blockText, textMap] = await Promise.all([
    res("achievements"), res("simulated_blessings"), res("simulated_curios"), res("simulated_events"), res("simulated_blocks"),
    json(`${RAW}/TextMap/TextMapEN.json`),
  ]);
  const [seriesRows, achievementRows, suBuffs, duBuffs, duTypes] = await Promise.all([
    excel("AchievementSeries"), excel("AchievementData"), excel("RogueBuff"), excel("RogueTournBuff"), excel("RogueTournBuffType"),
  ]);
  const text = (h: Raw | undefined) => (h?.Hash ? clean(textMap[h.Hash] ?? "") : "");

  const rarityOf = new Map(achievementRows.map((a) => [String(a.AchievementID), a.Rarity as Achievement["rarity"]]));
  const achievements: Achievement[] = Object.values(achievementText as Record<string, Raw>)
    .filter((a) => a.title)
    .map((a) => {
      const rarity = rarityOf.get(a.id) ?? "Low";
      return { id: a.id, series: a.series_id, title: clean(a.title), desc: clean(a.desc), hidden: !!a.hide, rarity, jade: JADE[rarity] };
    });
  const series: AchievementSeries[] = seriesRows
    .sort((a, b) => b.Priority - a.Priority)
    .map((s) => {
      const id = String(s.SeriesID);
      const list = achievements.filter((a) => a.series === id);
      const name = text(s.SeriesTitle) || `Series ${id}`;
      return { id, slug: areaSlug(name), name, count: list.length, jade: list.reduce((n, a) => n + a.jade, 0) };
    })
    .filter((s) => s.count > 0);

  const pathName = new Map(
    duTypes.map((t) => [t.RogueBuffType, String(t.RogueBuffTypeDecoName ?? "").trim().replace(/^TheHunt$/, "The Hunt")]),
  );
  const meta = new Map<string, { mode: Blessing["mode"]; type: number; rarity: string }>();
  for (const b of suBuffs) meta.set(String(b.MazeBuffID), { mode: "Simulated Universe", type: b.RogueBuffType, rarity: b.RogueBuffCategory });
  for (const b of duBuffs) meta.set(String(b.MazeBuffID), { mode: "Divergent Universe", type: b.RogueBuffType, rarity: b.RogueBuffCategory });
  const blessings: Blessing[] = Object.values(blessingText as Record<string, Raw>).flatMap((b) => {
    const m = meta.get(b.id);
    const path = m && pathName.get(m.type);
    if (!m || !path || !b.name?.trim() || !["Common", "Rare", "Legendary"].includes(m.rarity)) return [];
    return [{ id: b.id, name: clean(b.name), mode: m.mode, path, rarity: m.rarity as Blessing["rarity"], desc: clean(b.desc), enhanced: clean(b.enhanced_desc) }];
  });

  const curios: Curio[] = Object.values(curioText as Record<string, Raw>)
    .filter((c) => c.name?.trim() && c.desc?.trim())
    .map((c) => ({ id: c.id, name: clean(c.name), desc: clean(c.desc), lore: clean(c.bg_desc), icon: c.icon || null }));

  const seen = new Set<string>();
  const occurrences: Occurrence[] = Object.values(eventText as Record<string, Raw>).flatMap((e) => {
    const key = `${e.type}:${e.name}`;
    if (!e.name?.trim() || !e.image || seen.has(key)) return [];
    seen.add(key);
    return [{ id: e.id, name: clean(e.name), type: e.type, image: e.image }];
  });

  const domains: Domain[] = Object.values(blockText as Record<string, Raw>).filter((d) => d.name?.trim() && d.icon).map((d) => ({
    id: d.id, name: clean(d.name), desc: clean(d.desc), icon: d.icon, color: d.color,
  }));

  await mkdir(OUT_DIR, { recursive: true });
  const stamp = { source: "https://github.com/Mar-7th/StarRailRes; https://github.com/DimbreathBot/TurnBasedGameData", importedAt: new Date().toISOString().slice(0, 10) };
  await writeFile(path.join(OUT_DIR, "achievements.json"), JSON.stringify({ ...stamp, series, achievements }, null, 1) + "\n");
  await writeFile(path.join(OUT_DIR, "simulated.json"), JSON.stringify({ ...stamp, blessings, curios, occurrences, domains }, null, 1) + "\n");
  console.log(
    `Imported ${achievements.length} achievements in ${series.length} series; ${blessings.length} blessings, ` +
      `${curios.length} curios, ${occurrences.length} occurrences, ${domains.length} domain types.`,
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
