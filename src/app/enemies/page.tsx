import type { Metadata } from "next";
import { EnemyBrowser, type EnemySummary } from "@/components/enemies/EnemyBrowser";
import { getElements, getEnemies } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Enemies — Weaknesses, Resistances, Lore",
  description:
    "Every Honkai: Star Rail enemy through Version 4.6 — normal, elite, bosses and Echoes of War: weaknesses, Toughness, " +
    "resistances, skills, lore and where to find them. Filter by tier, weakness and faction. Story bosses stay spoiler-hidden.",
  alternates: { canonical: "/enemies" },
};

export default async function EnemiesPage() {
  const [enemies, elements] = await Promise.all([getEnemies(), getElements()]);
  const summaries: EnemySummary[] = enemies.map((e) => ({
    slug: e.slug, name: e.name, tier: e.tier, faction: e.faction, weaknesses: e.data.weaknesses, hasImage: !!e.data.image,
    releaseVersion: e.releaseVersion, spoilerVersion: e.spoilerVersion,
  }));
  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">Bestiary</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Enemies</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Everything the Trailblaze has fought, from Fragmentum creatures to Lords Ravager — with weaknesses, resistances,
          skills and lore. Story bosses stay hidden until your story progress reaches them.
        </p>
      </header>
      <EnemyBrowser enemies={summaries} elements={elements.map(({ slug, name }) => ({ slug, name }))} />
    </div>
  );
}
