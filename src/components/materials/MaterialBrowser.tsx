"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { gameIcon } from "@/lib/images";
import { RARITY_BG } from "../characters/kit/MaterialTiles";

export type MaterialSummary = { slug: string; name: string; rarity: number; category: string; icon: string; description: string };

const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

export function MaterialBrowser({ materials }: { materials: MaterialSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(materials.map((m) => m.category))].sort(), [materials]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => (!category || m.category === category) && (!q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)));
  }, [materials, query, category]);

  return (
    <div className="flex flex-col gap-6">
      <label className="block max-w-md">
        <span className="sr-only">Search materials</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or use (e.g. Remembrance)…"
          autoComplete="off" className="glass w-full rounded-full px-5 py-3 placeholder:text-muted focus:border-gold focus:outline-none" />
      </label>
      <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
        <button type="button" className={chip} aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {categories.map((c) => (
          <button key={c} type="button" className={chip} aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>{c}</button>
        ))}
      </div>
      <p className="text-sm text-muted" aria-live="polite">{shown.length} materials</p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3">
        {shown.map((m) => (
          <li key={m.slug}>
            <Link href={`/materials/${m.slug}`} title={m.description.replace(/<\/?i>/g, "")}
              className="glass group flex h-full flex-col items-center overflow-hidden rounded-xl text-center transition hover:-translate-y-0.5 hover:border-gold">
              <span className={`grid w-full place-items-center bg-gradient-to-b py-3 ${RARITY_BG[m.rarity] ?? RARITY_BG[1]}`}>
                <Image src={gameIcon(m.icon)} alt="" width={56} height={56} className="transition group-hover:scale-110" />
              </span>
              <span lang="en" className="w-full px-2 py-2 text-xs leading-snug font-semibold text-balance hyphens-auto [overflow-wrap:anywhere]">{m.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
