/*
 * Downloads character art from StarRailRes (github.com/Mar-7th/StarRailRes) and
 * stores it as WebP under public/art, so the site serves it itself instead of
 * hotlinking 4–6 MB PNGs (which made Next's image optimizer time out).
 *
 *   npm run art:fetch            fetch anything missing
 *   npm run art:fetch -- --force re-fetch everything
 *
 * Art © HoYoverse.
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { artOf, CHARACTERS } from "../src/db/seed-data";
import { ART_DIR, type ArtKind } from "../src/lib/images";

const SOURCE = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image";
const SOURCE_DIR: Record<ArtKind, string> = { preview: "character_preview", portrait: "character_portrait" };
const force = process.argv.includes("--force");

async function download(url: string, attempts = 3): Promise<Buffer> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (i >= attempts) throw new Error(`${url}: ${err instanceof Error ? err.message : err}`);
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

async function fetchOne(gameId: string, kind: ArtKind) {
  const out = path.join("public", ART_DIR, kind, `${gameId}.webp`);
  if (!force && existsSync(out)) return "skipped";
  const png = await download(`${SOURCE}/${SOURCE_DIR[kind]}/${gameId}.png`);
  await mkdir(path.dirname(out), { recursive: true });
  // Portraits keep full 2048px resolution for the full-screen viewer; alphaQuality
  // keeps the soft edges of the transparent backgrounds clean.
  await sharp(png).webp({ quality: 85, alphaQuality: 90, effort: 5 }).toFile(out);
  return "fetched";
}

async function main() {
  const ids = [...new Set(CHARACTERS.flatMap((c) => artOf(c).map((v) => v.gameId)))];
  const jobs = ids.flatMap((id) => (["preview", "portrait"] as const).map((kind) => ({ id, kind })));
  const counts = { fetched: 0, skipped: 0, failed: 0 };

  // A few downloads at a time.
  const queue = [...jobs];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        try {
          const result = await fetchOne(job.id, job.kind);
          counts[result]++;
          if (result === "fetched") console.log(`  ${job.kind} ${job.id}`);
        } catch (err) {
          counts.failed++;
          console.error(`  FAILED ${job.kind} ${job.id}: ${err instanceof Error ? err.message : err}`);
        }
      }
    }),
  );

  console.log(`Art: ${counts.fetched} fetched, ${counts.skipped} already present, ${counts.failed} failed.`);
  if (counts.failed) process.exit(1);
}

main();
