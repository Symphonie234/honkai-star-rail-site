import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { getTableName, notInArray, sql } from "drizzle-orm";
import type { PgColumn, PgTable, PgUpdateSetSource } from "drizzle-orm/pg-core";
import { aeonImage } from "../lib/images";
import { db } from "./index";
import {
  aeonLore, aeons, characterKits, characters, elements, factions, glossaryTerms, lightCones, materials, paths, versions, worldChapters, worlds,
} from "./schema";
import {
  AEON_LORE, AEONS, artOf, CHARACTERS, ELEMENTS, FACTIONS, GLOSSARY, KITS, LIGHT_CONES, MATERIALS, PATHS, VERSIONS, WORLD_CHAPTERS, WORLDS,
} from "./seed-data";

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

// Insert rows, or overwrite every non-key column when the key already exists.
async function upsert<T extends PgTable>(table: T, key: PgColumn, rows: T["$inferInsert"][]) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]).filter((k) => toSnake(k) !== key.name);
  const set = Object.fromEntries(
    columns.map((k) => [k, sql.raw(`excluded.${toSnake(k)}`)]),
  ) as PgUpdateSetSource<T>;
  await db.insert(table).values(rows).onConflictDoUpdate({ target: key, set });
}

// Delete rows whose key is no longer in the data (renamed or removed entries).
async function prune(table: PgTable, key: PgColumn, keep: string[]) {
  const deleted = await db.delete(table).where(notInArray(key, keep)).returning();
  if (deleted.length) console.log(`  pruned ${deleted.length} stale row(s) from ${getTableName(table)}`);
}

async function main() {
  // Referenced tables first, so foreign keys resolve.
  await upsert(versions, versions.version, VERSIONS);
  await upsert(paths, paths.slug, PATHS);
  await upsert(elements, elements.slug, ELEMENTS);
  await upsert(worlds, worlds.slug, WORLDS);
  // Point at Aeon art only if art:fetch actually found it (some Aeons have none).
  const hasArt = (url: string) => existsSync(path.join("public", url));
  await upsert(aeons, aeons.slug, AEONS.map(({ artFile, ...a }) => ({ ...a, image: artFile && hasArt(aeonImage(a.slug)) ? aeonImage(a.slug) : null })));
  await upsert(factions, factions.slug, FACTIONS);
  await upsert(characters, characters.slug, CHARACTERS.map((c) => ({ ...c, art: artOf(c) })));
  await upsert(worldChapters, worldChapters.slug, WORLD_CHAPTERS);
  await upsert(aeonLore, aeonLore.slug, AEON_LORE);
  await upsert(glossaryTerms, glossaryTerms.slug, GLOSSARY);
  await upsert(materials, materials.id, MATERIALS);
  const kitRows = Object.entries(KITS).map(([characterSlug, kit]) => ({ characterSlug, kit }));
  await upsert(characterKits, characterKits.characterSlug, kitRows);
  const coneRows = LIGHT_CONES.map((lc) => ({
    slug: lc.slug, gameId: lc.id, name: lc.name, rarity: lc.rarity, pathSlug: lc.pathSlug, releaseVersion: lc.releaseVersion, data: lc,
  }));
  await upsert(lightCones, lightCones.slug, coneRows);

  // Dependents first, so nothing still references a pruned row.
  await prune(characterKits, characterKits.characterSlug, kitRows.map((k) => k.characterSlug));
  await prune(lightCones, lightCones.slug, coneRows.map((l) => l.slug));
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
      `${MATERIALS.length} materials.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
