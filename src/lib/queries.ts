import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { aeons, characters, elements, factions, glossaryTerms, paths, worldChapters, worlds } from "@/db/schema";
import { compareVersions } from "@/lib/spoilers";

const withRefs = { element: true, path: true, faction: true, world: true } as const;

export const getCharacters = cache(() =>
  db.query.characters.findMany({ with: withRefs, orderBy: asc(characters.name) }),
);

export const getCharacter = cache((slug: string) =>
  db.query.characters.findFirst({ where: eq(characters.slug, slug), with: withRefs }),
);

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

export type CharacterWithRefs = Awaited<ReturnType<typeof getCharacters>>[number];

export const getGlossary = cache(() => db.query.glossaryTerms.findMany({ orderBy: asc(glossaryTerms.term) }));

export type GlossaryTerm = Awaited<ReturnType<typeof getGlossary>>[number];

/** Every version that appears in the content, ascending — the story-progress choices. */
export const getStoryVersions = cache(async () => {
  const [chars, ws, chapters, terms] = await Promise.all([
    db.select({ r: characters.releaseVersion, s: characters.spoilerVersion }).from(characters),
    db.select({ r: worlds.releaseVersion }).from(worlds),
    db.select({ s: worldChapters.spoilerVersion }).from(worldChapters),
    db.select({ s: glossaryTerms.spoilerVersion }).from(glossaryTerms),
  ]);
  const all = [...chars.flatMap((c) => [c.r, c.s]), ...ws.map((w) => w.r), ...chapters.map((c) => c.s), ...terms.map((t) => t.s)];
  return [...new Set(all.filter((v): v is string => !!v))].sort(compareVersions);
});

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
