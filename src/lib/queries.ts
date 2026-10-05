import { asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { aeonLore, aeons, characters, elements, factions, glossaryTerms, paths, versions, worldChapters, worlds } from "@/db/schema";

const withRefs = { element: true, path: true, faction: true, world: true, version: true } as const;

export const getCharacters = cache(() =>
  db.query.characters.findMany({ with: withRefs, orderBy: asc(characters.name) }),
);

export const getCharacter = cache((slug: string) =>
  db.query.characters.findFirst({ where: eq(characters.slug, slug), with: withRefs }),
);

export type CharacterWithRefs = Awaited<ReturnType<typeof getCharacters>>[number];

export const getElements = cache(() => db.query.elements.findMany({ orderBy: asc(elements.sortOrder) }));

export const getPaths = cache(() => db.query.paths.findMany({ orderBy: asc(paths.sortOrder) }));

export const getWorlds = cache(() => db.query.worlds.findMany({ orderBy: asc(worlds.arcOrder) }));

export const getWorld = cache((slug: string) =>
  db.query.worlds.findFirst({
    where: eq(worlds.slug, slug),
    with: {
      chapters: { orderBy: asc(worldChapters.sortOrder) },
      characters: { with: withRefs, orderBy: asc(characters.name) },
    },
  }),
);

export const getGlossary = cache(() => db.query.glossaryTerms.findMany({ orderBy: asc(glossaryTerms.term) }));

export type GlossaryTerm = Awaited<ReturnType<typeof getGlossary>>[number];

/** Versions, newest first, with the characters each released. */
export const getVersions = cache(() =>
  db.query.versions.findMany({
    orderBy: [desc(versions.major), desc(versions.minor)],
    with: { characters: { with: withRefs, orderBy: asc(characters.name) } },
  }),
);

/** Every version, ascending — the story-progress choices. */
export const getStoryVersions = cache(async () => {
  const rows = await db.select({ v: versions.version }).from(versions).orderBy(asc(versions.major), asc(versions.minor));
  return rows.map((r) => r.v);
});

export const getAeons = cache(() =>
  db.query.aeons.findMany({ with: { path: true, factions: true }, orderBy: asc(aeons.sortOrder) }),
);

export const getAeon = cache((slug: string) =>
  db.query.aeons.findFirst({
    where: eq(aeons.slug, slug),
    with: { path: true, factions: true, lore: { orderBy: asc(aeonLore.sortOrder) } },
  }),
);

/** Characters walking a Path, for an Aeon's page. */
export const getPathCharacters = cache((pathSlug: string) =>
  db.query.characters.findMany({ where: eq(characters.pathSlug, pathSlug), with: withRefs, orderBy: asc(characters.name) }),
);

/** Everything the Aeons web draws: Aeons, factions and characters, trimmed to what the graph needs. */
export const getAeonWeb = cache(async () => {
  const [aeonRows, factionRows, characterRows] = await Promise.all([
    db.query.aeons.findMany({ with: { path: true }, orderBy: asc(aeons.sortOrder) }),
    db.query.factions.findMany({ orderBy: asc(factions.name) }),
    db.query.characters.findMany({
      columns: { slug: true, name: true, pathSlug: true, factionSlug: true, elementSlug: true, art: true, spoilerVersion: true },
      orderBy: asc(characters.name),
    }),
  ]);
  return { aeons: aeonRows, factions: factionRows, characters: characterRows };
});

export type AeonWebData = Awaited<ReturnType<typeof getAeonWeb>>;
