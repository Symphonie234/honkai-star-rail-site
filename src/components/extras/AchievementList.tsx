"use client";

import { useMemo, useState } from "react";
import type { Achievement } from "@/lib/extras";
import { GameText } from "../GameText";

const RARITIES = ["High", "Mid", "Low"] as const;
const RARITY_STYLE: Record<Achievement["rarity"], string> = {
  High: "border-gold/60 text-gold",
  Mid: "border-violet/60 text-violet",
  Low: "border-line text-muted",
};

const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

export function AchievementList({ achievements }: { achievements: Achievement[] }) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<Achievement["rarity"] | null>(null);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return achievements.filter(
      (a) =>
        (!rarity || a.rarity === rarity) &&
        (!hiddenOnly || a.hidden) &&
        (!q || a.title.toLowerCase().includes(q) || ((!a.hidden || revealAll) && a.desc.toLowerCase().includes(q))),
    );
  }, [achievements, query, rarity, hiddenOnly, revealAll]);
  const jade = shown.reduce((n, a) => n + a.jade, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="block w-full max-w-sm">
          <span className="sr-only">Search achievements</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search achievements…" autoComplete="off"
            className="glass w-full rounded-full px-5 py-2.5 placeholder:text-muted focus:border-gold focus:outline-none" />
        </label>
        <div role="group" aria-label="Rarity" className="flex flex-wrap gap-2">
          <button type="button" className={chip} aria-pressed={rarity === null} onClick={() => setRarity(null)}>All</button>
          {RARITIES.map((r) => (
            <button key={r} type="button" className={chip} aria-pressed={rarity === r} onClick={() => setRarity(rarity === r ? null : r)}>
              {r} · {r === "High" ? 20 : r === "Mid" ? 10 : 5} Jade
            </button>
          ))}
        </div>
        <button type="button" className={chip} aria-pressed={hiddenOnly} onClick={() => setHiddenOnly((v) => !v)}>Hidden only</button>
        <button type="button" className={chip} aria-pressed={revealAll} onClick={() => setRevealAll((v) => !v)}>Reveal hidden</button>
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        {shown.length} achievements · <span className="text-gold">{jade.toLocaleString("en-US")} Stellar Jade</span>
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((a) => {
          const open = !a.hidden || revealAll || revealed.has(a.id);
          return (
            <li key={a.id} id={`a${a.id}`} className="glass flex scroll-mt-28 gap-4 rounded-2xl p-4 target:ring-2 target:ring-gold">
              <span className={`grid size-12 shrink-0 place-items-center rounded-full border-2 text-xs font-bold tabular-nums ${RARITY_STYLE[a.rarity]}`}
                title={`${a.rarity} rarity · ${a.jade} Stellar Jade`}>
                {a.jade}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug">
                  {a.title}
                  {a.hidden && <span className="ml-2 rounded-full border border-line px-2 py-0.5 align-middle text-[0.65rem] font-normal tracking-wider text-muted uppercase">Hidden</span>}
                </h3>
                {open ? (
                  <GameText text={a.desc} className="mt-1 text-sm text-muted" />
                ) : (
                  <button type="button" onClick={() => setRevealed((s) => new Set(s).add(a.id))}
                    className="mt-1 rounded-full border border-dashed border-gold/60 px-3 py-0.5 text-xs font-semibold text-gold transition hover:bg-gold/10">
                    Reveal how to unlock
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="py-12 text-center text-muted">No achievements match.</p>}
    </div>
  );
}
