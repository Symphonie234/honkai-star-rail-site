import type { Metadata } from "next";
import { LightConeBrowser, type LightConeSummary } from "@/components/light-cones/LightConeBrowser";
import { getCharacters, getLightCones, getPaths } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Light Cones — Every Light Cone, Stats and Passives",
  description:
    "Every Honkai: Star Rail Light Cone through Version 4.6 — 5★, 4★ and 3★ — with passives at every Superimposition, " +
    "base stats, ascension materials, signature characters and each Light Cone's story. Filter by Path and rarity.",
  alternates: { canonical: "/light-cones" },
};

export default async function LightConesPage() {
  const [lightCones, characters, paths] = await Promise.all([getLightCones(), getCharacters(), getPaths()]);
  const names = new Map(characters.map((c) => [c.slug, c.name]));

  const summaries: LightConeSummary[] = lightCones.map((lc) => ({
    slug: lc.slug,
    id: lc.gameId,
    name: lc.name,
    rarity: lc.rarity,
    pathSlug: lc.pathSlug,
    pathName: lc.path.name,
    releaseVersion: lc.releaseVersion,
    signature: lc.data.signature.map((s) => names.get(s) ?? s),
  }));

  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">Equipment</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Light Cones</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Memories of the cosmos crystallized into equipment. Each one strengthens characters who walk its Path, and each
          carries a story of its own.
        </p>
      </header>
      <LightConeBrowser
        lightCones={summaries}
        paths={paths.filter((p) => lightCones.some((lc) => lc.pathSlug === p.slug)).map(({ slug, name }) => ({ slug, name }))}
      />
    </div>
  );
}
