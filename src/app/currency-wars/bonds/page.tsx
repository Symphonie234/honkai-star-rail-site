import type { Metadata } from "next";
import Link from "next/link";
import { UnitAvatar } from "@/components/currency-wars/UnitBits";
import { GameText } from "@/components/GameText";
import { CURRENCY_WARS } from "@/db/seed-data";

const cw = CURRENCY_WARS;

export const metadata: Metadata = {
  title: "Currency Wars Bonds — Every Tier and Member",
  description: `All ${cw.bonds.length} Currency Wars Bonds in Honkai: Star Rail — Faction, School and Unique — with each tier's effect and every member.`,
  alternates: { canonical: "/currency-wars/bonds" },
};

export default function BondsPage() {
  return (
    <div className="flex flex-col gap-14">
      {(["Faction", "School", "Unique"] as const).map((kind) => (
        <section key={kind} aria-labelledby={`k-${kind}`}>
          <h2 id={`k-${kind}`} className="font-display text-2xl font-bold sm:text-3xl">{kind} Bonds</h2>
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {cw.bonds.filter((b) => b.kind === kind).map((b) => {
              const members = b.members.map((m) => cw.units.find((u) => u.name === m)).filter((u) => !!u);
              return (
                <li key={b.slug} id={b.slug} className="glass scroll-mt-28 rounded-2xl p-5 target:ring-2 target:ring-gold">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-bold">{b.name}</h3>
                    <Link href={`/currency-wars/planner?bond=${b.slug}`} className="text-sm font-semibold text-gold hover:text-gold-strong">Build around it →</Link>
                  </div>
                  {b.effect && <GameText text={b.effect} className="mt-2 text-sm text-muted" />}
                  {b.tiers.length > 0 && (
                    <ol className="mt-3 flex flex-col gap-1.5">
                      {b.tiers.map((t) => (
                        <li key={t.count} className="flex gap-3 text-sm">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full border border-gold/60 font-semibold text-gold tabular-nums">{t.count}</span>
                          <GameText text={t.effect} className="text-muted" />
                        </li>
                      ))}
                    </ol>
                  )}
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Members">
                    {members.map((u) => <li key={u.slug}><UnitAvatar unit={u} size={44} /></li>)}
                  </ul>
                  {b.notes && <GameText text={b.notes} className="mt-3 border-t border-line pt-3 text-xs text-muted" />}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
