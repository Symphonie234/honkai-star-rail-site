import type { Metadata } from "next";
import { CharacterBrowser } from "@/components/characters/CharacterBrowser";
import { getCharacters, getElements, getPaths } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Character Archive",
  description: "Every traveler of the Trailblaze — filter by combat type and Path.",
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
        elements={elements.map(({ slug, name }) => ({ slug, name }))}
        paths={paths.map(({ slug, name }) => ({ slug, name }))}
      />
    </div>
  );
}
