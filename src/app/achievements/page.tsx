import type { Metadata } from "next";
import Link from "next/link";
import { ACHIEVEMENT_SERIES, ACHIEVEMENTS } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Achievements — Every Series and Reward",
  description:
    `All ${ACHIEVEMENTS.length.toLocaleString("en-US")} Honkai: Star Rail achievements across ${ACHIEVEMENT_SERIES.length} series, with ` +
    "their Stellar Jade rewards and how to unlock them. Hidden achievements stay hidden until you reveal them.",
  alternates: { canonical: "/achievements" },
};

export default function AchievementsPage() {
  const jade = ACHIEVEMENTS.reduce((n, a) => n + a.jade, 0);
  const hidden = ACHIEVEMENTS.filter((a) => a.hidden).length;
  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">Records</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Achievements</h1>
        <dl className="mt-6 flex flex-wrap gap-3 text-sm">
          {[
            ["Achievements", ACHIEVEMENTS.length.toLocaleString("en-US")],
            ["Stellar Jade", jade.toLocaleString("en-US")],
            ["Hidden", hidden.toLocaleString("en-US")],
          ].map(([label, value]) => (
            <div key={label} className="glass rounded-xl px-4 py-2.5">
              <dt className="text-[0.65rem] tracking-widest text-muted uppercase">{label}</dt>
              <dd className="font-display text-xl font-bold text-gold">{value}</dd>
            </div>
          ))}
        </dl>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENT_SERIES.map((s) => (
          <li key={s.id}>
            <Link href={`/achievements/${s.slug}`}
              className="glass group flex h-full flex-col gap-2 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-gold">
              <span className="font-display text-xl font-bold group-hover:text-gold">{s.name}</span>
              <span className="text-sm text-muted">
                {s.count} achievements · <span className="text-gold">{s.jade.toLocaleString("en-US")} Stellar Jade</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
