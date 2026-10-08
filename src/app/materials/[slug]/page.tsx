import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterChip } from "@/components/characters/CharacterChip";
import { MaterialGroup, RARITY_BG } from "@/components/characters/kit/MaterialTiles";
import { GameText } from "@/components/GameText";
import { JsonLd } from "@/components/JsonLd";
import { AsOf } from "@/components/spoilers/AsOf";
import { gameIcon, lightConeIcon } from "@/lib/images";
import { getMaterial, getMaterialList, getMaterials, getMaterialUsage } from "@/lib/queries";
import { breadcrumbs } from "@/lib/site";

export async function generateStaticParams() {
  const list = await getMaterialList();
  return list.map((m) => ({ slug: m.slug }));
}

const plain = (s: string) => s.replace(/<\/?i>/g, "").replace(/\s+/g, " ");

export async function generateMetadata({ params }: PageProps<"/materials/[slug]">): Promise<Metadata> {
  const m = await getMaterial((await params).slug);
  if (!m) return {};
  const title = `${m.name} — ${m.category || "Material"}`;
  const description = `${m.name} (${m.rarity}★) in Honkai: Star Rail. ${plain(m.description)} ${m.sources.length ? `Obtained from: ${m.sources.join(", ")}.` : ""}`.slice(0, 300);
  return { title, description, alternates: { canonical: `/materials/${m.slug}` }, openGraph: { title, description, images: [gameIcon(m.icon)] } };
}

export default async function MaterialPage({ params }: PageProps<"/materials/[slug]">) {
  const m = await getMaterial((await params).slug);
  if (!m) notFound();
  const [usage, materials] = await Promise.all([getMaterialUsage(m.id), getMaterials()]);
  const { characterUses, lightConeUses } = usage;

  return (
    <article className="mx-auto w-[min(100%-2rem,1200px)] py-12">
      <JsonLd data={breadcrumbs([{ name: "Materials", path: "/materials" }, { name: m.name, path: `/materials/${m.slug}` }])} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/materials" className="transition-colors hover:text-ink">← Materials</Link>
      </nav>

      <header className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
        <span className={`grid size-36 shrink-0 place-items-center rounded-3xl bg-gradient-to-b ${RARITY_BG[m.rarity] ?? RARITY_BG[1]}`}>
          <Image src={gameIcon(m.icon)} alt="" width={112} height={112} loading="eager" />
        </span>
        <div className="max-w-2xl">
          <p className="eyebrow">{m.category || "Material"} · <span className="text-gold">{"★".repeat(m.rarity)}</span></p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{m.name}</h1>
          {m.description && <div className="mt-4 text-lg leading-relaxed text-muted"><GameText text={m.description} /></div>}
          {m.story && (
            <blockquote className="glass mt-5 rounded-2xl border-l-2 !border-l-gold p-5 leading-relaxed text-muted [&_em]:text-ink/90">
              <GameText text={m.story} />
            </blockquote>
          )}
        </div>
      </header>

      <section className="mt-14 grid gap-4 md:grid-cols-2" aria-label="How to obtain">
        {m.sources.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <h2 className="eyebrow mb-3">Where to get it</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {m.sources.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        )}
        {m.synthesis && (
          <div className="glass rounded-2xl p-5">
            <h2 className="eyebrow mb-3">Synthesis</h2>
            <MaterialGroup title="Omni-Synthesizer recipe" items={m.synthesis.items.map((i) => ({ id: i.id, num: i.count }))} materials={materials} />
            {m.synthesis.credits ? <p className="mt-3 text-sm text-muted">Plus {m.synthesis.credits.toLocaleString("en-US")} Credits per craft.</p> : null}
          </div>
        )}
      </section>

      {characterUses.length > 0 && (
        <section className="mt-14" aria-labelledby="chars-title">
          <h2 id="chars-title" className="font-display text-2xl font-bold">Characters who need it</h2>
          <p className="mt-2 text-sm text-muted">Totals to fully ascend (Lv. 1 → 80) and to max every Trace.</p>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {characterUses.sort((a, b) => b.ascension + b.traces - (a.ascension + a.traces)).map(({ character: c, ascension, traces }) => (
              <AsOf key={c.slug} version={c.releaseVersion}>
                <li className="flex items-center justify-between gap-3 rounded-2xl border border-line p-2 pr-4">
                  <CharacterChip slug={c.slug} name={c.name} rarity={c.rarity} elementSlug={c.elementSlug} art={c.art} />
                  <span className="text-right text-xs leading-tight text-muted tabular-nums">
                    {ascension > 0 && <span className="block"><b className="text-ink">{ascension}</b> ascension</span>}
                    {traces > 0 && <span className="block"><b className="text-ink">{traces}</b> Traces</span>}
                  </span>
                </li>
              </AsOf>
            ))}
          </ul>
        </section>
      )}

      {lightConeUses.length > 0 && (
        <section className="mt-14" aria-labelledby="lc-title">
          <h2 id="lc-title" className="font-display text-2xl font-bold">Light Cones that need it</h2>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lightConeUses.map(({ lightCone: lc, num }) => (
              <AsOf key={lc.slug} version={lc.releaseVersion ?? "1.0"}>
                <li>
                  <Link href={`/light-cones/${lc.slug}`} className="flex items-center gap-3 rounded-2xl border border-line p-2 pr-4 transition hover:border-gold">
                    <Image src={lightConeIcon(lc.gameId)} alt="" width={44} height={44} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{lc.name}</span>
                    <span className="text-xs text-muted tabular-nums"><b className="text-ink">{num}</b> total</span>
                  </Link>
                </li>
              </AsOf>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
