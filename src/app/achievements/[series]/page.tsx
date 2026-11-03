import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementList } from "@/components/extras/AchievementList";
import { JsonLd } from "@/components/JsonLd";
import { ACHIEVEMENT_SERIES, ACHIEVEMENTS } from "@/db/seed-data";
import { breadcrumbs } from "@/lib/site";

export function generateStaticParams() {
  return ACHIEVEMENT_SERIES.map((s) => ({ series: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/achievements/[series]">): Promise<Metadata> {
  const { series } = await params;
  const s = ACHIEVEMENT_SERIES.find((x) => x.slug === series);
  if (!s) return {};
  return {
    title: `${s.name} — Achievements`,
    description: `All ${s.count} "${s.name}" achievements in Honkai: Star Rail, worth ${s.jade} Stellar Jade, and how to unlock each one.`,
    alternates: { canonical: `/achievements/${s.slug}` },
  };
}

export default async function SeriesPage({ params }: PageProps<"/achievements/[series]">) {
  const { series } = await params;
  const s = ACHIEVEMENT_SERIES.find((x) => x.slug === series);
  if (!s) notFound();
  const list = ACHIEVEMENTS.filter((a) => a.series === s.id);
  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-12">
      <JsonLd data={breadcrumbs([{ name: "Achievements", path: "/achievements" }, { name: s.name, path: `/achievements/${s.slug}` }])} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/achievements" className="transition-colors hover:text-ink">← Achievements</Link>
      </nav>
      <header className="mt-8 mb-8">
        <p className="eyebrow">Achievement series</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{s.name}</h1>
        <p className="mt-3 text-muted">{s.count} achievements · <span className="text-gold">{s.jade.toLocaleString("en-US")} Stellar Jade</span></p>
      </header>
      <nav aria-label="Other series" className="-mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1 text-sm whitespace-nowrap">
        {ACHIEVEMENT_SERIES.map((o) => (
          <Link key={o.id} href={`/achievements/${o.slug}`} aria-current={o.id === s.id ? "page" : undefined}
            className="rounded-full border border-line px-3 py-1.5 text-muted transition hover:text-ink aria-[current=page]:border-gold aria-[current=page]:bg-gold/15 aria-[current=page]:text-ink">
            {o.name}
          </Link>
        ))}
      </nav>
      <AchievementList achievements={list} />
    </div>
  );
}
