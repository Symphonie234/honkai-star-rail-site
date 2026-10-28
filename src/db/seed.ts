import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { getTableName, notInArray, sql } from "drizzle-orm";
import type { PgColumn, PgTable, PgUpdateSetSource } from "drizzle-orm/pg-core";
import { areaSlug } from "../lib/area";
import { aeonImage } from "../lib/images";
import { db } from "./index";
import {
  aeonLore, aeons, areas, characterKits, characters, elements, enemies, factions, glossaryTerms, lightCones, materials, paths, relicSets,
  versions, worldChapters, worlds,
} from "./schema";
import {
  AEON_LORE, AEONS, AREAS, artOf, CHARACTERS, ELEMENTS, ENEMIES, FACTIONS, GLOSSARY, KITS, LIGHT_CONES, MATERIALS, PATHS, RELIC_SETS, VERSIONS,
  WORLD_CHAPTERS, WORLDS,
} from "./seed-data";

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

async function upsert<T extends PgTable>(table: T, key: PgColumn, rows: T["$inferInsert"][]) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]).filter((k) => toSnake(k) !== key.name);
  const set = Object.fromEntries(
    columns.map((k) => [k, sql.raw(`excluded.${toSnake(k)}`)]),
  ) as PgUpdateSetSource<T>;
  await db.insert(table).values(rows).onConflictDoUpdate({ target: key, set });
}

async function prune(table: PgTable, key: PgColumn, keep: string[]) {
  const deleted = await db.delete(table).where(notInArray(key, keep)).returning();
  if (deleted.length) console.log(`  pruned ${deleted.length} stale row(s) from ${getTableName(table)}`);
}

async function main() {
  await upsert(versions, versions.version, VERSIONS);
  await upsert(paths, paths.slug, PATHS);
  await upsert(elements, elements.slug, ELEMENTS);
  await upsert(worlds, worlds.slug, WORLDS);
  const hasArt = (url: string) => existsSync(path.join("public", url));
  await upsert(aeons, aeons.slug, AEONS.map(({ artFile, ...a }) => ({ ...a, image: artFile && hasArt(aeonImage(a.slug)) ? aeonImage(a.slug) : null })));
  await upsert(factions, factions.slug, FACTIONS);
  await upsert(characters, characters.slug, CHARACTERS.map((c) => ({ ...c, art: artOf(c) })));
  await upsert(worldChapters, worldChapters.slug, WORLD_CHAPTERS);
  await upsert(aeonLore, aeonLore.slug, AEON_LORE);
  await upsert(glossaryTerms, glossaryTerms.slug, GLOSSARY);
  await upsert(materials, materials.id, MATERIALS.map((m) => ({ ...m, slug: areaSlug(m.name) })));
  const kitRows = Object.entries(KITS).map(([characterSlug, kit]) => ({ characterSlug, kit }));
  await upsert(characterKits, characterKits.characterSlug, kitRows);
  const coneRows = LIGHT_CONES.map((lc) => ({
    slug: lc.slug, gameId: lc.id, name: lc.name, rarity: lc.rarity, pathSlug: lc.pathSlug, releaseVersion: lc.releaseVersion, data: lc,
  }));
  await upsert(lightCones, lightCones.slug, coneRows);
  const relicRows = RELIC_SETS.map((r) => ({ slug: r.slug, gameId: r.id, name: r.name, kind: r.kind, releaseVersion: r.releaseVersion, data: r }));
  await upsert(relicSets, relicSets.slug, relicRows);
  const areaRows = AREAS.map((a) => ({
    slug: a.slug, worldSlug: a.worldSlug, name: a.name, region: a.region, releaseVersion: a.releaseVersion,
    spoilerVersion: a.spoilerVersion, sortOrder: a.sortOrder, data: a,
  }));
  await upsert(areas, areas.slug, areaRows);
  const enemyRows = ENEMIES.map((e) => ({
    slug: e.slug, name: e.name, tier: e.tier, faction: e.faction, releaseVersion: e.releaseVersion, spoilerVersion: e.spoilerVersion, data: e,
  }));
  await upsert(enemies, enemies.slug, enemyRows);

  await prune(characterKits, characterKits.characterSlug, kitRows.map((k) => k.characterSlug));
  await prune(lightCones, lightCones.slug, coneRows.map((l) => l.slug));
  await prune(relicSets, relicSets.slug, relicRows.map((r) => r.slug));
  await prune(areas, areas.slug, areaRows.map((a) => a.slug));
  await prune(enemies, enemies.slug, enemyRows.map((e) => e.slug));
  await prune(materials, materials.id, MATERIALS.map((m) => m.id));
  await prune(characters, characters.slug, CHARACTERS.map((c) => c.slug));
  await prune(worldChapters, worldChapters.slug, WORLD_CHAPTERS.map((c) => c.slug));
  await prune(aeonLore, aeonLore.slug, AEON_LORE.map((l) => l.slug));
  await prune(glossaryTerms, glossaryTerms.slug, GLOSSARY.map((g) => g.slug));
  await prune(factions, factions.slug, FACTIONS.map((f) => f.slug));
  await prune(aeons, aeons.slug, AEONS.map((a) => a.slug));
  await prune(versions, versions.version, VERSIONS.map((v) => v.version));

  console.log(
    `Seeded ${VERSIONS.length} versions, ${PATHS.length} paths, ${AEONS.length} aeons (${AEON_LORE.length} lore sections), ` +
      `${ELEMENTS.length} elements, ${WORLDS.length} worlds, ${FACTIONS.length} factions, ${CHARACTERS.length} characters, ` +
      `${WORLD_CHAPTERS.length} chapters, ${GLOSSARY.length} glossary terms, ${kitRows.length} kits, ${coneRows.length} Light Cones, ` +
      `${relicRows.length} relic sets, ${areaRows.length} areas, ${enemyRows.length} enemies, ` +
      `${MATERIALS.length} materials.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
