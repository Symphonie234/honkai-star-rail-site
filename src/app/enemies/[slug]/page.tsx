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
import { elementIcon, enemyImage } from "@/lib/images";
import { getElements, getEnemies, getEnemy, getEnemyAreas } from "@/lib/queries";
import { breadcrumbs } from "@/lib/site";

export async function generateStaticParams() {
  const enemies = await getEnemies();
  return enemies.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/enemies/[slug]">): Promise<Metadata> {
  const e = await getEnemy((await params).slug);
  if (!e) return {};
  if (e.spoilerVersion) {
    return { title: `Story enemy (v${e.spoilerVersion})`, description: "A story enemy from Honkai: Star Rail. Spoilers hidden.", alternates: { canonical: `/enemies/${e.slug}` }, robots: { index: false } };
  }
  const title = `${e.name} — ${e.tier} Enemy`;
  const weak = e.data.weaknesses.length ? ` Weak to ${e.data.weaknesses.join(", ")}.` : "";
  const description = `${e.name} is a${/^[aeiou]/i.test(e.tier) ? "n" : ""} ${e.tier.toLowerCase()} enemy in Honkai: Star Rail${e.faction ? ` (${e.faction})` : ""}.${weak} ${e.data.lore.replace(/<\/?i>/g, "")}`.slice(0, 300);
  return {
    title, description, alternates: { canonical: `/enemies/${e.slug}` },
    openGraph: { title, description, images: e.data.image ? [{ url: enemyImage(e.slug), alt: e.name }] : undefined },
  };
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default async function EnemyPage({ params }: PageProps<"/enemies/[slug]">) {
  const e = await getEnemy((await params).slug);
  if (!e) notFound();
  const d = e.data;
  const [elements, areas] = await Promise.all([getElements(), getEnemyAreas(e.name)]);

  const content = (
    <>
      <header className="mt-8 grid items-start gap-10 md:grid-cols-[minmax(0,420px)_1fr]">
        <div className="relative mx-auto w-full max-w-[420px]">
          <div aria-hidden="true" className="absolute inset-x-0 inset-y-[-8%] -z-10 bg-[radial-gradient(circle,rgb(169_139_255/0.25),transparent_65%)] blur-2xl" />
          {d.image ? (
            <ZoomableImage src={enemyImage(e.slug)} title={e.name} caption={`${e.tier}${e.faction ? ` · ${e.faction}` : ""}`}>
              <Image src={enemyImage(e.slug)} alt={e.name} width={900} height={900} sizes="(min-width: 768px) 420px, 90vw"
                loading="eager" fetchPriority="high" className="aspect-square w-full object-contain drop-shadow-[0_20px_40px_rgb(0_0_0/0.6)]" />
            </ZoomableImage>
          ) : <div className="glass aspect-square rounded-2xl" />}
        </div>
        <div>
          <p className="eyebrow">{e.tier}{e.faction ? ` · ${e.faction}` : ""}</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{e.name}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            <Fact label="Weak to">
              {d.weaknesses.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {d.weaknesses.map((w) => <Image key={w} src={elementIcon(w)} alt={w} title={w} width={28} height={28} />)}
                </span>
              ) : "—"}
            </Fact>
            <Fact label="Deals">
              {d.types.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {d.types.map((w) => <Image key={w} src={elementIcon(w)} alt={w} title={w} width={28} height={28} />)}
                </span>
              ) : "—"}
            </Fact>
            <Fact label="Toughness">{d.toughness ?? "—"}</Fact>
            {d.spd !== null && <Fact label="SPD">{d.spd}</Fact>}
            {d.effectRes !== null && <Fact label="Effect RES">{pct(d.effectRes)}</Fact>}
            <Fact label="First seen">
              <Link href={`/versions#v${e.releaseVersion}`} className="text-gold hover:text-gold-strong">Version {e.releaseVersion}</Link>
            </Fact>
          </dl>
          {d.location && <p className="mt-5 text-sm text-muted"><span className="text-ink">Found at:</span> {d.location}</p>}
          {d.abilities.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {d.abilities.map((a) => <li key={a} className="rounded-full border border-line px-3 py-1 text-muted">{a}</li>)}
            </ul>
          )}
          {d.lore && (
            <blockquote className="glass mt-6 rounded-2xl border-l-2 !border-l-violet p-5 leading-relaxed text-muted [&_em]:text-ink/90">
              <GameText text={d.lore} />
            </blockquote>
          )}
        </div>
      </header>

      <section className="mt-14 grid gap-4 lg:grid-cols-2" aria-label="Combat details">
        <div className="glass rounded-2xl p-5">
          <h2 className="eyebrow mb-4">Resistances</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {elements.map((el) => {
              const r = d.res[el.slug] ?? 0;
              const weak = d.weaknesses.includes(el.slug);
              return (
                <li key={el.slug} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${weak ? "border-gold/60 bg-gold/10" : "border-line"}`}>
                  <Image src={elementIcon(el.slug)} alt="" width={22} height={22} />
                  <span className="text-sm">{el.name}</span>
                  <span className={`ml-auto font-semibold tabular-nums ${r > 0.2 ? "text-violet" : weak ? "text-gold-strong" : ""}`}>{pct(r)}</span>
                </li>
              );
            })}
          </ul>
          {Object.keys(d.debuffRes).length > 0 && (
            <>
              <h3 className="eyebrow mt-5 mb-2">Debuff resistances</h3>
              <ul className="flex flex-wrap gap-2 text-sm">
                {Object.entries(d.debuffRes).map(([k, v]) => (
                  <li key={k} className="rounded-full border border-line px-3 py-1 capitalize">{k} <span className="font-semibold tabular-nums">{pct(v)}</span></li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-xs text-muted">Weaknesses are highlighted. Values as listed on the HSR Wiki.</p>
        </div>

        {d.skills.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <h2 className="eyebrow mb-4">Skills</h2>
            <ul className="flex flex-col gap-4">
              {d.skills.map((s) => (
                <li key={`${s.name}-${s.desc}`}>
                  <p className="font-semibold">{s.name} {s.type && <span className="ml-1 text-xs font-normal text-muted">· {s.type}</span>}</p>
                  {s.desc && <p className="mt-1 text-sm leading-relaxed text-muted">{s.desc}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {areas.length > 0 && (
        <section className="mt-14" aria-labelledby="areas-title">
          <h2 id="areas-title" className="font-display text-2xl font-bold">Where to find it</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {areas.map((a) => (
              <AsOf key={a.slug} version={a.releaseVersion}>
                <li>
                  <Link href={`/worlds/${a.worldSlug}/${a.slug}`} className="block rounded-full border border-line px-4 py-1.5 text-sm transition hover:border-gold hover:text-gold">
                    {a.name}
                  </Link>
                </li>
              </AsOf>
            ))}
          </ul>
        </section>
      )}
    </>
  );

  return (
    <AsOf version={e.releaseVersion} fallback={<NotYet what="This enemy" version={e.releaseVersion} />}>
      <article className="mx-auto w-[min(100%-2rem,1200px)] py-12">
        {!e.spoilerVersion && <JsonLd data={breadcrumbs([{ name: "Enemies", path: "/enemies" }, { name: e.name, path: `/enemies/${e.slug}` }])} />}
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/enemies" className="transition-colors hover:text-ink">← Enemies</Link>
        </nav>
        {e.spoilerVersion ? <Spoiler version={e.spoilerVersion} block>{content}</Spoiler> : content}
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
