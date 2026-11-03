import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GameText } from "@/components/GameText";
import { BLESSINGS, CURIOS, DOMAINS, OCCURRENCES } from "@/db/seed-data";
import { gameIcon } from "@/lib/images";

export const metadata: Metadata = {
  title: "Simulated Universe — Blessings, Curios, Occurrences",
  description:
    "Honkai: Star Rail's Simulated Universe and Divergent Universe: every Blessing by Path and rarity, every Curio with its lore, " +
    "Occurrences with their art, and what each domain type holds.",
  alternates: { canonical: "/simulated-universe" },
};

const SECTIONS = [
  { href: "/simulated-universe/blessings", label: "Blessings", count: BLESSINGS.length, blurb: "Path powers, by mode, Path and rarity — and their enhanced forms." },
  { href: "/simulated-universe/curios", label: "Curios", count: CURIOS.length, blurb: "Odd relics that bend each run's rules, and the stories behind them." },
  { href: "/simulated-universe/occurrences", label: "Occurrences", count: OCCURRENCES.length, blurb: "Events met along the way, from Aeon encounters to strange deals." },
];

export default function SimulatedUniversePage() {
  return (
    <div className="flex flex-col gap-14">
      <p className="max-w-2xl text-lg text-muted">
        Herta&apos;s simulation of the cosmos, where travelers walk a Path, gather Blessings and Curios, and face whatever each domain
        holds. This covers the Simulated Universe and the Divergent Universe.
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="glass group flex h-full flex-col gap-2 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-gold">
              <span className="font-display text-2xl font-bold group-hover:text-gold">{s.label}</span>
              <span className="text-sm text-gold">{s.count.toLocaleString("en-US")}</span>
              <span className="text-sm text-muted">{s.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="domains">
        <h2 id="domains" className="font-display text-2xl font-bold sm:text-3xl">Domains</h2>
        <p className="mt-2 text-muted">What each kind of domain on the map holds.</p>
        <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((d) => (
            <li key={d.id} className="glass flex items-start gap-4 rounded-2xl border-l-2 p-4" style={{ borderLeftColor: d.color.slice(0, 7) }}>
              <span className="grid size-14 shrink-0 place-items-center rounded-full border bg-space"
                style={{ borderColor: `color-mix(in srgb, ${d.color.slice(0, 7)} 55%, transparent)` }}>
                <Image src={gameIcon(d.icon)} alt="" width={44} height={44} className="size-11 object-contain" />
              </span>
              <div>
                <h3 className="font-semibold">{d.name}</h3>
                <GameText text={d.desc} className="mt-1 text-sm text-muted" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
