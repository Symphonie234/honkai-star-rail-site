"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Curio, Occurrence } from "@/lib/extras";
import { gameIcon, simulatedEventImage } from "@/lib/images";
import { GameText } from "../GameText";
import { ZoomableImage } from "../viewer/ZoomableImage";

const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

function Search({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="block w-full max-w-sm">
      <span className="sr-only">{label}</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`${label}…`} autoComplete="off"
        className="glass w-full rounded-full px-5 py-2.5 placeholder:text-muted focus:border-gold focus:outline-none" />
    </label>
  );
}

export function CurioBrowser({ curios }: { curios: Curio[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return curios.filter((c) => !q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }, [curios, query]);
  return (
    <div className="flex flex-col gap-5">
      <Search value={query} onChange={setQuery} label="Search curios" />
      <p className="text-sm text-muted" aria-live="polite">{shown.length} curios</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((c) => (
          <li key={c.id} id={`c${c.id}`} className="glass flex scroll-mt-28 gap-4 rounded-2xl p-4 target:ring-2 target:ring-gold">
            <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-[radial-gradient(circle,rgb(232_196_106/0.22),transparent_70%)]">
              {c.icon && <Image src={gameIcon(c.icon)} alt="" width={56} height={56} />}
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg leading-tight font-bold">{c.name}</h3>
              <GameText text={c.desc} className="mt-1 text-sm leading-relaxed text-muted" />
              {c.lore && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-gold hover:text-gold-strong">Lore</summary>
                  <GameText text={c.lore} className="mt-2 border-l-2 border-gold/40 pl-3 text-sm text-muted italic" />
                </details>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OccurrenceBrowser({ occurrences }: { occurrences: Occurrence[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string | null>(null);
  const types = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of occurrences) counts.set(o.type, (counts.get(o.type) ?? 0) + 1);
    return [...counts].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [occurrences]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return occurrences.filter((o) => (!type || o.type === type) && (!q || o.name.toLowerCase().includes(q)));
  }, [occurrences, query, type]);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Search value={query} onChange={setQuery} label="Search occurrences" />
        <div role="group" aria-label="Type" className="flex flex-wrap gap-2">
          <button type="button" className={chip} aria-pressed={type === null} onClick={() => setType(null)}>All</button>
          {types.map((t) => (
            <button key={t} type="button" className={chip} aria-pressed={type === t} onClick={() => setType(type === t ? null : t)}>{t}</button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted" aria-live="polite">{shown.length} occurrences</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((o) => (
          <li key={o.id} className="glass overflow-hidden rounded-2xl">
            <ZoomableImage src={simulatedEventImage(o.image)} title={o.name} caption={`Simulated Universe · ${o.type}`}>
              <Image src={simulatedEventImage(o.image)} alt="" width={480} height={270} sizes="(min-width: 1024px) 280px, 45vw"
                className="aspect-video w-full object-cover" />
            </ZoomableImage>
            <div className="p-3">
              <p className="text-[0.65rem] tracking-widest text-muted uppercase">{o.type}</p>
              <h3 className="font-semibold leading-tight">{o.name}</h3>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
