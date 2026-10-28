import type { Metadata } from "next";
import Link from "next/link";
import { CharacterChip } from "@/components/characters/CharacterChip";
import { Spoiler } from "@/components/Spoiler";
import { AsOf } from "@/components/spoilers/AsOf";
import { colorVar } from "@/lib/theme";
import { getVersions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Version Timeline — Every Update & Character Release",
  description:
    "Every Honkai: Star Rail version from 1.0 to 4.6 — official update titles, release dates and the characters each one introduced.",
  alternates: { canonical: "/versions" },
};

const ERAS: Record<number, { title: string; blurb: string }> = {
  4: { title: "The Planarcadia Era", blurb: "Himeko's homeland, the Phantasmoon Games and the Path of Elation — then on to Astropolis." },
  3: { title: "The Amphoreus Era", blurb: "From Paean of Era Nova to the end of the Flame-Chase, and its epilogue." },
  2: { title: "The Penacony Era", blurb: "The Planet of Festivities, its Dreamscape — and new trouble across the Xianzhou fleet." },
  1: { title: "The Journey Begins", blurb: "Herta Space Station, Jarilo-VI and the Xianzhou Luofu." },
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default async function VersionsPage() {
  const versions = await getVersions();
  const eras = Map.groupBy(versions, (v) => v.major);

  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-12">
        <p className="eyebrow">Version timeline</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Every Update, 1.0 – 4.6</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Each version&apos;s official title, release date and the travelers it brought aboard — newest first, through
          Version 4.6 on Planarcadia and Astropolis.
        </p>
      </header>

      <div className="flex flex-col gap-16">
        {[...eras].map(([major, list]) => (
          <AsOf key={major} version={`${major}.0`}>
            <section aria-labelledby={`era-${major}`}>
              <h2 id={`era-${major}`} className="font-display text-3xl font-bold text-gold">{ERAS[major]?.title ?? `Version ${major}.x`}</h2>
              {ERAS[major] && <p className="mt-1 text-muted">{ERAS[major].blurb}</p>}

              <ol className="mt-8 flex flex-col gap-4 border-l border-dashed border-line pl-6 sm:pl-8">
                {list.map((v) => (
                  <AsOf key={v.version} version={v.version}>
                    <li id={`v${v.version}`} className="relative scroll-mt-24">
                      <span aria-hidden="true" className="absolute top-6 -left-[calc(1.5rem+5px)] size-2.5 rounded-full bg-gold shadow-[0_0_10px_var(--color-gold)] sm:-left-[calc(2rem+5px)]" />
                      <article className="glass rounded-2xl p-5 sm:p-6">
                        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                          <h3 className="font-display text-2xl font-bold">
                            <span className="text-gold">{v.version}</span> · {v.title}
                          </h3>
                          <time dateTime={v.releaseDate} className="text-sm text-muted">{formatDate(v.releaseDate)}</time>
                        </header>
                        {v.chapters.length > 0 && (
                          <ul className="mt-4 flex flex-col gap-1.5" aria-label={`Story in ${v.version}`}>
                            {v.chapters.map((ch) => {
                              const link = (
                                <Link href={`/worlds/${ch.worldSlug}#${ch.slug}`} className="font-semibold hover:text-[var(--c)]">
                                  {ch.title}
                                </Link>
                              );
                              return (
                                <li key={ch.slug} style={colorVar(ch.world.color)} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                                  <span className="text-xs font-semibold tracking-widest text-[var(--c)] uppercase">Story · {ch.world.name}</span>
                                  {ch.spoilerVersion ? <Spoiler version={ch.spoilerVersion}>{link}</Spoiler> : link}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {v.characters.length > 0 ? (
                          <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Characters released in ${v.version}`}>
                            {v.characters.map((c) => (
                              <li key={c.slug}>
                                <CharacterChip slug={c.slug} name={c.name} rarity={c.rarity} elementSlug={c.elementSlug} art={c.art} />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-muted">No new playable characters.</p>
                        )}
                      </article>
                    </li>
                  </AsOf>
                ))}
              </ol>
            </section>
          </AsOf>
        ))}
      </div>
    </div>
  );
}
