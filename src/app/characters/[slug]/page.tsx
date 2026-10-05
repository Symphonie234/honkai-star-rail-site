import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CharacterCard, Stars } from "@/components/characters/CharacterCard";
import { PortraitShowcase } from "@/components/characters/PortraitShowcase";
import { LoreText } from "@/components/glossary/LoreText";
import { Spoiler } from "@/components/Spoiler";
import { characterPreview } from "@/lib/images";
import { getCharacter, getCharacters } from "@/lib/queries";
import { colorVar } from "@/lib/theme";

export async function generateStaticParams() {
  const characters = await getCharacters();
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/characters/[slug]">): Promise<Metadata> {
  const c = await getCharacter((await params).slug);
  if (!c) return {};
  return {
    title: c.name,
    description: `${c.name} — ${c.element.name} · ${c.path.name}. ${c.bio}`,
    openGraph: c.art[0] ? { images: [characterPreview(c.art[0].gameId)] } : undefined,
  };
}

export default async function CharacterPage({ params }: PageProps<"/characters/[slug]">) {
  const c = await getCharacter((await params).slug);
  if (!c) notFound();

  const pathmates = (await getCharacters()).filter((o) => o.pathSlug === c.pathSlug && o.slug !== c.slug);
  const faction = c.faction?.name ?? "Unaffiliated";

  return (
    <article style={colorVar(c.elementSlug)} className="mx-auto w-[min(100%-2rem,1200px)] py-12">
      <Link href="/characters" className="text-sm text-muted transition-colors hover:text-ink">
        ← Character Archive
      </Link>

      <header className="mt-8 grid items-start gap-8 md:grid-cols-[minmax(0,460px)_1fr] md:items-center">
        <PortraitShowcase
          slug={c.slug}
          name={c.name}
          caption={`${c.element.name} · ${c.path.name}`}
          art={c.art}
          spoilerVersion={c.spoilerVersion}
        />
        <div>
          <p className="eyebrow !text-[var(--c)]">
            {c.element.name} · {c.path.name}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">{c.name}</h1>
          <p className="mt-3 text-lg"><Stars rarity={c.rarity} /></p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"><LoreText text={c.bio} /></p>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact label="Faction">
              {c.spoilerVersion ? <Spoiler version={c.spoilerVersion}>{faction}</Spoiler> : faction}
            </Fact>
            <Fact label="Home world">
              {c.world ? (
                <Link href={`/worlds/${c.world.slug}`} className="text-gold hover:text-gold-strong">{c.world.name}</Link>
              ) : "—"}
            </Fact>
            <Fact label="Released">Version {c.releaseVersion}</Fact>
          </dl>
        </div>
      </header>

      <section className="mt-16 grid gap-6 md:grid-cols-2" aria-label="Combat">
        <div className="glass rounded-2xl p-6">
          <p className="eyebrow">Path · Aeon {c.path.aeon}</p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            <span aria-hidden="true" className="mr-2 text-gold">{c.path.icon}</span>
            {c.path.name}
          </h2>
          <p className="mt-3 text-muted"><LoreText text={c.path.blurb} /></p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="eyebrow">Combat type</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[var(--c)]">{c.element.name}</h2>
          <p className="mt-3 text-muted">{c.element.description}</p>
        </div>
      </section>

      {pathmates.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Also walking {c.path.name}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pathmates.map((o) => (
              <li key={o.slug}><CharacterCard c={o} /></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs tracking-widest text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-semibold">{children}</dd>
    </div>
  );
}
