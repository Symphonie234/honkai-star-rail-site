import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { characters, elements, paths } from "@/db/schema";

const withRefs = { element: true, path: true, faction: true, world: true } as const;

export const getCharacters = cache(() =>
  db.query.characters.findMany({ with: withRefs, orderBy: asc(characters.name) }),
);

export const getCharacter = cache((slug: string) =>
  db.query.characters.findFirst({ where: eq(characters.slug, slug), with: withRefs }),
);

export const getElements = cache(() => db.query.elements.findMany({ orderBy: asc(elements.sortOrder) }));

export const getPaths = cache(() => db.query.paths.findMany({ orderBy: asc(paths.sortOrder) }));

export type CharacterWithRefs = Awaited<ReturnType<typeof getCharacters>>[number];
