import { asc, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  aeonLore, aeons, areas, characterKits, characters, elements, enemies, factions, glossaryTerms, lightCones, materials, paths, relicSets,
  versions, worldChapters, worlds,
} from "@/db/schema";

const withRefs = { element: true, path: true, faction: true, world: true, version: true } as const;

export const getCharacters = cache(() =>
  db.query.characters.findMany({ with: withRefs, orderBy: asc(characters.name) }),
);

export const getCharacter = cache((slug: string) =>
  db.query.characters.findFirst({ where: eq(characters.slug, slug), with: withRefs }),
);

export type CharacterWithRefs = Awaited<ReturnType<typeof getCharacters>>[number];

export const getCharacterKit = cache(async (slug: string) => {
  const row = await db.query.characterKits.findFirst({ where: eq(characterKits.characterSlug, slug) });
  return row?.kit ?? null;
});

export const getMaterials = cache(async () => {
  const rows = await db.select().from(materials);
  return new Map(rows.map((m) => [m.id, m]));
});

export const getLightCones = cache(() =>
  db.query.lightCones.findMany({ with: { path: true }, orderBy: [desc(lightCones.rarity), asc(lightCones.name)] }),
);

export type LightConeWithPath = Awaited<ReturnType<typeof getLightCones>>[number];

export const getLightCone = cache((slug: string) =>
  db.query.lightCones.findFirst({ where: eq(lightCones.slug, slug), with: { path: true } }),
);

export const getLightConeByName = cache(async (name: string) => {
  const row = await db.query.lightCones.findFirst({ where: eq(lightCones.name, name) });
  return row?.data ?? null;
});

export const getMaterialList = cache(() => db.select().from(materials).orderBy(asc(materials.category), asc(materials.rarity), asc(materials.name)));

export type MaterialRow = Awaited<ReturnType<typeof getMaterialList>>[number];

export const getMaterial = cache(async (slug: string) => (await db.select().from(materials).where(eq(materials.slug, slug)))[0] ?? null);

export const getMaterialUsage = cache(async (id: string) => {
  const [kits, cones, chars] = await Promise.all([db.select().from(characterKits), getLightCones(), getCharacters()]);
  const byChar = new Map(chars.map((c) => [c.slug, c]));
  const characterUses = kits.flatMap(({ characterSlug, kit }) => {
    const ascension = kit.materials.ascension.find((m) => m.id === id)?.num ?? 0;
    const traces = kit.materials.traces.find((m) => m.id === id)?.num ?? 0;
    const c = byChar.get(characterSlug);
    return c && (ascension || traces) ? [{ character: c, ascension, traces }] : [];
  });
  const lightConeUses = cones.flatMap((lc) => {
    const num = lc.data.materials.find((m) => m.id === id)?.num ?? 0;
    return num ? [{ lightCone: lc, num }] : [];
  });
  return { characterUses, lightConeUses };
});

export const getRelicSets = cache(() => db.query.relicSets.findMany({ orderBy: asc(relicSets.gameId) }));
export const getRelicSet = cache((slug: string) => db.query.relicSets.findFirst({ where: eq(relicSets.slug, slug) }));

export const getEnemies = cache(() => db.query.enemies.findMany({ orderBy: asc(enemies.name) }));
export const getEnemy = cache((slug: string) => db.query.enemies.findFirst({ where: eq(enemies.slug, slug) }));
export type EnemyRow = Awaited<ReturnType<typeof getEnemies>>[number];

export const getAreaSummaries = cache((worldSlug?: string) =>
  db
    .select({
      slug: areas.slug, worldSlug: areas.worldSlug, name: areas.name, region: areas.region, releaseVersion: areas.releaseVersion,
      spoilerVersion: areas.spoilerVersion, sortOrder: areas.sortOrder,
      description: sql<string>`${areas.data}->>'description'`,
      image: sql<string | null>`${areas.data}->>'image'`,
      floors: sql<number>`jsonb_array_length(${areas.data}->'floors')`,
      markers: sql<number>`(select coalesce(sum(jsonb_array_length(f->'markers')), 0) from jsonb_array_elements(${areas.data}->'floors') f)::int`,
    })
    .from(areas)
    .where(worldSlug ? eq(areas.worldSlug, worldSlug) : undefined)
    .orderBy(asc(areas.sortOrder)),
);

export type AreaSummary = Awaited<ReturnType<typeof getAreaSummaries>>[number];

export const getArea = cache((slug: string) => db.query.areas.findFirst({ where: eq(areas.slug, slug), with: { world: true } }));

export const getEnemyAreas = cache(async (name: string) => {
  const rows = await db.select({ slug: areas.slug, worldSlug: areas.worldSlug, name: areas.name, releaseVersion: areas.releaseVersion, spoilerVersion: areas.spoilerVersion, enemies: sql<{ normal: string[]; elite: string[] }>`${areas.data}->'enemies'` }).from(areas).orderBy(asc(areas.sortOrder));
  return rows.filter((a) => a.enemies.normal.includes(name) || a.enemies.elite.includes(name));
});

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

export const getVersions = cache(() =>
  db.query.versions.findMany({
    orderBy: [desc(versions.major), desc(versions.minor)],
    with: {
      characters: { with: withRefs, orderBy: asc(characters.name) },
      chapters: { with: { world: true }, orderBy: asc(worldChapters.sortOrder) },
    },
  }),
);

export const getStoryVersions = cache(() =>
  db.select({ version: versions.version, title: versions.title }).from(versions).orderBy(asc(versions.major), asc(versions.minor)),
);

export const getAeons = cache(() =>
  db.query.aeons.findMany({ with: { path: true, factions: true }, orderBy: asc(aeons.sortOrder) }),
);

export const getAeon = cache((slug: string) =>
  db.query.aeons.findFirst({
    where: eq(aeons.slug, slug),
    with: { path: true, factions: true, lore: { orderBy: asc(aeonLore.sortOrder) } },
  }),
);

export const getPathCharacters = cache((pathSlug: string) =>
  db.query.characters.findMany({ where: eq(characters.pathSlug, pathSlug), with: withRefs, orderBy: asc(characters.name) }),
);

export const getAeonWeb = cache(async () => {
  const [aeonRows, factionRows, characterRows] = await Promise.all([
    db.query.aeons.findMany({ with: { path: true }, orderBy: asc(aeons.sortOrder) }),
    db.query.factions.findMany({ orderBy: asc(factions.name) }),
    db.query.characters.findMany({
      columns: {
        slug: true, name: true, pathSlug: true, factionSlug: true, elementSlug: true, art: true, spoilerVersion: true, releaseVersion: true,
      },
      orderBy: asc(characters.name),
    }),
  ]);
  return { aeons: aeonRows, factions: factionRows, characters: characterRows };
});

export type AeonWebData = Awaited<ReturnType<typeof getAeonWeb>>;
