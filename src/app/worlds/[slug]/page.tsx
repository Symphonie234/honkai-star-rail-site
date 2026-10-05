import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { Spoiler } from "@/components/Spoiler";
import { Planet } from "@/components/worlds/StarMap";
import { getWorld, getWorlds } from "@/lib/queries";
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

  // Factions present, derived from the characters who call this world home.
  const factions = [...new Map(w.characters.flatMap((c) => (c.faction ? [[c.faction.slug, c.faction]] : []))).values()];

  return (
    <article style={colorVar(w.color)} className="mx-auto w-[min(100%-2rem,1200px)] py-12">
      <Link href="/worlds" className="text-sm text-muted transition-colors hover:text-ink">
        ← Star map
      </Link>

      <header className="mt-8 grid items-center gap-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow !text-[var(--c)]">
            Stop {String(w.arcOrder).padStart(2, "0")} · Since version {w.releaseVersion}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">{w.name}</h1>
          <p className="mt-3 font-display text-xl text-[var(--c)]">{w.tagline}</p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{w.description}</p>
        </div>
        <div className="hidden px-16 md:block">
          <Planet size="size-40" />
        </div>
      </header>

      {w.chapters.length > 0 && (
        <section className="mt-16" aria-labelledby="story-title">
          <h2 id="story-title" className="font-display text-2xl font-bold sm:text-3xl">The story so far</h2>
          <ol className="mt-6 flex flex-col gap-4">
            {w.chapters.map((ch, n) => {
              const body = (
                <div className="glass rounded-2xl p-6 sm:p-8">
                  <p className="eyebrow !text-[var(--c)]">Chapter {n + 1}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{ch.title}</h3>
                  <div className="mt-4 flex max-w-3xl flex-col gap-4 leading-relaxed text-muted">
                    {ch.body.split(/\n\s*\n/).map((p, k) => <p key={k}>{p}</p>)}
                  </div>
                </div>
              );
              return (
                <li key={ch.slug}>
                  {ch.spoilerVersion ? <Spoiler version={ch.spoilerVersion} block>{body}</Spoiler> : body}
                </li>
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
                <li key={f.slug} className="rounded-full border border-line px-3 py-1 text-sm text-muted">{f.name}</li>
              ))}
            </ul>
          )}
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {w.characters.map((c) => (
              <li key={c.slug}><CharacterCard c={c} /></li>
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
          <Link href={`/worlds/${next.slug}`} className="group sm:text-right">
            <span className="text-xs tracking-widest text-muted uppercase">Next stop →</span>
            <span className="block font-display text-lg font-bold group-hover:text-gold">{next.name}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
