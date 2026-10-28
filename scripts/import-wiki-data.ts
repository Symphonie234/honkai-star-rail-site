/*
 * Imports world areas (with their in-game maps and labelled points) and enemies from
 * the Honkai: Star Rail Wiki, and writes the result into the repo:
 *
 *   src/db/data/game/areas.json    every area of the archive's worlds: description, region,
 *                                  connections, enemies, activities, collectibles, and each
 *                                  floor's map with its markers (from the wiki's interactive maps)
 *   src/db/data/game/enemies.json  every enemy: tier, types, weaknesses, Toughness, faction,
 *                                  lore, resistances, base stats and skills
 *
 * Text is taken from the wiki and cleaned of markup; art is referenced by wiki file
 * name and downloaded by `npm run art:fetch`. Like data:import, the output is
 * committed so builds don't need the network and each update shows up as a diff.
 *
 *   npm run data:wiki
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { VERSIONS, WORLDS } from "../src/db/seed-data";
import { areaSlug, type Area, type AreaFloor, type MapCategory, type MapMarker } from "../src/lib/area";
import { enemySlug, type Enemy } from "../src/lib/enemy";
import { compareVersions } from "../src/lib/spoilers";
import { changeHistoryVersion, cleanWiki, description, findTemplate, links, templateParams } from "./lib/wikitext";

const API = "https://honkai-star-rail.fandom.com/api.php";
const HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36" };
const OUT_DIR = path.join("src", "db", "data", "game");

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function wiki(params: Record<string, string>): Promise<Raw> {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(90_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      // Bulk use can trip the wiki's rate limiting (an HTML challenge instead of JSON); back off and retry.
      if (i >= 6) throw err;
      await new Promise((r) => setTimeout(r, 15_000 * i));
    }
  }
}

/** Page wikitext for many titles (50 per request), following redirects; keyed by the requested title. */
async function pages(titles: string[]): Promise<Map<string, { title: string; text: string }>> {
  const out = new Map<string, { title: string; text: string }>();
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const data = await wiki({ action: "query", titles: batch.join("|"), prop: "revisions", rvprop: "content", rvslots: "main", redirects: "1" });
    // Map requested titles through normalization and redirects to the page that answered.
    const alias = new Map<string, string>();
    for (const n of data.query.normalized ?? []) alias.set(n.from, n.to);
    for (const r of data.query.redirects ?? []) alias.set(r.from, r.to);
    const resolve = (t: string) => { let x = t; for (let k = 0; k < 3 && alias.has(x); k++) x = alias.get(x)!; return x; };
    const byTitle = new Map<string, Raw>((Object.values(data.query.pages) as Raw[]).map((p) => [p.title, p]));
    for (const t of batch) {
      const p = byTitle.get(resolve(t));
      const text = p?.revisions?.[0]?.slots?.main?.["*"];
      if (text) out.set(t, { title: p!.title, text });
    }
  }
  return out;
}

async function categoryMembers(category: string) {
  const titles: string[] = [];
  let cont: Raw | null = {};
  while (cont) {
    const data = await wiki({ action: "query", list: "categorymembers", cmtitle: category, cmnamespace: "0", cmlimit: "500", ...cont });
    titles.push(...data.query.categorymembers.map((m: Raw) => m.title));
    cont = data.continue ?? null;
  }
  return titles;
}

/** The subset of these wiki files that exist. */
async function existingFiles(files: string[]) {
  const exists = new Set<string>();
  const unique = [...new Set(files)];
  for (let i = 0; i < unique.length; i += 50) {
    const data = await wiki({ action: "query", titles: unique.slice(i, i + 50).map((f) => `File:${f}`).join("|"), prop: "imageinfo" });
    await new Promise((r) => setTimeout(r, 400)); // gentle on the API: this runs dozens of batches
    const alias = new Map<string, string>((data.query.normalized ?? []).map((n: Raw) => [n.to, n.from]));
    for (const p of Object.values(data.query.pages) as Raw[]) {
      if (p.imageinfo) exists.add((alias.get(p.title) ?? p.title).replace(/^File:/, "").replace(/_/g, " "));
    }
  }
  return (file: string) => exists.has(file.replace(/_/g, " "));
}

/** A section's text: from its "==Heading==" (any level) to the next heading of the same or higher level. */
function section(text: string, heading: string) {
  const m = new RegExp(`^(=+)\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\1\\s*$`, "m").exec(text);
  if (!m) return "";
  const level = m[1].length;
  const rest = text.slice(m.index + m[0].length);
  const next = new RegExp(`^={1,${level}}[^=]`, "m").exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

const bulletLines = (text: string) => text.split("\n").filter((l) => /^\*/.test(l)).map((l) => l.replace(/^\*+\s*/, ""));

/** Entries of {{Enemy List|x=0|A;B/note;C}}: names without notes. */
function enemyList(text: string) {
  const t = findTemplate(text, "Enemy List");
  if (!t) return [];
  const p = templateParams(t);
  const list = Object.entries(p).filter(([k]) => /^\d+$/.test(k)).map(([, v]) => v).join(";");
  return list.split(";").map((e) => e.split("/")[0].trim()).filter(Boolean);
}

const ELEMENT: Record<string, string> = {
  physical: "physical", fire: "fire", ice: "ice", lightning: "lightning", wind: "wind", quantum: "quantum", imaginary: "imaginary",
};
const elements = (list: string | undefined) =>
  (list ?? "").split(/[;,]/).map((e) => ELEMENT[e.trim().toLowerCase()]).filter(Boolean);

// Map marker categories shown by default: places and activities, not every collectible.
const DEFAULT_ON = new Set([
  "Space Anchors", "Landmarks", "Marked Locations", "Calyx (Golden)", "Calyx (Crimson)", "Stagnant Shadows",
  "Caverns of Corrosion", "Echo of War", "Shops", "Shops with Collectibles", "Entrance", "Exit", "Interplanar Jump",
  "Interplanar Jump!", "Shuttles",
  // Doors into buildings (Eversummer Florist, Goethe Hotel…), which the game's map shows too.
  "Subareas with Collectibles",
]);

/**
 * A map marker's text, without what can't be shown on its own: reward lists (kept
 * separately), lists transcluded from other pages, and the headings above them.
 */
const markerText = (text: string) =>
  cleanWiki(
    text
      // Penacony Clockwork NPCs: rewards per mood ("|angry = All or Nothing*1") → "Angry: All or Nothing ×1".
      .replace(/\{\{Clockwork Rewards([\s\S]*?)\n\}\}/g, (_, body: string) =>
        [...body.matchAll(/\|\s*(\w+)\s*=\s*(.+)/g)]
          // Plain moods only; "sad_text" and the like hold wording with nested templates.
          .filter(([, mood, reward]) => !mood.includes("_") && !/\{\{|\}\}/.test(reward))
          .map(([, mood, reward]) => {
            const m = /^(.*?)\*(\d+)(?:\{text=([^}]*)\})?\s*$/.exec(reward.trim());
            const label = m ? `${m[3] ?? m[1]} ×${m[2]}` : reward.trim();
            return `${mood[0].toUpperCase()}${mood.slice(1)}: ${label}`;
          })
          .join("\n"))
      .replace(/\{\{Item List[\s\S]*?\}\}/g, "")
      .replace(/\{\{Map Marker\/Description\|[^}]*\}\}/g, "")
      .replace(/\{\{Transclude\|[^}]*\}\}/g, "")
      .replace(/^=+[^=\n]+=+\s*$/gm, ""),
  );

/** "{{Map Marker/Description|Eversummer Florist}}": the page whose description the marker shows. */
const describedBy = (text: string) => /\{\{Map Marker\/Description\|([^}|]+)/.exec(text)?.[1].trim() ?? null;

/** "{{Item List|1=Oronyx Slate*2;Credit*5000}}" → rewards. */
function rewards(text: string) {
  const t = findTemplate(text, "Item List");
  if (!t) return [];
  const list = templateParams(t)["1"] ?? "";
  return list.split(";").map((e) => {
    const [name, count] = e.split("*");
    return { name: cleanWiki(name ?? "").trim(), count: Number(count) || 1 };
  }).filter((r) => r.name);
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

async function importAreas() {
  // 1. Every interactive map, grouped by area ("X Floor 2" → "X").
  const mapTitles: string[] = [];
  let cont: Raw | null = {};
  while (cont) {
    const data = await wiki({ action: "query", list: "allpages", apnamespace: "2900", aplimit: "500", ...cont });
    mapTitles.push(...data.query.allpages.map((p: Raw) => p.title));
    cont = data.continue ?? null;
  }
  const mapPages = await pages(mapTitles);
  const floorOf = (title: string) => {
    const m = / (Floor|Basement) (\d+)$/.exec(title);
    return { base: title.replace(/^Map:/, "").replace(/ (Floor|Basement) \d+$/, ""), label: m ? `${m[1] === "Floor" ? "F" : "B"}${m[2]}` : "Map" };
  };
  const mapsByBase = new Map<string, { label: string; json: Raw }[]>();
  for (const [title, page] of mapPages) {
    try {
      const { base, label } = floorOf(title);
      mapsByBase.set(base, [...(mapsByBase.get(base) ?? []), { label, json: JSON.parse(page.text) }]);
    } catch { console.warn(`  unreadable map ${title}`); }
  }

  // 2. Each world's listed areas, plus every area that has a map.
  const worldByName = new Map(WORLDS.map((w) => [w.name, w]));
  const worldPages = await pages(WORLDS.map((w) => w.name));
  const candidates = new Set<string>(mapsByBase.keys());
  for (const { text } of worldPages.values()) {
    for (const m of section(text, "Areas").matchAll(/^Area [^|\n]+\.png\|link=([^|\n]+)\|/gm)) candidates.add(m[1].trim());
  }
  // Area pages are sometimes titled "X (Location)" to tell them from a faction of the same name.
  const tried = [...candidates].flatMap((c) => [c, `${c} (Location)`]);
  const areaPages = await pages(tried);

  const areas: Area[] = [];
  const seen = new Set<string>();
  // Markers whose text is another page's description, filled in once those pages are fetched.
  const describedMarkers: { marker: MapMarker; page: string }[] = [];
  for (const base of candidates) {
    const page = [areaPages.get(`${base} (Location)`), areaPages.get(base)].find((p) => p && findTemplate(p.text, "Location Infobox"));
    if (!page || seen.has(page.title)) continue;
    const info = templateParams(findTemplate(page.text, "Location Infobox")!);
    const world = worldByName.get(cleanWiki(info.world ?? ""));
    if (!world || (info.type && !/area/i.test(info.type))) continue;
    seen.add(page.title);
    const name = cleanWiki(info.name || page.title.replace(/ \(Location\)$/, ""));

    const lead = page.text.slice(0, 4000);
    const unlockMatch = /unlocked (after completing|during|upon completing|after|in)\s+(?:the\s+)?(\{\{[^}]+\}\}|''\[\[[^\]]+\]\]''|\[\[[^\]]+\]\])/i.exec(lead);
    const unlock = unlockMatch ? `${unlockMatch[1].toLowerCase()} "${cleanWiki(unlockMatch[2]).replace(/<\/?i>/g, "")}"` : null;

    const connections = bulletLines(info.connections ?? "").map((line) => {
      const l = links(line)[0];
      const label = l ? (l.label.replace(/ \(Location\)$/, "")) : cleanWiki(line);
      return { name: label, slug: null as string | null, target: l?.target ?? label, oneWay: /one-way/i.test(line) };
    });

    const features = section(page.text, "Features");
    const collectibles = bulletLines(section(features, "Collectables") || section(features, "Collectibles")).map((l) => {
      const count = Number(/'''(\d+)'''/.exec(l)?.[1] ?? 1);
      return { name: cleanWiki(l.replace(/'''\d+'''/, "")).replace(/\s+/g, " ").trim(), count };
    }).filter((c) => c.name);
    const activities = bulletLines(section(features, "Activities")).map((l) => cleanWiki(l).replace(/\s+/g, " ").trim()).filter(Boolean);
    const shops = bulletLines(section(features, "Shops")).map((l) => cleanWiki(l).trim()).filter(Boolean);
    const enemySection = section(features, "Enemies") || section(page.text, "Enemies");

    const releaseVersion = (() => {
      const v = changeHistoryVersion(page.text);
      return v && compareVersions(v, world.releaseVersion) > 0 ? v : world.releaseVersion;
    })();

    // Floors: the area's maps (named after the map pages for it, or the infobox's map gallery).
    const floorMaps = mapsByBase.get(base) ?? mapsByBase.get(name) ?? [];
    const categories = new Map<string, MapCategory>();
    const floors: AreaFloor[] = floorMaps
      .sort((a, b) => floorRank(a.label) - floorRank(b.label))
      .map(({ label, json }) => {
        const [w, h] = json.mapBounds[1] as [number, number];
        const flip = json.origin === "bottom-left";
        const catNames = new Map<string, Raw>((json.categories ?? []).map((c: Raw) => [c.id, c]));
        const markers: MapMarker[] = (json.markers ?? []).map((mk: Raw) => {
          const c = catNames.get(mk.categoryId);
          const catId = areaSlug(c?.name ?? mk.categoryId);
          if (!categories.has(catId)) {
            categories.set(catId, {
              id: catId, name: (c?.name ?? mk.categoryId).trim(),
              icon: c?.icon ? String(c.icon).replace(/^File:/, "") : null, defaultOn: DEFAULT_ON.has((c?.name ?? "").trim()),
            });
          }
          const [x, y] = mk.position as [number, number];
          const descText = String(mk.popup?.description ?? "");
          const marker: MapMarker = {
            id: String(mk.id), cat: catId, x: round4(x / w), y: round4(flip ? 1 - y / h : y / h),
            title: cleanWiki(String(mk.popup?.title ?? c?.name ?? "")),
            desc: markerText(descText),
            rewards: rewards(descText),
            image: mk.popup?.image ? String(mk.popup.image).replace(/^File:/, "") : null,
          };
          const describedPage = describedBy(descText);
          if (describedPage) describedMarkers.push({ marker, page: describedPage });
          return marker;
        });
        return { label, image: String(json.mapImage).replace(/^File:/, ""), width: w, height: h, markers };
      });

    areas.push({
      slug: areaSlug(name), name, worldSlug: world.slug, region: info.region ? cleanWiki(info.region) || null : null,
      description: description(page.text), unlock, image: info.image ? cleanWiki(info.image).split("\n")[0].trim() || null : null,
      connections: connections.map(({ target, ...c }) => ({ ...c, slug: null, _target: target }) as Area["connections"][number] & { _target: string }),
      releaseVersion,
      spoilerVersion: compareVersions(releaseVersion, world.releaseVersion) > 0 ? releaseVersion : null,
      floors, categories: [...categories.values()],
      enemies: { normal: enemyList(section(enemySection, "Normal")), elite: enemyList(section(enemySection, "Elite")) },
      activities, collectibles, shops, sortOrder: 0,
    });
  }

  // Markers that show another page's description (sub-areas like shops and hotels).
  const describedPages = await pages([...new Set(describedMarkers.map((d) => d.page))]);
  for (const { marker, page } of describedMarkers) {
    const text = describedPages.get(page)?.text;
    const lead = text ? description(text) : "";
    if (lead) marker.desc = [lead, marker.desc].filter(Boolean).join("\n\n");
  }

  // Link connections to areas we have; order each world's areas by version, then name.
  const bySlug = new Map(areas.map((a) => [a.slug, a]));
  for (const a of areas) {
    a.connections = a.connections.map((c) => {
      const target = (c as typeof c & { _target: string })._target;
      const slug = [areaSlug(target), areaSlug(target.replace(/ \(Location\)$/, "")), areaSlug(c.name)].find((s) => bySlug.has(s)) ?? null;
      return { name: c.name, slug, oneWay: c.oneWay };
    });
  }
  areas.sort((a, b) => a.worldSlug.localeCompare(b.worldSlug) || compareVersions(a.releaseVersion, b.releaseVersion) || a.name.localeCompare(b.name));
  areas.forEach((a, i) => (a.sortOrder = i));
  if (new Set(areas.map((a) => a.slug)).size !== areas.length) throw new Error("duplicate area slugs");

  // Drop art the wiki doesn't have.
  const files = areas.flatMap((a) => [
    a.image, ...a.floors.map((f) => f.image), ...a.categories.map((c) => c.icon), ...a.floors.flatMap((f) => f.markers.map((m) => m.image)),
  ].filter((f): f is string => !!f));
  const has = await existingFiles(files);
  for (const a of areas) {
    if (a.image && !has(a.image)) a.image = null;
    for (const c of a.categories) if (c.icon && !has(c.icon)) c.icon = null;
    // Some markers name a screenshot the wiki never uploaded.
    for (const f of a.floors) for (const m of f.markers) if (m.image && !has(m.image)) m.image = null;
    a.floors = a.floors.filter((f) => has(f.image) || (console.warn(`  ${a.name}: map image missing (${f.image})`), false));
  }
  return areas;
}

const floorRank = (label: string) => (label.startsWith("B") ? -Number(label.slice(1)) : label === "Map" ? 0 : Number(label.slice(1)));

const TIER_SPOILERS = /boss|echo of war|story/i;

async function importEnemies() {
  const titles = await categoryMembers("Category:Enemies");
  const set = new Set(titles);
  // Game-mode variants ("X (Apocalyptic Shadow)") repeat their base enemy.
  const wanted = titles.filter((t) => !(/\(.*\)$/.test(t) && set.has(t.replace(/\s*\(.*\)$/, ""))));
  const enemyPages = await pages(wanted);
  const enemies: Enemy[] = [];
  for (const [, page] of enemyPages) {
    const t = findTemplate(page.text, "Enemy Infobox");
    if (!t) continue;
    const info = templateParams(t);
    const name = page.title;
    const statsT = findTemplate(page.text, "Enemy Stats");
    const stats = statsT ? templateParams(statsT) : {};
    const res: Record<string, number> = {};
    const debuffRes: Record<string, number> = {};
    for (const [k, v] of Object.entries(stats)) {
      const m = /^(\w+)_res$/.exec(k);
      if (!m || !v || isNaN(Number(v))) continue;
      if (ELEMENT[m[1]]) res[ELEMENT[m[1]]] = Number(v);
      else debuffRes[m[1].replace(/_/g, " ")] = Number(v);
    }
    const skillsT = findTemplate(page.text, "Enemy Skills");
    const sp = skillsT ? templateParams(skillsT) : {};
    const skills: Enemy["skills"] = [];
    for (let i = 1; sp[`name${i}`] !== undefined; i++) {
      const skill = { name: cleanWiki(sp[`name${i}`]), type: cleanWiki(sp[`type${i}`] ?? ""), desc: cleanWiki(sp[`desc${i}`] ?? "") };
      if (!skills.some((s) => s.name === skill.name && s.desc === skill.desc)) skills.push(skill);
    }
    const tier = cleanWiki(info.tier ?? "Normal") || "Normal";
    const releaseVersion = changeHistoryVersion(page.text) ?? "1.0";
    const num = (v: string | undefined) => (v && !isNaN(Number(v)) ? Number(v) : null);
    enemies.push({
      slug: enemySlug(name), name, tier,
      types: elements(info.type), weaknesses: elements(info.weakness), toughness: num(info.tough),
      faction: info.faction ? cleanWiki(info.faction).replace(/ \(Enemy Faction\)$/, "") || null : null,
      location: cleanWiki(info.location ?? "").replace(/\n+/g, "; "),
      abilities: (info.ability ?? "").split(";").map((a) => cleanWiki(a)).filter(Boolean),
      lore: description(section(page.text, "Enemy Info") || page.text),
      res, debuffRes, hp: num(stats.hp), spd: num(stats.spd), effectRes: num(stats.eres),
      skills, image: info.image ? cleanWiki(info.image).trim() || null : null,
      releaseVersion: VERSIONS.some((v) => v.version === releaseVersion) ? releaseVersion : "1.0",
      spoilerVersion: TIER_SPOILERS.test(tier) ? releaseVersion : null,
    });
  }
  const has = await existingFiles(enemies.flatMap((e) => (e.image ? [e.image] : [])));
  for (const e of enemies) if (e.image && !has(e.image)) e.image = null;
  // Same slug from different pages (rare): keep the first.
  const unique = [...new Map(enemies.map((e) => [e.slug, e])).values()];
  return unique.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const [areas, enemies] = [await importAreas(), await importEnemies()];
  await mkdir(OUT_DIR, { recursive: true });
  const meta = { source: "https://honkai-star-rail.fandom.com/ (CC BY-SA)", importedAt: new Date().toISOString().slice(0, 10) };
  await writeFile(path.join(OUT_DIR, "areas.json"), JSON.stringify({ ...meta, areas }) + "\n");
  await writeFile(path.join(OUT_DIR, "enemies.json"), JSON.stringify({ ...meta, enemies }, null, 1) + "\n");
  const markers = areas.reduce((n, a) => n + a.floors.reduce((m, f) => m + f.markers.length, 0), 0);
  console.log(`Imported ${areas.length} areas (${areas.reduce((n, a) => n + a.floors.length, 0)} maps, ${markers} markers) and ${enemies.length} enemies.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
