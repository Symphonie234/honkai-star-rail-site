import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { cwSlug } from "../src/lib/currency-wars";
import {
  AEONS, AREAS, artOf, CHARACTERS, CURIOS, CURRENCY_WARS, DOMAINS, ELEMENTS, ENEMIES, KITS, LIGHT_CONES, MATERIALS, OCCURRENCES, PATHS, RELIC_SETS,
  WORLD_ART_SOURCES,
} from "../src/db/seed-data";
import {
  aeonImage, areaImage, characterIcon, cwEquipmentImage, cwInvestmentImage, cwUnitImage, characterPortrait, characterPreview, eidolonArt, elementIcon, enemyImage, gameIcon, simulatedEventImage,
  lightConeIcon, lightConePortrait, lightConePreview, mapIcon, mapImage, mapPinImage, pathIcon, worldImage,
} from "../src/lib/images";

const CACHE_DIR = path.join(".next", "cache", "hsr-art");

const STARRAILRES = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";
const WIKI_IMAGES = "https://static.wikia.nocookie.net/houkai-star-rail/images";
const WIKI_API = "https://honkai-star-rail.fandom.com/api.php";
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/png,image/*;q=0.8",
  Referer: "https://honkai-star-rail.fandom.com/",
};

const PATH_ICON_FILES: Record<string, string> = {
  destruction: "Destruction", hunt: "Hunt", erudition: "Erudition", harmony: "Harmony", nihility: "Nihility",
  preservation: "Preservation", abundance: "Abundance", remembrance: "Remembrance", elation: "Elation",
};

const ELEMENT_ICON_FILES: Record<string, string> = {
  physical: "Physical", fire: "Fire", ice: "Ice", lightning: "Thunder", wind: "Wind", quantum: "Quantum", imaginary: "Imaginary",
};

type Job = {
  label: string;
  out: string;
  source: () => Promise<string>;
  headers?: Record<string, string>;
  convert: (img: Sharp) => Sharp;
  optional?: boolean;
  fallback?: () => Promise<string>;
};

const force = process.argv.includes("--force");
const webp = (img: Sharp, quality = 85) => img.webp({ quality, alphaQuality: 90, effort: 5 });

async function wikiFileUrl(file: string) {
  const name = file.trim().replace(/ /g, "_").replace(/^./, (c) => c.toUpperCase());
  const hash = createHash("md5").update(name).digest("hex");
  return `${WIKI_IMAGES}/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(name)}/revision/latest`;
}

async function wikiApiUrl(file: string) {
  const url = `${WIKI_API}?action=query&format=json&redirects=1&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(`File:${file}`)}`;
  const res = await fetch(url, { headers: { "User-Agent": BROWSER_HEADERS["User-Agent"] }, signal: AbortSignal.timeout(60_000) });
  const data = (await res.json()) as { query: { pages: Record<string, { imageinfo?: { url: string }[] }> } };
  const info = Object.values(data.query.pages)[0]?.imageinfo?.[0];
  if (!info) throw new Error(`wiki file not found: ${file}`);
  return info.url;
}

const fromWiki = (file: string) => ({ source: () => wikiFileUrl(file), fallback: () => wikiApiUrl(file) });

function jobs(): Job[] {
  const list: Job[] = [];
  const gameIds = [...new Set(CHARACTERS.flatMap((c) => artOf(c).map((v) => v.gameId)))];
  for (const id of gameIds) {
    list.push(
      { label: `preview ${id}`, out: characterPreview(id), source: async () => `${STARRAILRES}/image/character_preview/${id}.png`, convert: (i) => webp(i) },
      { label: `portrait ${id}`, out: characterPortrait(id), source: async () => `${STARRAILRES}/image/character_portrait/${id}.png`, convert: (i) => webp(i) },
      { label: `icon ${id}`, out: characterIcon(id), source: async () => `${STARRAILRES}/icon/character/${id}.png`, convert: (i) => webp(i.resize(160), 82) },
    );
  }
  for (const p of PATHS) {
    const file = PATH_ICON_FILES[p.slug];
    if (!file) continue;
    list.push({ label: `path ${p.slug}`, out: pathIcon(p.slug), source: async () => `${STARRAILRES}/icon/path/${file}.png`, convert: (i) => webp(i.resize(128), 90) });
  }
  for (const e of ELEMENTS) {
    const file = ELEMENT_ICON_FILES[e.slug];
    if (!file) continue;
    list.push({ label: `element ${e.slug}`, out: elementIcon(e.slug), source: async () => `${STARRAILRES}/icon/element/${file}.png`, convert: (i) => webp(i.resize(96), 90) });
  }
  for (const [slug, file] of Object.entries(WORLD_ART_SOURCES)) {
    list.push({
      label: `world ${slug}`,
      out: worldImage(slug),
      ...fromWiki(file),
      headers: BROWSER_HEADERS,
      convert: (i) => webp(i.trim().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }), 88),
    });
  }
  const icons = new Set<string>(MATERIALS.map((m) => m.icon));
  for (const kit of Object.values(KITS)) {
    for (const s of kit.skills) icons.add(s.icon);
    for (const t of kit.majorTraces) icons.add(t.icon);
    for (const e of kit.eidolons) icons.add(e.icon);
    for (const b of kit.statBonuses) if (b.icon) icons.add(b.icon);
  }
  for (const set of RELIC_SETS) {
    icons.add(set.icon);
    for (const p of set.pieces) icons.add(p.icon);
  }
  for (const c of CURIOS) if (c.icon) icons.add(c.icon);
  for (const d of DOMAINS) if (d.icon) icons.add(d.icon);
  for (const o of OCCURRENCES) {
    list.push({
      label: `occurrence ${o.id}`, out: simulatedEventImage(o.image), source: async () => `${STARRAILRES}/${o.image}`,
      convert: (i) => webp(i.resize(960, 960, { fit: "inside", withoutEnlargement: true }), 82), optional: true,
    });
  }
  for (const icon of icons) {
    list.push({ label: `icon ${icon}`, out: gameIcon(icon), source: async () => `${STARRAILRES}/${icon}`, convert: (i) => webp(i.resize(128, 128, { fit: "inside", withoutEnlargement: true }), 88) });
  }
  for (const lc of LIGHT_CONES) {
    list.push(
      { label: `light cone ${lc.id}`, out: lightConePortrait(lc.id), source: async () => `${STARRAILRES}/image/light_cone_portrait/${lc.id}.png`, convert: (i) => webp(i, 86) },
      { label: `light cone preview ${lc.id}`, out: lightConePreview(lc.id), source: async () => `${STARRAILRES}/image/light_cone_preview/${lc.id}.png`, convert: (i) => webp(i, 86) },
      { label: `light cone icon ${lc.id}`, out: lightConeIcon(lc.id), source: async () => `${STARRAILRES}/icon/light_cone/${lc.id}.png`, convert: (i) => webp(i, 86) },
    );
  }
  for (const kit of Object.values(KITS)) {
    for (const e of kit.eidolons) {
      if (!e.art) continue;
      const file = e.art;
      list.push({
        label: `eidolon ${kit.gameId}-${e.rank}`,
        out: eidolonArt(kit.gameId, e.rank),
        ...fromWiki(file),
        headers: BROWSER_HEADERS,
        convert: (i) => webp(i.trim().resize(900, 900, { fit: "inside", withoutEnlargement: true }), 84),
      });
    }
  }
  const wikiJob = (label: string, out: string, file: string, convert: Job["convert"]): Job =>
    ({ label, out, ...fromWiki(file), headers: BROWSER_HEADERS, convert });
  const pins = new Set<string>();
  const mapIcons = new Set<string>();
  for (const area of AREAS) {
    if (area.image) list.push(wikiJob(`area ${area.slug}`, areaImage(area.slug), area.image, (i) => webp(i.resize(1280, 1280, { fit: "inside", withoutEnlargement: true }), 84)));
    for (const floor of area.floors) {
      list.push(wikiJob(`map ${area.slug} ${floor.label}`, mapImage(area.slug, floor.label), floor.image,
        (i) => webp(i.resize(3200, 3200, { fit: "inside", withoutEnlargement: true }), 80)));
      for (const m of floor.markers) if (m.image) pins.add(m.image);
    }
    for (const c of area.categories) if (c.icon) mapIcons.add(c.icon);
  }
  for (const file of pins) {
    list.push({ ...wikiJob(`pin ${file}`, mapPinImage(file), file, (i) => webp(i.resize(720, 720, { fit: "inside", withoutEnlargement: true }), 80)), optional: true });
  }
  for (const file of mapIcons) {
    list.push({ ...wikiJob(`map icon ${file}`, mapIcon(file), file, (i) => webp(i.resize(64, 64, { fit: "inside" }), 90)), optional: true });
  }
  for (const e of ENEMIES) {
    if (!e.image) continue;
    list.push({ ...wikiJob(`enemy ${e.slug}`, enemyImage(e.slug), e.image, (i) => webp(i.trim().resize(1400, 1400, { fit: "inside", withoutEnlargement: true }), 86)), optional: true });
  }
  const cw = (label: string, out: string, file: string, size: number): Job => ({
    ...wikiJob(label, out, file, (i) => webp(i.resize(size, size, { fit: "inside", withoutEnlargement: true }), 86)), optional: true,
  });
  for (const u of CURRENCY_WARS.units) if (u.image) list.push(cw(`cw unit ${u.slug}`, cwUnitImage(u.slug), u.image, 512));
  for (const e of CURRENCY_WARS.equipment) if (e.image) list.push(cw(`cw equipment ${e.slug}`, cwEquipmentImage(e.slug), e.image, 128));
  for (const inv of [...CURRENCY_WARS.environments, ...CURRENCY_WARS.strategies]) {
    if (inv.image) list.push(cw(`cw investment ${inv.name}`, cwInvestmentImage(cwSlug(inv.name)), inv.image, 128));
  }
  for (const a of AEONS) {
    if (!a.artFile) continue;
    list.push({
      label: `aeon ${a.slug}`,
      out: aeonImage(a.slug),
      ...fromWiki(a.artFile),
      headers: BROWSER_HEADERS,
      convert: (i) => webp(i.resize(1200, 1200, { fit: "inside", withoutEnlargement: true }), 86),
      optional: true,
    });
  }
  return list;
}

async function download(url: string, headers?: Record<string, string>, attempts = 3): Promise<Buffer> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(120_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.headers.get("content-type")?.startsWith("image/")) throw new Error(`not an image (${res.headers.get("content-type")})`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (i >= attempts) throw new Error(`${url}: ${err instanceof Error ? err.message : err}`);
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

async function run(job: Job): Promise<"fetched" | "skipped" | "cached" | "unavailable"> {
  const file = path.join("public", job.out);
  const cached = path.join(CACHE_DIR, job.out);
  if (!force && existsSync(file)) return "skipped";
  await mkdir(path.dirname(file), { recursive: true });
  if (!force && existsSync(cached)) {
    await copyFile(cached, file);
    return "cached";
  }
  let data: Buffer;
  try {
    try {
      data = await download(await job.source(), job.headers);
    } catch (err) {
      if (!job.fallback) throw err;
      data = await download(await job.fallback(), job.headers);
    }
  } catch (err) {
    if (job.optional) return "unavailable";
    throw err;
  }
  await job.convert(sharp(data)).toFile(file);
  await mkdir(path.dirname(cached), { recursive: true });
  await copyFile(file, cached);
  return "fetched";
}

async function main() {
  const queue = jobs();
  const counts = { fetched: 0, cached: 0, skipped: 0, unavailable: 0, failed: 0 };

  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        try {
          const result = await run(job);
          counts[result]++;
          if (result === "fetched") console.log(`  ${job.label}`);
        } catch (err) {
          counts.failed++;
          console.error(`  FAILED ${job.label}: ${err instanceof Error ? err.message : err}`);
        }
      }
    }),
  );

  console.log(
    `Art: ${counts.fetched} fetched, ${counts.cached} from build cache, ${counts.skipped} already present, ` +
      `${counts.unavailable} not available at the source, ${counts.failed} failed.`,
  );
  if (counts.failed) process.exit(1);
}

main();
