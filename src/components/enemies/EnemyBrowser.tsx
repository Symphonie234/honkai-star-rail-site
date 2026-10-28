"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { elementIcon, enemyImage } from "@/lib/images";
import { isAvailable, isRevealed } from "@/lib/spoilers";
import { useStoryProgress } from "../spoilers/story-progress";

export type EnemySummary = {
  slug: string;
  name: string;
  tier: string;
  faction: string | null;
  weaknesses: string[];
  hasImage: boolean;
  releaseVersion: string;
  spoilerVersion: string | null;
};

const TIER_ORDER = ["Normal", "Elite", "Boss", "Echo of War"];

const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

export function EnemyBrowser({ enemies, elements }: { enemies: EnemySummary[]; elements: { slug: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<string | null>(null);
  const [weakness, setWeakness] = useState<string | null>(null);
  const [faction, setFaction] = useState("");
  const progress = useStoryProgress();

  const tiers = useMemo(
    () => [...new Set(enemies.map((e) => e.tier))].sort((a, b) => (TIER_ORDER.indexOf(a) + 1 || 99) - (TIER_ORDER.indexOf(b) + 1 || 99)),
    [enemies],
  );
  const factions = useMemo(() => [...new Set(enemies.flatMap((e) => (e.faction ? [e.faction] : [])))].sort(), [enemies]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enemies.filter((e) => {
      if (!isAvailable(e.releaseVersion, progress)) return false;
      const revealed = isRevealed(e.spoilerVersion, progress);
      if (q && (!revealed || !(e.name.toLowerCase().includes(q) || e.faction?.toLowerCase().includes(q)))) return false;
      return (!tier || e.tier === tier) && (!weakness || e.weaknesses.includes(weakness)) && (!faction || e.faction === faction);
    });
  }, [enemies, query, tier, weakness, faction, progress]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <label className="block w-full max-w-md">
            <span className="sr-only">Search enemies</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or faction…" autoComplete="off"
              className="glass w-full rounded-full px-5 py-3 placeholder:text-muted focus:border-gold focus:outline-none" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Faction</span>
            <select value={faction} onChange={(e) => setFaction(e.target.value)} className="glass rounded-full px-4 py-2.5 text-ink">
              <option value="">All factions</option>
              {factions.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        </div>
        <div role="group" aria-label="Tier" className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2 w-full sm:w-36">Tier</span>
          <button type="button" className={chip} aria-pressed={tier === null} onClick={() => setTier(null)}>All</button>
          {tiers.map((t) => (
            <button key={t} type="button" className={chip} aria-pressed={tier === t} onClick={() => setTier(tier === t ? null : t)}>{t}</button>
          ))}
        </div>
        <div role="group" aria-label="Weakness" className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2 w-full sm:w-36">Weak to</span>
          <button type="button" className={chip} aria-pressed={weakness === null} onClick={() => setWeakness(null)}>All</button>
          {elements.map((el) => (
            <button key={el.slug} type="button" className={`${chip} pl-2`} aria-pressed={weakness === el.slug} onClick={() => setWeakness(weakness === el.slug ? null : el.slug)}>
              <Image src={elementIcon(el.slug)} alt="" width={18} height={18} /> {el.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted" aria-live="polite">{shown.length} {shown.length === 1 ? "enemy" : "enemies"}</p>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shown.map((e) => (
          <li key={e.slug}><EnemyCard e={e} revealed={isRevealed(e.spoilerVersion, progress)} /></li>
        ))}
      </ul>
      {shown.length === 0 && <p className="py-12 text-center text-muted">No enemies match those filters.</p>}
    </div>
  );
}

function EnemyCard({ e, revealed }: { e: EnemySummary; revealed: boolean }) {
  return (
    <Link href={`/enemies/${e.slug}`}
      className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-gold">
      <div className="relative aspect-square bg-[radial-gradient(circle_at_50%_45%,rgb(169_139_255/0.22),transparent_70%)]">
        {e.hasImage && (
          <Image src={enemyImage(e.slug)} alt="" fill sizes="(min-width: 1024px) 220px, 45vw"
            className={`object-contain p-3 transition duration-300 group-hover:scale-105 ${revealed ? "" : "blur-xl brightness-50"}`} />
        )}
        <span className="absolute top-2 left-2 rounded-full bg-space/75 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wider uppercase backdrop-blur-sm">
          {e.tier}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 pt-2">
        {revealed ? (
          <span className="font-display leading-tight font-bold">{e.name}</span>
        ) : (
          <span className="text-sm text-gold italic">Story enemy · v{e.spoilerVersion} spoiler</span>
        )}
        {e.weaknesses.length > 0 && (
          <span className="mt-auto flex flex-wrap gap-1" aria-label={`Weak to ${e.weaknesses.join(", ")}`}>
            {e.weaknesses.map((w) => <Image key={w} src={elementIcon(w)} alt="" width={20} height={20} />)}
          </span>
        )}
      </div>
    </Link>
  );
}
