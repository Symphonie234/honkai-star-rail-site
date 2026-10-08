import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { CharacterChip } from "@/components/characters/CharacterChip";
import { MaterialGroup } from "@/components/characters/kit/MaterialTiles";
import { GameText } from "@/components/GameText";
import { JsonLd } from "@/components/JsonLd";
import { LightConePassive } from "@/components/light-cones/LightConePassive";
import { AsOf, NotYet } from "@/components/spoilers/AsOf";
import { ZoomableImage } from "@/components/viewer/ZoomableImage";
import { fillDescription } from "@/lib/kit";
import { rarityColor } from "@/lib/light-cone";
import { lightConePortrait, pathIcon } from "@/lib/images";
import { getCharacters, getLightCone, getLightCones, getMaterials } from "@/lib/queries";
import { breadcrumbs } from "@/lib/site";

export async function generateStaticParams() {
  const lightCones = await getLightCones();
  return lightCones.map((lc) => ({ slug: lc.slug }));
}

/** The passive at S1 as plain text, for descriptions. */
const passiveText = (desc: string, params: number[]) =>
  fillDescription(desc, params).map((p) => (typeof p === "string" ? p : p.value)).join("").replace(/\s+/g, " ");

export async function generateMetadata({ params }: PageProps<"/light-cones/[slug]">): Promise<Metadata> {
  const lc = await getLightCone((await params).slug);
  if (!lc) return {};
  const title = `${lc.name} — ${lc.rarity}★ ${lc.path.name} Light Cone`;
  const description =
    `${lc.name} is a ${lc.rarity}-star ${lc.path.name} Light Cone in Honkai: Star Rail` +
    `${lc.releaseVersion ? `, released in Version ${lc.releaseVersion}` : ""}. ${lc.data.skill}: ` +
    `${passiveText(lc.data.desc, lc.data.params[0])}`.slice(0, 300);
  const image = lightConePortrait(lc.gameId);
  return {
    title,
    description,
    alternates: { canonical: `/light-cones/${lc.slug}` },
    openGraph: { title, description, images: [{ url: image, alt: lc.name }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function LightConePage({ params }: PageProps<"/light-cones/[slug]">) {
  const lc = await getLightCone((await params).slug);
  if (!lc) notFound();

  const [characters, materials] = await Promise.all([getCharacters(), getMaterials()]);
  const data = lc.data;
  const signature = characters.filter((c) => data.signature.includes(c.slug));
  const pathCharacters = characters.filter((c) => c.pathSlug === lc.pathSlug && !data.signature.includes(c.slug));
  const max = data.stats.at(-1)!;
  const released = lc.releaseVersion ?? "1.0";

  return (
    <AsOf version={released} fallback={<NotYet what={lc.name} version={released} />}>
      <article style={{ "--c": rarityColor(lc.rarity) } as CSSProperties} className="mx-auto w-[min(100%-2rem,1200px)] py-12">
        <JsonLd data={breadcrumbs([{ name: "Light Cones", path: "/light-cones" }, { name: lc.name, path: `/light-cones/${lc.slug}` }])} />
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/light-cones" className="transition-colors hover:text-ink">← Light Cones</Link>
        </nav>

        <header className="mt-8 grid items-start gap-10 md:grid-cols-[minmax(0,380px)_1fr]">
          <div className="relative mx-auto w-full max-w-[380px]">
            <div aria-hidden="true" className="absolute inset-x-0 inset-y-[-10%] -z-10 bg-[radial-gradient(circle,color-mix(in_srgb,var(--c)_30%,transparent),transparent_65%)] blur-2xl" />
            <ZoomableImage src={lightConePortrait(lc.gameId)} title={lc.name} caption={`${lc.rarity}★ ${lc.path.name} Light Cone`}>
              <Image
                src={lightConePortrait(lc.gameId)}
                alt={`${lc.name} Light Cone art`}
                width={904}
                height={1260}
                sizes="(min-width: 768px) 380px, 90vw"
                loading="eager"
                fetchPriority="high"
                className="w-full drop-shadow-[0_24px_48px_rgb(0_0_0/0.6)]"
              />
            </ZoomableImage>
          </div>

          <div>
            <p className="eyebrow flex items-center gap-2 !text-[var(--c)]">
              <Image src={pathIcon(lc.pathSlug)} alt="" width={20} height={20} />
              {lc.path.name} · Light Cone
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{lc.name}</h1>
            <p className="mt-3 text-lg text-[var(--c)]" aria-label={`${lc.rarity}-star`}>{"★".repeat(lc.rarity)}</p>

            <dl className="mt-6 flex flex-wrap gap-2 text-sm">
              <Stat label="HP" value={max.hp} />
              <Stat label="ATK" value={max.atk} />
              <Stat label="DEF" value={max.def} />
              <div className="glass rounded-xl px-3 py-2">
                <dt className="text-[0.65rem] tracking-widest text-muted uppercase">Released</dt>
                <dd className="font-semibold">
                  <Link href={`/versions#v${released}`} className="text-gold hover:text-gold-strong">Version {released}</Link>
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted">Base stats at Lv. 80.</p>

            <section aria-labelledby="passive" className="glass mt-6 rounded-2xl p-5 sm:p-6">
              <h2 id="passive" className="eyebrow">Passive</h2>
              <LightConePassive skill={data.skill} desc={data.desc} params={data.params} className="mt-2" />
              <p className="mt-4 text-xs text-muted">Only takes effect for characters of the {lc.path.name} Path.</p>
            </section>

            {signature.length > 0 && (
              <section className="mt-6" aria-labelledby="signature">
                <h2 id="signature" className="eyebrow">Signature Light Cone of</h2>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {signature.map((c) => (
                    <li key={c.slug}>
                      <CharacterChip slug={c.slug} name={c.name} rarity={c.rarity} elementSlug={c.elementSlug} art={c.art} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </header>

        {data.lore && (
          <section className="mt-16" aria-labelledby="story">
            <h2 id="story" className="font-display text-2xl font-bold sm:text-3xl">Story</h2>
            <blockquote className="glass mt-6 rounded-2xl border-l-2 !border-l-[var(--c)] p-6 leading-relaxed text-muted sm:p-8 [&_em]:text-ink/90">
              <GameText text={data.lore} />
            </blockquote>
          </section>
        )}

        <section className="mt-16" aria-labelledby="stats">
          <h2 id="stats" className="font-display text-2xl font-bold sm:text-3xl">Stats & materials</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="glass overflow-x-auto rounded-2xl">
              <table className="w-full text-right text-sm tabular-nums">
                <caption className="sr-only">Base stats by level and ascension</caption>
                <thead className="border-b border-line text-xs tracking-widest text-muted uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 text-left font-semibold">Level</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">HP</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">ATK</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">DEF</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stats.map((s) => (
                    <tr key={`${s.level}-${s.ascension}`} className="border-b border-line/50 last:border-0">
                      <th scope="row" className="px-4 py-2 text-left font-normal">
                        Lv. {s.level}
                        {s.ascension > 0 && <span className="ml-1 text-xs text-muted">A{s.ascension}</span>}
                      </th>
                      <td className="px-4 py-2">{Math.round(s.hp)}</td>
                      <td className="px-4 py-2">{Math.round(s.atk)}</td>
                      <td className="px-4 py-2">{Math.round(s.def)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <MaterialGroup title="Ascension · Lv. 1 → 80" items={data.materials} materials={materials} />
          </div>
        </section>

        {pathCharacters.length > 0 && (
          <section className="mt-16" aria-labelledby="path-characters">
            <h2 id="path-characters" className="font-display text-2xl font-bold">Who can use it</h2>
            <p className="mt-2 text-muted">
              Every character of the {lc.path.name} Path{signature.length > 0 ? `, besides ${signature.map((c) => c.name).join(" & ")}` : ""}.
            </p>
            <ul className="mt-6 flex flex-wrap gap-3">
              {pathCharacters.map((c) => (
                <AsOf key={c.slug} version={c.releaseVersion}>
                  <li><CharacterChip slug={c.slug} name={c.name} rarity={c.rarity} elementSlug={c.elementSlug} art={c.art} /></li>
                </AsOf>
              ))}
            </ul>
          </section>
        )}
      </article>
    </AsOf>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-xl px-3 py-2">
      <dt className="text-[0.65rem] tracking-widest text-muted uppercase">{label}</dt>
      <dd className="font-semibold tabular-nums">{Math.round(value).toLocaleString("en-US")}</dd>
    </div>
  );
}
