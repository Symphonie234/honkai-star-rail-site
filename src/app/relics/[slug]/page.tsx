import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameText } from "@/components/GameText";
import { JsonLd } from "@/components/JsonLd";
import { AsOf, NotYet } from "@/components/spoilers/AsOf";
import { gameIcon } from "@/lib/images";
import { getRelicSet, getRelicSets } from "@/lib/queries";
import { SLOT_NAME } from "@/lib/relic";
import { breadcrumbs } from "@/lib/site";

export async function generateStaticParams() {
  const sets = await getRelicSets();
  return sets.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/relics/[slug]">): Promise<Metadata> {
  const r = await getRelicSet((await params).slug);
  if (!r) return {};
  const kind = r.data.kind === "planar" ? "Planar Ornament" : "Cavern Relic";
  const title = `${r.name} — ${kind} Set`;
  const description = `${r.name} is a ${kind} set in Honkai: Star Rail${r.releaseVersion ? `, added in Version ${r.releaseVersion}` : ""}. ` +
    r.data.bonuses.map((b) => `${b.pieces}-piece: ${b.desc}`).join(" ");
  return { title, description: description.slice(0, 300), alternates: { canonical: `/relics/${r.slug}` }, openGraph: { title, description, images: [gameIcon(r.data.icon)] } };
}

export default async function RelicPage({ params }: PageProps<"/relics/[slug]">) {
  const r = await getRelicSet((await params).slug);
  if (!r) notFound();
  const d = r.data;
  const kind = d.kind === "planar" ? "Planar Ornament" : "Cavern Relic";
  const released = r.releaseVersion ?? "1.0";

  return (
    <AsOf version={released} fallback={<NotYet what={r.name} version={released} />}>
      <article className="mx-auto w-[min(100%-2rem,1200px)] py-12">
        <JsonLd data={breadcrumbs([{ name: "Relics", path: "/relics" }, { name: r.name, path: `/relics/${r.slug}` }])} />
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/relics" className="transition-colors hover:text-ink">← Relics & Planar Ornaments</Link>
        </nav>

        <header className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-center">
          <span className="grid size-40 shrink-0 place-items-center rounded-3xl bg-[radial-gradient(circle,rgb(232_196_106/0.28),transparent_70%)]">
            <Image src={gameIcon(d.icon)} alt="" width={128} height={128} loading="eager" />
          </span>
          <div>
            <p className="eyebrow">{kind} · {r.releaseVersion ? <Link href={`/versions#v${r.releaseVersion}`} className="hover:text-gold">Version {r.releaseVersion}</Link> : "Launch"}</p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{r.name}</h1>
            <ul className="mt-5 flex max-w-2xl flex-col gap-2.5">
              {d.bonuses.map((b) => (
                <li key={b.pieces} className="leading-relaxed">
                  <span className="mr-2 rounded bg-gold/15 px-2 py-0.5 text-sm font-semibold text-gold">{b.pieces}-piece</span>
                  {b.desc}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <section className="mt-14" aria-labelledby="pieces-title">
          <h2 id="pieces-title" className="font-display text-2xl font-bold sm:text-3xl">The pieces</h2>
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {d.pieces.map((p) => (
              <li key={p.slot} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#c99a45] to-[#6b4e1d]">
                    <Image src={gameIcon(p.icon)} alt="" width={56} height={56} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs tracking-widest text-gold uppercase">{SLOT_NAME[p.slot]}</p>
                    <h3 className="font-display text-lg leading-tight font-bold">{p.name}</h3>
                  </div>
                </div>
                {p.description && <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>}
                {p.story && (
                  <details className="group mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-gold hover:text-gold-strong">Read the story</summary>
                    <div className="mt-3 border-l-2 border-gold/40 pl-4 text-sm leading-relaxed text-muted [&_em]:text-ink/90">
                      <GameText text={p.story} />
                    </div>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </AsOf>
  );
}
