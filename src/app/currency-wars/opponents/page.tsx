import type { Metadata } from "next";
import Link from "next/link";
import { GameText } from "@/components/GameText";
import { CURRENCY_WARS } from "@/db/seed-data";
import { getEnemies } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Currency Wars Opponents — Bosses and Affixes",
  description: `The ${CURRENCY_WARS.opponents.length} Currency Wars opponents in Honkai: Star Rail with their bosses, elites and normal enemies, plus every difficulty affix.`,
  alternates: { canonical: "/currency-wars/opponents" },
};

export default async function OpponentsPage() {
  const enemies = await getEnemies();
  const link = (name: string) => {
    const e = enemies.find((x) => x.name === name || x.name === name.replace(/ \(Complete\)$/, ""));
    return e && !e.spoilerVersion ? <Link href={`/enemies/${e.slug}`} className="text-gold hover:text-gold-strong">{name}</Link> : name;
  };
  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="bosses">
        <h2 id="bosses" className="font-display text-2xl font-bold sm:text-3xl">Opponents</h2>
        <p className="mt-2 max-w-3xl text-muted">
          Each match draws three opponents; each one&apos;s boss waits at the end of a Plane, and every Combat Node is staffed by one of them.
          Plan your lineup for the bosses you&apos;re shown at the start.
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {CURRENCY_WARS.opponents.map((o) => (
            <li key={o.name} className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg font-bold">{o.name}</h3>
              <p className="mt-1 text-sm"><span className="text-muted">Boss:</span> {link(o.boss)}</p>
              <p className="mt-2 text-sm"><span className="text-muted">Elites:</span> {o.elites.map((n, i) => <span key={n}>{i > 0 && ", "}{link(n)}</span>)}</p>
              <p className="mt-1 text-sm"><span className="text-muted">Normals:</span> {o.normals.map((n, i) => <span key={n}>{i > 0 && ", "}{link(n)}</span>)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="affixes">
        <h2 id="affixes" className="font-display text-2xl font-bold sm:text-3xl">Affixes</h2>
        <p className="mt-2 text-muted">From A2 Jade Steel, each match rolls affixes that strengthen enemies or hinder your squad.</p>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {CURRENCY_WARS.affixes.map((a) => (
            <li key={a.name} className="glass rounded-2xl p-4">
              <h3 className="font-semibold">{a.name}</h3>
              <GameText text={a.effect} className="mt-1 text-sm text-muted" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
