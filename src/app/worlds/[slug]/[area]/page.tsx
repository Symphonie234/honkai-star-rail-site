import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GameText } from "@/components/GameText";
import { JsonLd } from "@/components/JsonLd";
import { Spoiler } from "@/components/Spoiler";
import { AsOf, NotYet } from "@/components/spoilers/AsOf";
import { ZoomableImage } from "@/components/viewer/ZoomableImage";
import { AreaMap } from "@/components/worlds/AreaMap";
import { areaImage } from "@/lib/images";
import { getArea, getAreaSummaries, getEnemies } from "@/lib/queries";
import { breadcrumbs } from "@/lib/site";
import { colorVar } from "@/lib/theme";

export async function generateStaticParams() {
  const areas = await getAreaSummaries();
  return areas.map((a) => ({ slug: a.worldSlug, area: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/worlds/[slug]/[area]">): Promise<Metadata> {
  const a = await getArea((await params).area);
  if (!a) return {};
  const points = a.data.floors.reduce((n, f) => n + f.markers.length, 0);
  const title = `${a.name} — ${a.world.name} Map & Guide`;
  const description =
    `${a.name}${a.region ? ` (${a.region})` : ""} on ${a.world.name} in Honkai: Star Rail: ` +
    `${a.data.floors.length ? `interactive in-game map${a.data.floors.length > 1 ? `s of ${a.data.floors.length} floors` : ""} with ${points} labelled points, ` : ""}` +
    `enemies, activities and collectibles. ${a.data.description.replace(/<\/?i>/g, "")}`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/worlds/${a.worldSlug}/${a.slug}` },
    openGraph: { title, description, images: a.data.image ? [{ url: areaImage(a.slug), alt: a.name }] : undefined },
  };
}

export default async function AreaPage({ params }: PageProps<"/worlds/[slug]/[area]">) {
  const { slug, area } = await params;
  const a = await getArea(area);
  if (!a || a.worldSlug !== slug) notFound();
  const d = a.data;
  const enemies = await getEnemies();
  const enemySlug = new Map(enemies.map((e) => [e.name, e]));

  const content = (
    <>
      <header className="mt-8 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        <div>
          <p className="eyebrow !text-[var(--c)]">
            {a.world.name}{d.region ? ` · ${d.region}` : ""} · Since version {d.releaseVersion}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{a.name}</h1>
          {d.description && (
            <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted [&_em]:text-ink/90">
              <GameText text={d.description} />
            </div>
          )}
          {d.unlock && <p className="mt-4 text-sm text-muted">Unlocked {d.unlock}.</p>}
        </div>
        {d.image && (
          <ZoomableImage src={areaImage(a.slug)} title={a.name} caption={`${a.world.name}${d.region ? ` · ${d.region}` : ""}`}
            className="overflow-hidden rounded-2xl border border-line">
            <Image src={areaImage(a.slug)} alt={`${a.name}, in game`} width={1280} height={720} sizes="(min-width: 768px) 460px, 100vw"
              loading="eager" fetchPriority="high" className="aspect-video w-full object-cover" />
            <span className="absolute top-3 left-3 rounded-full bg-space/80 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wider text-gold uppercase backdrop-blur-sm">
              In-game view
            </span>
          </ZoomableImage>
        )}
      </header>

      {d.floors.length > 0 && (
        <section className="mt-14" aria-labelledby="map-title">
          <h2 id="map-title" className="font-display text-2xl font-bold sm:text-3xl">Map</h2>
          <div className="mt-6">
            <AreaMap areaSlug={a.slug} areaName={a.name} floors={d.floors} categories={d.categories} />
          </div>
        </section>
      )}

      <section className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Area details">
        {d.connections.length > 0 && (
          <Panel title="Connected areas">
            <ul className="flex flex-col gap-1.5">
              {d.connections.map((c) => (
                <li key={c.name}>
                  {c.slug ? <Link href={`/worlds/${a.worldSlug}/${c.slug}`} className="text-gold hover:text-gold-strong">{c.name}</Link> : c.name}
                  {c.oneWay && <span className="ml-1.5 text-xs text-muted">(one-way)</span>}
                </li>
              ))}
            </ul>
          </Panel>
        )}
        {(d.enemies.normal.length > 0 || d.enemies.elite.length > 0) && (
          <Panel title="Enemies">
            {[["Normal", d.enemies.normal], ["Elite", d.enemies.elite]].map(([label, list]) =>
              (list as string[]).length > 0 && (
                <div key={label as string} className="mb-3 last:mb-0">
                  <p className="text-xs tracking-widest text-muted uppercase">{label}</p>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {(list as string[]).map((name) => {
                      const e = enemySlug.get(name);
                      return <li key={name}>{e ? <Link href={`/enemies/${e.slug}`} className="text-gold hover:text-gold-strong">{name}</Link> : name}</li>;
                    })}
                  </ul>
                </div>
              ),
            )}
          </Panel>
        )}
        {(d.activities.length > 0 || d.shops.length > 0) && (
          <Panel title="Activities & shops">
            <ul className="flex flex-col gap-1.5">
              {d.activities.map((x) => <li key={x}>{x}</li>)}
              {d.shops.map((x) => <li key={x}>{x} <span className="text-xs text-muted">(shop)</span></li>)}
            </ul>
          </Panel>
        )}
        {d.collectibles.length > 0 && (
          <Panel title="Collectibles">
            <ul className="flex flex-col gap-1.5">
              {d.collectibles.map((c) => (
                <li key={c.name} className="flex justify-between gap-3">
                  <span>{c.name}</span>
                  <span className="font-semibold text-gold-strong tabular-nums">{c.count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </section>
    </>
  );

  return (
    <AsOf version={a.releaseVersion} fallback={<NotYet what={a.name} version={a.releaseVersion} />}>
      <article style={colorVar(a.world.color)} className="mx-auto w-[min(100%-2rem,1200px)] py-12">
        <JsonLd data={breadcrumbs([
          { name: "Worlds", path: "/worlds" },
          { name: a.world.name, path: `/worlds/${a.worldSlug}` },
          { name: a.name, path: `/worlds/${a.worldSlug}/${a.slug}` },
        ])} />
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/worlds" className="transition-colors hover:text-ink">Worlds</Link>
          <span className="mx-2">›</span>
          <Link href={`/worlds/${a.worldSlug}#areas`} className="transition-colors hover:text-ink">{a.world.name}</Link>
        </nav>
        {a.spoilerVersion ? <Spoiler version={a.spoilerVersion} block>{content}</Spoiler> : content}
      </article>
    </AsOf>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="eyebrow mb-3">{title}</h2>
      <div className="text-sm">{children}</div>
    </div>
  );
}
