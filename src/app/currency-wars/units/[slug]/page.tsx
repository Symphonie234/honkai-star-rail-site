import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EquipmentIcon, FIELD_STYLE } from "@/components/currency-wars/UnitBits";
import { GameText } from "@/components/GameText";
import { JsonLd } from "@/components/JsonLd";
import { ZoomableImage } from "@/components/viewer/ZoomableImage";
import { CURRENCY_WARS } from "@/db/seed-data";
import { COST_COLOR, cwSlug } from "@/lib/currency-wars";
import { cwUnitImage } from "@/lib/images";
import { breadcrumbs } from "@/lib/site";

const cw = CURRENCY_WARS;

export function generateStaticParams() {
  return cw.units.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: PageProps<"/currency-wars/units/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const u = cw.units.find((x) => x.slug === slug);
  if (!u) return {};
  const cost = u.advisor ? "Expert Advisor" : `${u.costs.join("/")}-cost`;
  return {
    title: `${u.name} — Currency Wars ${cost} Unit`,
    description: `${u.name} in Honkai: Star Rail Currency Wars: ${cost}, ${u.field}, Bonds ${u.bonds.join(", ")}. Abilities, star-level stats and best equipment.`,
    alternates: { canonical: `/currency-wars/units/${u.slug}` },
  };
}

export default async function UnitPage({ params }: PageProps<"/currency-wars/units/[slug]">) {
  const { slug } = await params;
  const u = cw.units.find((x) => x.slug === slug);
  if (!u) notFound();
  const equipment = u.equipment.map((name) => cw.equipment.find((e) => e.name === name)).filter((e) => !!e);
  const statRows = [["HP", "hp"], ["On-Field Strength", "onField"], ["Off-Field Strength", "offField"], ["SPD", "spd"]] as const;

  return (
    <article>
      <JsonLd data={breadcrumbs([{ name: "Currency Wars", path: "/currency-wars" }, { name: "Units", path: "/currency-wars/units" }, { name: u.name, path: `/currency-wars/units/${u.slug}` }])} />
      <header className="grid items-start gap-8 md:grid-cols-[260px_1fr]">
        {u.image ? (
          <ZoomableImage src={cwUnitImage(u.slug)} title={u.name} caption="Currency Wars" className="overflow-hidden rounded-2xl border border-line">
            <Image src={cwUnitImage(u.slug)} alt={u.name} width={512} height={512} sizes="260px" className="aspect-square w-full object-cover object-top" />
          </ZoomableImage>
        ) : <div className="glass aspect-square rounded-2xl" />}
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            {u.advisor ? <span className="rounded-full border border-gold px-3 py-0.5 text-gold">Expert Advisor</span> : u.costs.map((c) => (
              <span key={c} className="rounded-full px-3 py-0.5 font-semibold text-space" style={{ background: COST_COLOR[c] }}>{c}-cost</span>
            ))}
            <span className={`rounded-full border px-3 py-0.5 ${FIELD_STYLE[u.field]}`}>{u.field}</span>
            {u.roles.map((r) => <span key={r} className="rounded-full border border-line px-3 py-0.5 text-muted">{r}</span>)}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{u.name}</h2>
          <p className="mt-4 text-sm text-muted">Bonds</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {u.bonds.map((b) => (
              <li key={b}><Link href={`/currency-wars/bonds#${cwSlug(b)}`} className="block rounded-full border border-gold/50 px-3 py-1 text-sm transition hover:bg-gold/15">{b}</Link></li>
            ))}
          </ul>
          <Link href={`/currency-wars/planner?u=${u.slug}`} className="mt-6 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-gold-ink transition hover:bg-gold-strong">
            Build a team around {u.name}
          </Link>
        </div>
      </header>

      <Section title="Abilities in Currency Wars">
        <ul className="flex flex-col gap-3">
          {u.abilities.map((a) => (
            <li key={a.name} className="glass rounded-2xl p-4">
              <p className="text-xs tracking-wider text-gold uppercase">{a.type}</p>
              <h3 className="font-display text-lg font-bold">{a.name}</h3>
              <GameText text={a.desc} className="mt-2 gap-2 text-sm leading-relaxed text-muted" />
            </li>
          ))}
        </ul>
      </Section>

      {u.stars.length > 0 && (
        <Section title="Stats by star level">
          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full text-sm tabular-nums">
              <thead className="border-b border-line text-xs tracking-widest text-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">Stat</th>
                  {u.stars.map((_, i) => <th key={i} scope="col" className="px-4 py-2.5 text-right font-semibold text-gold">{"★".repeat(i + 1)}</th>)}
                </tr>
              </thead>
              <tbody>
                {statRows.map(([label, key]) => (
                  <tr key={key} className="border-b border-line/50 last:border-0">
                    <th scope="row" className="px-4 py-2 text-left font-normal">{label}</th>
                    {u.stars.map((s, i) => <td key={i} className="px-4 py-2 text-right">{s[key] || "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {equipment.length > 0 && (
        <Section title="Recommended equipment">
          <ul className="grid gap-3 md:grid-cols-3">
            {equipment.map((e) => (
              <li key={e.slug} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <EquipmentIcon slug={e.slug} name={e.name} size={36} />
                  <span className="font-semibold">{e.name}</span>
                </div>
                {e.recipe.length === 2 && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    <EquipmentIcon slug={cwSlug(e.recipe[0])} name={e.recipe[0]} size={18} /> + <EquipmentIcon slug={cwSlug(e.recipe[1])} name={e.recipe[1]} size={18} />
                    <span className="ml-1">{e.recipe.join(" + ")}</span>
                  </p>
                )}
                <GameText text={e.effect || e.stats} className="mt-2 text-sm text-muted" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(u.eidolons.length > 0 || u.lightCone) && (
        <Section title={u.field === "On Field" ? "Eidolons & Light Cone" : "Off-field Eidolons & Light Cone"}>
          <ul className="grid gap-3 md:grid-cols-2">
            {u.eidolons.map((e, i) => (
              <li key={e.name} className="glass rounded-2xl p-4">
                <p className="text-xs tracking-wider text-violet uppercase">Eidolon {i + 1}</p>
                <h3 className="font-semibold">{e.name}</h3>
                <GameText text={e.desc} className="mt-1 text-sm text-muted" />
              </li>
            ))}
            {u.lightCone && (
              <li className="glass rounded-2xl p-4">
                <p className="text-xs tracking-wider text-gold uppercase">Light Cone</p>
                <h3 className="font-semibold">{u.lightCone.name}</h3>
                <GameText text={u.lightCone.desc} className="mt-1 text-sm text-muted" />
              </li>
            )}
          </ul>
        </Section>
      )}

      {u.notes.length > 0 && (
        <Section title="Notes">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{u.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
