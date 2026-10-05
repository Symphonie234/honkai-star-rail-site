import "dotenv/config";
import { sql } from "drizzle-orm";
import type { PgTable, PgUpdateSetSource } from "drizzle-orm/pg-core";
import { db } from "./index";
import { characters, elements, factions, glossaryTerms, paths, worldChapters, worlds } from "./schema";
import { artOf, CHARACTERS, ELEMENTS, FACTIONS, GLOSSARY, PATHS, WORLD_CHAPTERS, WORLDS } from "./seed-data";

// Insert rows, or overwrite every non-key column when the slug already exists.
async function upsert<T extends PgTable & { slug: unknown }>(table: T, rows: T["$inferInsert"][]) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]).filter((k) => k !== "slug");
  const set = Object.fromEntries(
    columns.map((k) => [k, sql.raw(`excluded.${toSnake(k)}`)]),
  ) as PgUpdateSetSource<T>;
  await db.insert(table).values(rows).onConflictDoUpdate({ target: table.slug as never, set });
}

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

async function main() {
  // Lookup tables first, so character foreign keys resolve.
  await upsert(paths, PATHS);
  await upsert(elements, ELEMENTS);
  await upsert(worlds, WORLDS);
  await upsert(factions, FACTIONS);
  await upsert(characters, CHARACTERS.map((c) => ({ ...c, art: artOf(c) })));
  await upsert(worldChapters, WORLD_CHAPTERS);
  await upsert(glossaryTerms, GLOSSARY);
  console.log(`Seeded ${PATHS.length} paths, ${ELEMENTS.length} elements, ${WORLDS.length} worlds, ` +
    `${FACTIONS.length} factions, ${CHARACTERS.length} characters, ${WORLD_CHAPTERS.length} chapters, ${GLOSSARY.length} glossary terms.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
