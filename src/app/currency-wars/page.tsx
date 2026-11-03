import type { Metadata } from "next";
import Link from "next/link";
import { CURRENCY_WARS } from "@/db/seed-data";
import { COST_COLOR } from "@/lib/currency-wars";

const cw = CURRENCY_WARS;

export const metadata: Metadata = {
  title: "Currency Wars — Guide, Units, Bonds, Team Planner",
  description:
    `Honkai: Star Rail Currency Wars (${cw.period.name}): all ${cw.units.length} units, ${cw.bonds.length} Bonds, equipment recipes, ` +
    "Investment Environments and Strategies, bosses, shop odds, and a team planner that recommends units and equipment.",
  alternates: { canonical: "/currency-wars" },
};

const BASICS = [
  ["Gold Coins", "Earned after every battle, plus interest on what you hold and bonuses for win streaks. Spend them on units, Experience and refreshes."],
  ["Level", "Buy Experience to level up. Your level sets how many units you can deploy and which costs appear in the store (see the odds below)."],
  ["Star Level", "Three copies of a unit at the same star level merge into the next. A 3-star unit is usually at its strongest."],
  ["Positioning", "Each unit is On-Field, Off-Field or either. Put it where it belongs to activate its Character Empowerment; misplaced on-field units don't act."],
  ["Bonds", "Units share Faction, School or Unique Bonds. Deploy enough different members to reach a tier; each tier strengthens the effect."],
  ["Equipment", "Basic items come from Reward and Supply Nodes. Two basics combine into an advanced item with its own effect."],
  ["Investments", "Pick an Investment Environment at the start and Investment Strategies along the way. Higher-quality Strategies raise enemy difficulty."],
  ["Squad HP", "Failing to clear a battle within the action limit costs Squad HP. Finishing with more HP climbs the ranks faster."],
];

const SECTIONS = [
  { href: "/currency-wars/planner", label: "Team planner", blurb: "Build a lineup, see its Bonds and get recommendations for what to add and equip." },
  { href: "/currency-wars/units", label: "Units", blurb: `All ${cw.units.length} units with cost, positioning, abilities and best equipment.` },
  { href: "/currency-wars/bonds", label: "Bonds", blurb: `${cw.bonds.length} Bonds with every tier and member.` },
  { href: "/currency-wars/equipment", label: "Equipment", blurb: "Every recipe at a glance, plus Emblems and special items." },
  { href: "/currency-wars/investments", label: "Investments", blurb: `${cw.environments.length} Environments and ${cw.strategies.length} Strategies.` },
  { href: "/currency-wars/opponents", label: "Opponents", blurb: `${cw.opponents.length} boss lineups and ${cw.affixes.length} difficulty affixes.` },
];

export default function CurrencyWarsPage() {
  return (
    <div className="flex flex-col gap-14">
      <p className="max-w-3xl text-lg text-muted">
        An auto-chess mode across three Planes: recruit units with Gold Coins, build Bonds, equip and position your squad, and defeat
        each Plane&apos;s boss before your Squad HP runs out. This period, <span className="text-ink">{cw.period.name}</span>, runs until{" "}
        {new Date(`${cw.period.end}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })};
        the next, Voyage Into the Canvas, begins with Version 4.7.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="glass group flex h-full flex-col gap-2 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-gold">
              <span className="font-display text-xl font-bold group-hover:text-gold">{s.label}</span>
              <span className="text-sm text-muted">{s.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="basics">
        <h2 id="basics" className="font-display text-2xl font-bold sm:text-3xl">How it works</h2>
        <dl className="mt-6 grid gap-3 md:grid-cols-2">
          {BASICS.map(([term, desc]) => (
            <div key={term} className="glass rounded-2xl p-4">
              <dt className="font-semibold text-gold">{term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="odds">
        <h2 id="odds" className="font-display text-2xl font-bold sm:text-3xl">Store odds by level</h2>
        <p className="mt-2 text-muted">The chance of each cost appearing in a store slot.</p>
        <div className="glass mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-sm tabular-nums">
            <thead className="border-b border-line text-xs tracking-widest text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left font-semibold">Level</th>
                {[1, 2, 3, 4, 5].map((c) => (
                  <th key={c} scope="col" className="px-4 py-2.5 text-right font-semibold" style={{ color: COST_COLOR[c] }}>{c}-cost</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cw.shopOdds.map((row) => (
                <tr key={row.level} className="border-b border-line/50 last:border-0">
                  <th scope="row" className="px-4 py-2 text-left font-normal">Lv. {row.level}</th>
                  {row.odds.map((o, i) => (
                    <td key={i} className={`px-4 py-2 text-right ${o ? "" : "text-muted/50"}`}>{o ? `${o}%` : "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
