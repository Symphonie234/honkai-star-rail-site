import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CharacterCard, Stars } from "@/components/characters/CharacterCard";
import { CharacterKit } from "@/components/characters/kit/CharacterKit";
import { PortraitShowcase } from "@/components/characters/PortraitShowcase";
import { LoreText } from "@/components/glossary/LoreText";
import { JsonLd } from "@/components/JsonLd";
import { Spoiler } from "@/components/Spoiler";
import { AsOf, NotYet } from "@/components/spoilers/AsOf";
import { characterPreview, pathIcon } from "@/lib/images";
import { getAeons, getCharacter, getCharacterKit, getCharacters, getLightConeByName, getMaterials } from "@/lib/queries";
import { breadcrumbs } from "@/lib/site";
import { colorVar } from "@/lib/theme";

export async function generateStaticParams() {
  const characters = await getCharacters();
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/characters/[slug]">): Promise<Metadata> {
  const c = await getCharacter((await params).slug);
  if (!c) return {};
  const title = `${c.name} — ${c.rarity}★ ${c.element.name} ${c.path.name}`;
  const description = `${c.name} is a ${c.rarity}-star ${c.element.name} character of the ${c.path.name} Path in Honkai: Star Rail, released in Version ${c.releaseVersion}. Skills, Traces, Eidolons, stats and materials. ${c.bio}`;
  const image = c.art[0] ? characterPreview(c.art[0].gameId) : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/characters/${c.slug}` },
    openGraph: { title, description, type: "profile", images: image ? [{ url: image, alt: c.name }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default async function CharacterPage({ params }: PageProps<"/characters/[slug]">) {
  const c = await getCharacter((await params).slug);
  if (!c) notFound();

  const [all, aeons, kit, materials, lightCone] = await Promise.all([
    getCharacters(), getAeons(), getCharacterKit(c.slug), getMaterials(), c.lightCone ? getLightConeByName(c.lightCone) : null,
  ]);
  const pathmates = all.filter((o) => o.pathSlug === c.pathSlug && o.slug !== c.slug);
  const aeon = aeons.find((a) => a.pathSlug === c.pathSlug);
  const faction = c.faction?.name ?? "Unaffiliated";

  return (
    <AsOf version={c.releaseVersion} fallback={<NotYet what={c.name} version={c.releaseVersion} />}>
      <article style={colorVar(c.elementSlug)} className="mx-auto w-[min(100%-2rem,1200px)] py-12">
        <JsonLd data={breadcrumbs([{ name: "Characters", path: "/characters" }, { name: c.name, path: `/characters/${c.slug}` }])} />
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/characters" className="transition-colors hover:text-ink">← Character Archive</Link>
        </nav>

        <header className="mt-8 grid items-start gap-8 md:grid-cols-[minmax(0,460px)_1fr] md:items-center">
          <PortraitShowcase
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

            <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              <Fact label="Faction">
                {c.spoilerVersion ? <Spoiler version={c.spoilerVersion}>{faction}</Spoiler> : faction}
              </Fact>
              <Fact label="Home world">
                {c.world ? (
                  <Link href={`/worlds/${c.world.slug}`} className="text-gold hover:text-gold-strong">{c.world.name}</Link>
                ) : "—"}
              </Fact>
              <Fact label="Released">
                <Link href={`/versions#v${c.releaseVersion}`} className="text-gold hover:text-gold-strong">
                  Version {c.releaseVersion}
                </Link>
                <span className="mt-0.5 block text-sm font-normal text-muted">
                  {c.version.title} · <time dateTime={c.releaseDate}>{formatDate(c.releaseDate)}</time>
                </span>
              </Fact>
              <Fact label="Signature Light Cone">
                {lightCone ? (
                  <Link href={`/light-cones/${lightCone.slug}`} className="text-gold hover:text-gold-strong">{lightCone.name}</Link>
                ) : (c.lightCone ?? <span className="text-muted">None</span>)}
              </Fact>
              <Fact label="English voice">{c.voiceEn ?? <span className="text-muted">—</span>}</Fact>
            </dl>
          </div>
        </header>

        <section className="mt-16 grid gap-6 md:grid-cols-2" aria-label="Path and combat type">
          <div className="glass rounded-2xl p-6">
            <p className="eyebrow">
              Path ·{" "}
              {aeon ? (
                <Link href={`/aeons/${aeon.slug}`} className="hover:text-gold">Aeon {aeon.name}</Link>
              ) : (
                <>Aeon {c.path.aeon}</>
              )}
            </p>
            <h2 className="mt-2 flex items-center gap-3 font-display text-2xl font-bold">
              <Image src={pathIcon(c.pathSlug)} alt="" width={32} height={32} />
              {c.path.name}
            </h2>
            <p className="mt-3 text-muted"><LoreText text={c.path.blurb} /></p>
            {aeon && (
              <Link href={`/aeons/${aeon.slug}`} className="mt-4 inline-block text-sm font-semibold text-gold hover:text-gold-strong">
                Read about {aeon.name}, the Aeon of {aeon.concept} →
              </Link>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="eyebrow">Combat type</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-[var(--c)]">{c.element.name}</h2>
            <p className="mt-3 text-muted">{c.element.description}</p>
          </div>
        </section>

        {kit && <CharacterKit name={c.name} kit={kit} materials={materials} lightCone={lightCone} />}

        {pathmates.length > 0 && (
          <section className="mt-16" aria-labelledby="pathmates">
            <h2 id="pathmates" className="font-display text-2xl font-bold">Also walking {c.path.name}</h2>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {pathmates.map((o) => (
                <AsOf key={o.slug} version={o.releaseVersion}>
                  <li><CharacterCard c={o} /></li>
                </AsOf>
              ))}
            </ul>
          </section>
        )}
      </article>
    </AsOf>
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
