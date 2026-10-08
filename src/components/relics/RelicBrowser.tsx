"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { gameIcon } from "@/lib/images";
import { isAvailable } from "@/lib/spoilers";
import { useStoryProgress } from "../spoilers/story-progress";

export type RelicSummary = {
  slug: string;
  name: string;
  kind: "cavern" | "planar";
  icon: string;
  releaseVersion: string | null;
  bonuses: { pieces: number; desc: string }[];
};

const KINDS = [
  { value: "cavern", label: "Cavern Relics", blurb: "Head, Hands, Body and Feet — from Caverns of Corrosion. 2- and 4-piece bonuses." },
  { value: "planar", label: "Planar Ornaments", blurb: "Planar Sphere and Link Rope — from the Simulated and Divergent Universe. 2-piece bonus." },
] as const;

export function RelicBrowser({ relics }: { relics: RelicSummary[] }) {
  const [kind, setKind] = useState<"cavern" | "planar">("cavern");
  const [query, setQuery] = useState("");
  const progress = useStoryProgress();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return relics
      .filter((r) => r.kind === kind && isAvailable(r.releaseVersion ?? "1.0", progress))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.bonuses.some((b) => b.desc.toLowerCase().includes(q)));
  }, [relics, kind, query, progress]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Relic type" className="glass flex items-center rounded-full p-1 text-sm">
          {KINDS.map((k) => (
            <button key={k.value} type="button" role="tab" aria-selected={kind === k.value} onClick={() => setKind(k.value)}
              className="rounded-full px-4 py-2 font-semibold text-muted transition-colors hover:text-ink aria-selected:bg-gold aria-selected:text-gold-ink">
              {k.label}
            </button>
          ))}
        </div>
        <label className="block w-full max-w-sm">
          <span className="sr-only">Search relic sets</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search names or effects (e.g. CRIT, Break)…"
            autoComplete="off" className="glass w-full rounded-full px-5 py-2.5 placeholder:text-muted focus:border-gold focus:outline-none" />
        </label>
      </div>
      <p className="text-sm text-muted">{KINDS.find((k) => k.value === kind)!.blurb} <span aria-live="polite">{shown.length} sets.</span></p>
      <ul className="grid gap-4 md:grid-cols-2">
        {shown.map((r) => (
          <li key={r.slug}>
            <Link href={`/relics/${r.slug}`} className="glass group flex h-full gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-gold">
              <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-[radial-gradient(circle,rgb(232_196_106/0.25),transparent_70%)]">
                <Image src={gameIcon(r.icon)} alt="" width={72} height={72} className="transition group-hover:scale-105" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-lg leading-tight font-bold group-hover:text-gold">{r.name}</span>
                {r.bonuses.map((b) => (
                  <span key={b.pieces} className="mt-1.5 block text-sm leading-snug text-muted">
                    <span className="mr-1.5 rounded bg-gold/15 px-1.5 py-0.5 text-xs font-semibold text-gold">{b.pieces}-pc</span>
                    {b.desc}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="py-12 text-center text-muted">No sets match.</p>}
    </div>
  );
}
