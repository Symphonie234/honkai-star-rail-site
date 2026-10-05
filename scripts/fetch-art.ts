/*
 * Downloads game art and stores it as WebP under public/art, so the site serves
 * it itself instead of hotlinking multi-megabyte PNGs (which made Next's image
 * optimizer time out).
 *
 *   npm run art:fetch            fetch anything missing
 *   npm run art:fetch -- --force re-fetch everything
 *
 * public/art is not committed. Converted files are also kept in .next/cache/hsr-art,
 * which Vercel preserves between builds, so deploys (which run this via "prebuild")
 * only download what is new.
 *
 * Sources (art © HoYoverse):
 *  - Characters and Path icons: StarRailRes (github.com/Mar-7th/StarRailRes)
 *  - World renders and Aeon art: the Honkai: Star Rail Wiki on Fandom
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { AEONS, artOf, CHARACTERS, ELEMENTS, PATHS, WORLD_ART_SOURCES } from "../src/db/seed-data";
import { aeonImage, characterIcon, characterPortrait, characterPreview, elementIcon, pathIcon, worldImage } from "../src/lib/images";

const CACHE_DIR = path.join(".next", "cache", "hsr-art");

const STARRAILRES = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";
const WIKI_API = "https://honkai-star-rail.fandom.com/api.php";
// The wiki's image CDN serves a bot challenge to bare requests; browser-like headers get the image.
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/png,image/*;q=0.8",
  Referer: "https://honkai-star-rail.fandom.com/",
};

// StarRailRes names Path icons after the in-game Path IDs.
const PATH_ICON_FILES: Record<string, string> = {
  destruction: "Destruction", hunt: "Hunt", erudition: "Erudition", harmony: "Harmony", nihility: "Nihility",
  preservation: "Preservation", abundance: "Abundance", remembrance: "Remembrance", elation: "Elation",
};

// StarRailRes names combat type icons after the in-game IDs (Lightning is "Thunder").
const ELEMENT_ICON_FILES: Record<string, string> = {
  physical: "Physical", fire: "Fire", ice: "Ice", lightning: "Thunder", wind: "Wind", quantum: "Quantum", imaginary: "Imaginary",
};

type Job = {
  label: string;
  /** Public URL path, e.g. "/art/worlds/penacony.webp"; the file lives under public/. */
  out: string;
  source: () => Promise<string>;
  headers?: Record<string, string>;
  convert: (img: Sharp) => Sharp;
  /** Art that may not exist at the source (e.g. Aeons never depicted); a miss is not a failure. */
  optional?: boolean;
};

const force = process.argv.includes("--force");
const webp = (img: Sharp, quality = 85) => img.webp({ quality, alphaQuality: 90, effort: 5 });

/** Resolves a wiki file name to its CDN URL via the MediaWiki API. */
async function wikiFileUrl(file: string) {
  const url = `${WIKI_API}?action=query&titles=File:${encodeURIComponent(file)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": BROWSER_HEADERS["User-Agent"] } });
  const data = (await res.json()) as { query: { pages: Record<string, { imageinfo?: { url: string }[] }> } };
  const info = Object.values(data.query.pages)[0]?.imageinfo?.[0];
  if (!info) throw new Error(`wiki file not found: ${file}`);
  return info.url;
}

function jobs(): Job[] {
  const list: Job[] = [];
  const gameIds = [...new Set(CHARACTERS.flatMap((c) => artOf(c).map((v) => v.gameId)))];
  for (const id of gameIds) {
    list.push(
      { label: `preview ${id}`, out: characterPreview(id), source: async () => `${STARRAILRES}/image/character_preview/${id}.png`, convert: (i) => webp(i) },
      // Portraits keep their full 2048px for the full-screen viewer.
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
      source: () => wikiFileUrl(file),
      headers: BROWSER_HEADERS,
      // Trim the transparent margin so every world fills its frame alike.
      convert: (i) => webp(i.trim().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }), 88),
    });
  }
  for (const a of AEONS) {
    if (!a.artFile) continue;
    list.push({
      label: `aeon ${a.slug}`,
      out: aeonImage(a.slug),
      source: () => wikiFileUrl(a.artFile),
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
    data = await download(await job.source(), job.headers);
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

  // A few downloads at a time.
  await Promise.all(
    Array.from({ length: 4 }, async () => {
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
