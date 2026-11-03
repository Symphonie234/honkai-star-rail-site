"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Blessing } from "@/lib/extras";
import { pathIcon } from "@/lib/images";
import { GameText } from "../GameText";

const MODES: Blessing["mode"][] = ["Simulated Universe", "Divergent Universe"];
const RARITIES: Blessing["rarity"][] = ["Legendary", "Rare", "Common"];
const RARITY_COLOR: Record<Blessing["rarity"], string> = {
  Legendary: "var(--color-gold)",
  Rare: "var(--color-violet)",
  Common: "var(--color-cyan)",
};
const PATH_SLUG: Record<string, string> = {
  Destruction: "destruction", "The Hunt": "hunt", Erudition: "erudition", Harmony: "harmony", Nihility: "nihility",
  Preservation: "preservation", Abundance: "abundance", Remembrance: "remembrance", Elation: "elation",
};

const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

export function BlessingBrowser({ blessings }: { blessings: Blessing[] }) {
  const [mode, setMode] = useState<Blessing["mode"]>("Simulated Universe");
  const [path, setPath] = useState<string | null>(null);
  const [rarity, setRarity] = useState<Blessing["rarity"] | null>(null);
  const [query, setQuery] = useState("");
  const [enhanced, setEnhanced] = useState(false);

  const paths = useMemo(() => [...new Set(blessings.filter((b) => b.mode === mode).map((b) => b.path))], [blessings, mode]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blessings
      .filter((b) => b.mode === mode && (!path || b.path === path) && (!rarity || b.rarity === rarity))
      .filter((b) => !q || b.name.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q))
      .sort((a, b) => RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity) || a.name.localeCompare(b.name));
  }, [blessings, mode, path, rarity, query]);

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Mode" className="glass flex w-fit items-center rounded-full p-1 text-sm">
        {MODES.map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setPath(null); }}
            className="rounded-full px-4 py-2 font-semibold text-muted transition-colors hover:text-ink aria-selected:bg-gold aria-selected:text-gold-ink">
            {m}
          </button>
        ))}
      </div>
      <div role="group" aria-label="Path" className="flex flex-wrap gap-2">
        <button type="button" className={chip} aria-pressed={path === null} onClick={() => setPath(null)}>All Paths</button>
        {paths.map((p) => (
          <button key={p} type="button" className={`${chip} pl-2`} aria-pressed={path === p} onClick={() => setPath(path === p ? null : p)}>
            {PATH_SLUG[p] ? <Image src={pathIcon(PATH_SLUG[p])} alt="" width={18} height={18} /> : <span aria-hidden="true">◈</span>}
            {p}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="block w-full max-w-sm">
          <span className="sr-only">Search blessings</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search names or effects…" autoComplete="off"
            className="glass w-full rounded-full px-5 py-2.5 placeholder:text-muted focus:border-gold focus:outline-none" />
        </label>
        <div role="group" aria-label="Rarity" className="flex flex-wrap gap-2">
          {RARITIES.map((r) => (
            <button key={r} type="button" className={chip} aria-pressed={rarity === r} onClick={() => setRarity(rarity === r ? null : r)}>
              <span className="size-2 rounded-full" style={{ background: RARITY_COLOR[r] }} /> {r}
            </button>
          ))}
        </div>
        <button type="button" className={chip} aria-pressed={enhanced} onClick={() => setEnhanced((v) => !v)}>Show enhanced</button>
      </div>
      <p className="text-sm text-muted" aria-live="polite">{shown.length} blessings</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((b) => (
          <li key={b.id} id={`b${b.id}`} className="glass scroll-mt-28 rounded-2xl border-l-2 p-4 target:ring-2 target:ring-gold" style={{ borderLeftColor: RARITY_COLOR[b.rarity] }}>
            <p className="flex items-center gap-2 text-xs tracking-wider uppercase" style={{ color: RARITY_COLOR[b.rarity] }}>
              {b.rarity} · {b.path}
            </p>
            <h3 className="mt-1 font-display text-lg leading-tight font-bold">{b.name}</h3>
            <GameText text={enhanced && b.enhanced ? b.enhanced : b.desc} className="mt-2 text-sm leading-relaxed text-muted" />
            {enhanced && b.enhanced && <p className="mt-2 text-xs text-gold">Enhanced</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
