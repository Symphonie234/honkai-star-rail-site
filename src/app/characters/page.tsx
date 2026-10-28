import type { Metadata } from "next";
import { CharacterBrowser } from "@/components/characters/CharacterBrowser";
import { getCharacters, getElements, getPaths } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Character Archive — Every Playable Character",
  description:
    "Every Honkai: Star Rail playable character through Version 4.6 — filter by combat type, Path and rarity, " +
    "and sort by release. Full kits, Eidolons, every Trailblazer Path and both March 7th forms included.",
  alternates: { canonical: "/characters" },
};

export default async function CharactersPage() {
  const [characters, elements, paths] = await Promise.all([getCharacters(), getElements(), getPaths()]);

  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">Fellow Travelers</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Character Archive</h1>
        <p className="mt-4 max-w-2xl text-muted">
          The crew of the Express, the Stellaron Hunters, and everyone met along the rails.
        </p>
      </header>
      <CharacterBrowser
        characters={characters}
        elements={elements.filter((e) => characters.some((c) => c.elementSlug === e.slug)).map(({ slug, name }) => ({ slug, name }))}
        paths={paths.filter((p) => characters.some((c) => c.pathSlug === p.slug)).map(({ slug, name }) => ({ slug, name }))}
      />
    </div>
  );
}
