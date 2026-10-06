import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { LoreText } from "@/components/glossary/LoreText";
import { JsonLd } from "@/components/JsonLd";
import { Spoiler } from "@/components/Spoiler";
import { AsOf, NotYet } from "@/components/spoilers/AsOf";
import { pathIcon } from "@/lib/images";
import { getAeon, getAeons, getPathCharacters } from "@/lib/queries";
import { breadcrumbs } from "@/lib/site";

export async function generateStaticParams() {
  const aeons = await getAeons();
  return aeons.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/aeons/[slug]">): Promise<Metadata> {
  const a = await getAeon((await params).slug);
  if (!a) return {};
  const title = `${a.name}, the Aeon of ${a.concept} — Lore, Path & Followers`;
  const description = `${a.name} (${a.epithets.join(", ")}) in Honkai: Star Rail. ${a.description}`;
  return {
    title,
    description,
    alternates: { canonical: `/aeons/${a.slug}` },
    openGraph: { title, description, type: "article", images: a.image ? [{ url: a.image, alt: a.name }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: a.image ? [a.image] : undefined },
  };
}

const anchor = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default async function AeonPage({ params }: PageProps<"/aeons/[slug]">) {
  const a = await getAeon((await params).slug);
  if (!a) notFound();

  const [aeons, walkers] = await Promise.all([getAeons(), a.pathSlug ? getPathCharacters(a.pathSlug) : []]);
  const i = aeons.findIndex((o) => o.slug === a.slug);
  const prev = aeons[i - 1];
  const next = aeons[i + 1];

  return (
    <AsOf version={a.introducedVersion} fallback={<NotYet what={a.name} version={a.introducedVersion} />}>
      <article className="mx-auto w-[min(100%-2rem,1200px)] py-12">
        <JsonLd data={breadcrumbs([{ name: "Aeons", path: "/aeons" }, { name: a.name, path: `/aeons/${a.slug}` }])} />
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/aeons" className="transition-colors hover:text-ink">← Aeons &amp; Paths</Link>
        </nav>

        <header className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div>
            <p className="eyebrow">Aeon of {a.concept}</p>
            <h1 className="mt-3 font-display text-5xl font-bold sm:text-7xl">{a.name}</h1>
            {a.epithets.length > 0 && (
              <p className="mt-4 flex flex-wrap gap-2" aria-label="Also known as">
                {a.epithets.map((e) => (
                  <span key={e} className="rounded-full border border-gold/40 px-3 py-1 text-sm text-gold">{e}</span>
                ))}
              </p>
            )}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"><LoreText text={a.description} exclude="aeon" /></p>

            <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs tracking-widest text-muted uppercase">Path</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold">
                  {a.path ? (
                    <><Image src={pathIcon(a.path.slug)} alt="" width={22} height={22} />{a.path.name}</>
                  ) : (
                    <span>{a.concept} <span className="font-normal text-muted">(not playable)</span></span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-widest text-muted uppercase">Travelers walking it</dt>
                <dd className="mt-1 font-semibold">{walkers.length}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-widest text-muted uppercase">Devoted factions</dt>
                <dd className="mt-1 flex flex-wrap gap-x-2 font-semibold">
                  {a.factions.length
                    ? a.factions.map((f) => <AsOf key={f.slug} version={f.introducedVersion}><span>{f.name}</span></AsOf>)
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative order-first grid place-items-center md:order-none">
            <span aria-hidden="true" className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgb(232_196_106/0.22),transparent_65%)] blur-2xl" />
            {a.image ? (
              <div className="relative aspect-square w-full max-w-[420px] motion-safe:animate-float">
                <Image src={a.image} alt={`${a.name}, the Aeon of ${a.concept}`} fill loading="eager" fetchPriority="high"
                  sizes="(min-width: 768px) 420px, 90vw" className="object-contain drop-shadow-[0_0_30px_rgb(232_196_106/0.25)]" />
              </div>
            ) : (
              <span aria-hidden="true" className="relative grid size-56 place-items-center rounded-full border border-gold/40 bg-surface-solid font-display text-8xl text-gold">
                {a.glyph}
              </span>
            )}
          </div>
        </header>

        <div className="mt-16 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold tracking-widest text-muted uppercase">On this page</p>
              <ol className="mt-3 flex flex-col gap-2 border-l border-line pl-4 text-sm">
                {a.lore.map((s) => (
                  <AsOf key={s.slug} version={s.version}>
                    <li>
                      <a href={`#${anchor(s.title)}`} className="text-muted transition-colors hover:text-gold">{s.title}</a>
                    </li>
                  </AsOf>
                ))}
                {walkers.length > 0 && <li><a href="#pathstriders" className="text-muted transition-colors hover:text-gold">Pathstriders</a></li>}
              </ol>
            </div>
          </nav>

          <div className="flex flex-col gap-6">
            {a.lore.map((s) => {
              const section = (
                <section id={anchor(s.title)} className="glass scroll-mt-24 rounded-2xl p-6 sm:p-8" aria-labelledby={`h-${s.slug}`}>
                  <h2 id={`h-${s.slug}`} className="font-display text-2xl font-bold">{s.title}</h2>
                  <div className="mt-4 flex max-w-3xl flex-col gap-4 leading-relaxed text-muted">
                    {s.body.split(/\n\s*\n/).map((p, k) => <p key={k}><LoreText text={p} /></p>)}
                  </div>
                </section>
              );
              return (
                <AsOf key={s.slug} version={s.version}>
                  {s.spoilerVersion ? <Spoiler version={s.spoilerVersion} block>{section}</Spoiler> : <div>{section}</div>}
                </AsOf>
              );
            })}
          </div>
        </div>

        {walkers.length > 0 && a.path && (
          <section id="pathstriders" className="mt-16 scroll-mt-24" aria-labelledby="pathstriders-title">
            <h2 id="pathstriders-title" className="font-display text-3xl font-bold">Walking {a.path.name}</h2>
            <p className="mt-2 text-muted">Every traveler in the archive on {a.name}&apos;s Path. Walking a Path doesn&apos;t mean serving its Aeon.</p>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {walkers.map((c) => (
                <AsOf key={c.slug} version={c.releaseVersion}>
                  <li><CharacterCard c={c} /></li>
                </AsOf>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Other Aeons" className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <AsOf version={prev.introducedVersion} fallback={<span />}>
            <Link href={`/aeons/${prev.slug}`} className="group">
              <span className="text-xs tracking-widest text-muted uppercase">← Previous Aeon</span>
              <span className="block font-display text-lg font-bold group-hover:text-gold">{prev.name} · {prev.concept}</span>
            </Link>
            </AsOf>
          ) : <span />}
          {next && (
            <AsOf version={next.introducedVersion}>
            <Link href={`/aeons/${next.slug}`} className="group sm:text-right">
              <span className="text-xs tracking-widest text-muted uppercase">Next Aeon →</span>
              <span className="block font-display text-lg font-bold group-hover:text-gold">{next.name} · {next.concept}</span>
            </Link>
            </AsOf>
          )}
        </nav>
      </article>
    </AsOf>
  );
}
