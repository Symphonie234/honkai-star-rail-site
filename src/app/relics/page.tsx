import type { Metadata } from "next";
import { RelicBrowser, type RelicSummary } from "@/components/relics/RelicBrowser";
import { RELIC_STATS } from "@/db/seed-data";
import { getRelicSets } from "@/lib/queries";
import { SLOT_NAME } from "@/lib/relic";

export const metadata: Metadata = {
  title: "Relics & Planar Ornaments — Every Set",
  description:
    "Every Honkai: Star Rail Cavern Relic and Planar Ornament set through Version 4.6: 2- and 4-piece bonuses, each piece and its " +
    "story, plus the main stats each slot can roll and sub-stat roll values.",
  alternates: { canonical: "/relics" },
};

const fmt = (v: number, percent: boolean) =>
  percent ? `${Number((v * 100).toFixed(2))}%` : Number(v.toFixed(2)).toLocaleString("en-US");

export default async function RelicsPage() {
  const sets = await getRelicSets();
  const summaries: RelicSummary[] = sets.map((s) => ({
    slug: s.slug, name: s.name, kind: s.data.kind, icon: s.data.icon, releaseVersion: s.releaseVersion, bonuses: s.data.bonuses,
  }));
  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">Equipment</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Relics & Planar Ornaments</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Every set, its bonuses and the stories written into each piece — plus what every slot can roll.
        </p>
      </header>
      <RelicBrowser relics={summaries} />

      <section className="mt-20" aria-labelledby="stats-title">
        <h2 id="stats-title" className="font-display text-2xl font-bold sm:text-3xl">Stat reference</h2>
        <p className="mt-2 max-w-2xl text-muted">Main stats each 5★ piece can have, at +15 — and the three values a sub-stat roll can add.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RELIC_STATS.main.map((m) => (
            <div key={m.slot} className="glass rounded-2xl p-5">
              <h3 className="eyebrow mb-3">{SLOT_NAME[m.slot]}</h3>
              <ul className="flex flex-col gap-1.5 text-sm">
                {m.stats.map((s) => (
                  <li key={s.name} className="flex justify-between gap-3">
                    <span>{s.name}</span>
                    <span className="font-semibold text-gold-strong tabular-nums">{fmt(s.max, s.percent)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="glass mt-4 overflow-x-auto rounded-2xl">
          <table className="w-full text-sm tabular-nums">
            <caption className="sr-only">Sub-stat roll values (5★)</caption>
            <thead className="border-b border-line text-xs tracking-widest text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left font-semibold">Sub-stat</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">Low roll</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">Mid roll</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">High roll</th>
              </tr>
            </thead>
            <tbody>
              {RELIC_STATS.sub.map((s) => (
                <tr key={`${s.name}-${s.percent}`} className="border-b border-line/50 last:border-0">
                  <th scope="row" className="px-4 py-2 text-left font-normal">{s.name}{s.percent && s.name.match(/^(HP|ATK|DEF)$/) ? "%" : ""}</th>
                  {s.rolls.map((r, i) => <td key={i} className="px-4 py-2 text-right">{fmt(r, s.percent)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
