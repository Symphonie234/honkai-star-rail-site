import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { LoreText } from "@/components/glossary/LoreText";
import { Spoiler } from "@/components/Spoiler";
import { AsOf, NotYet } from "@/components/spoilers/AsOf";
import { WorldArt } from "@/components/worlds/WorldArt";
import { getWorld, getWorlds } from "@/lib/queries";
import { compareVersions } from "@/lib/spoilers";
import { colorVar } from "@/lib/theme";

export async function generateStaticParams() {
  const worlds = await getWorlds();
  return worlds.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/worlds/[slug]">): Promise<Metadata> {
  const w = await getWorld((await params).slug);
  if (!w) return {};
  return { title: w.name, description: `${w.tagline}. ${w.description}` };
}

export default async function WorldPage({ params }: PageProps<"/worlds/[slug]">) {
  const w = await getWorld((await params).slug);
  if (!w) notFound();

  const worlds = await getWorlds();
  const i = worlds.findIndex((o) => o.slug === w.slug);
  const prev = worlds[i - 1];
  const next = worlds[i + 1];

  // Factions present, derived from the characters who call this world home. Characters with
  // a spoiler version are skipped: their faction may be the reveal (e.g. Firefly). Each
  // faction shows from the later of its first story appearance and its first member here.
  const factionsBySlug = new Map<string, { slug: string; name: string; version: string }>();
  for (const c of w.characters) {
    if (!c.faction || c.spoilerVersion) continue;
    const from = [c.faction.introducedVersion, c.releaseVersion].sort(compareVersions)[1];
    const seen = factionsBySlug.get(c.faction.slug);
    if (!seen || compareVersions(from, seen.version) < 0) factionsBySlug.set(c.faction.slug, { ...c.faction, version: from });
  }
  const factions = [...factionsBySlug.values()];

  return (
    <AsOf version={w.releaseVersion} fallback={<NotYet what={w.name} version={w.releaseVersion} />}>
      <article style={colorVar(w.color)} className="mx-auto w-[min(100%-2rem,1200px)] py-12">
        <Link href="/worlds" className="text-sm text-muted transition-colors hover:text-ink">
          ← Star map
        </Link>

        <header className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="eyebrow !text-[var(--c)]">
              Stop {String(w.arcOrder).padStart(2, "0")} · Since version {w.releaseVersion}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl lg:text-6xl">{w.name}</h1>
            <p className="mt-3 font-display text-xl text-[var(--c)]">{w.tagline}</p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"><LoreText text={w.description} /></p>
          </div>
          <div className="relative order-first mx-auto grid place-items-center md:order-none md:px-6">
            {/* A soft halo in the world's color behind the render. */}
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--c)_25%,transparent),transparent_65%)] blur-2xl" />
            <WorldArt image={w.image} size="size-56 sm:size-72 md:size-64 lg:size-80" sizes="(min-width: 1024px) 320px, 288px" float priority />
          </div>
        </header>

        {w.chapters.length > 0 && (
          <section className="mt-16" aria-labelledby="story-title">
            <h2 id="story-title" className="font-display text-2xl font-bold sm:text-3xl">The story so far</h2>
            <ol className="mt-6 flex flex-col gap-4">
              {w.chapters.map((ch, n) => {
                const body = (
                  <div className="glass rounded-2xl p-6 sm:p-8">
                    <p className="eyebrow !text-[var(--c)]">Chapter {n + 1} · Version {ch.version}</p>
                    <h3 className="mt-2 font-display text-xl font-bold">{ch.title}</h3>
                    <div className="mt-4 flex max-w-3xl flex-col gap-4 leading-relaxed text-muted">
                      {ch.body.split(/\n\s*\n/).map((p, k) => <p key={k}><LoreText text={p} /></p>)}
                    </div>
                  </div>
                );
                return (
                  <AsOf key={ch.slug} version={ch.version}>
                    <li id={ch.slug} className="scroll-mt-24">
                      {ch.spoilerVersion ? <Spoiler version={ch.spoilerVersion} block>{body}</Spoiler> : body}
                    </li>
                  </AsOf>
                );
              })}
            </ol>
          </section>
        )}

        {w.characters.length > 0 && (
          <section className="mt-16" aria-labelledby="travelers-title">
            <h2 id="travelers-title" className="font-display text-2xl font-bold sm:text-3xl">Travelers from {w.name}</h2>
            {factions.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Factions">
                {factions.map((f) => (
                  <AsOf key={f.slug} version={f.version}>
                    <li className="rounded-full border border-line px-3 py-1 text-sm text-muted">{f.name}</li>
                  </AsOf>
                ))}
              </ul>
            )}
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {w.characters.map((c) => (
                <AsOf key={c.slug} version={c.releaseVersion}>
                  <li><CharacterCard c={c} /></li>
                </AsOf>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Other stops" className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/worlds/${prev.slug}`} className="group">
              <span className="text-xs tracking-widest text-muted uppercase">← Previous stop</span>
              <span className="block font-display text-lg font-bold group-hover:text-gold">{prev.name}</span>
            </Link>
          ) : <span />}
          {next && (
            <AsOf version={next.releaseVersion}>
              <Link href={`/worlds/${next.slug}`} className="group sm:text-right">
                <span className="text-xs tracking-widest text-muted uppercase">Next stop →</span>
                <span className="block font-display text-lg font-bold group-hover:text-gold">{next.name}</span>
              </Link>
            </AsOf>
          )}
        </nav>
      </article>
    </AsOf>
  );
}
