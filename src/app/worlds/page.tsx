import type { Metadata } from "next";
import Link from "next/link";
import { AsOf } from "@/components/spoilers/AsOf";
import { StarMap } from "@/components/worlds/StarMap";
import { WorldArt } from "@/components/worlds/WorldArt";
import { getWorlds } from "@/lib/queries";
import { colorVar } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Worlds",
  description:
    "Every stop on the Trailblaze — Herta Space Station, Jarilo-VI, the Xianzhou Luofu, Penacony, Amphoreus, Planarcadia and Astropolis — with story recaps and their people.",
  alternates: { canonical: "/worlds" },
};

export default async function WorldsPage() {
  const worlds = await getWorlds();

  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">Star map</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Worlds of the Trailblaze</h1>
        <p className="mt-4 max-w-2xl text-muted">
          The stations and planets the Express has visited, in the order the journey reached them.
        </p>
      </header>

      <StarMap worlds={worlds} />

      <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {worlds.map((w) => (
          <AsOf key={w.slug} version={w.releaseVersion}>
            <li>
              <Link
                href={`/worlds/${w.slug}`}
                style={colorVar(w.color)}
                className="glass group flex h-full gap-5 rounded-2xl p-6 transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-[var(--c)]"
              >
                <WorldArt image={w.image} size="size-16 shrink-0" sizes="64px" />
                <span>
                  <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-[var(--c)] uppercase">
                    Stop {String(w.arcOrder).padStart(2, "0")} · v{w.releaseVersion}
                  </span>
                  <span className="block font-display text-xl font-bold">{w.name}</span>
                  <span className="mt-2 block text-sm text-muted">{w.description}</span>
                </span>
              </Link>
            </li>
          </AsOf>
        ))}
      </ul>
    </div>
  );
}
