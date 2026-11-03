"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cwSlug, type CwInvestment } from "@/lib/currency-wars";
import { cwInvestmentImage } from "@/lib/images";
import { GameText } from "../GameText";

const RARITY_COLOR: Record<string, string> = { Prismatic: "#e58cf2", Golden: "var(--color-gold)", Silver: "#c9ced8" };
const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

export function InvestmentBrowser({ environments, strategies }: { environments: CwInvestment[]; strategies: CwInvestment[] }) {
  const [tab, setTab] = useState<"strategies" | "environments">("strategies");
  const [rarity, setRarity] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const list = tab === "strategies" ? strategies : environments;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((i) => (!rarity || i.rarity === rarity) && (!q || i.name.toLowerCase().includes(q) || i.effect.toLowerCase().includes(q)));
  }, [list, rarity, query]);

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Kind" className="glass flex w-fit items-center rounded-full p-1 text-sm">
        {(["strategies", "environments"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setRarity(null); }}
            className="rounded-full px-4 py-2 font-semibold text-muted capitalize transition-colors hover:text-ink aria-selected:bg-gold aria-selected:text-gold-ink">
            Investment {t === "strategies" ? "Strategies" : "Environments"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="block w-full max-w-sm">
          <span className="sr-only">Search</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search names or effects…" autoComplete="off"
            className="glass w-full rounded-full px-5 py-2.5 placeholder:text-muted focus:border-gold focus:outline-none" />
        </label>
        {tab === "strategies" && (
          <div role="group" aria-label="Quality" className="flex flex-wrap gap-2">
            {["Prismatic", "Golden", "Silver"].map((r) => (
              <button key={r} type="button" className={chip} aria-pressed={rarity === r} onClick={() => setRarity(rarity === r ? null : r)}>
                <span style={{ color: RARITY_COLOR[r] }}>◆</span> {r}
              </button>
            ))}
          </div>
        )}
      </div>
      {tab === "strategies" && <p className="text-sm text-muted">Higher quality raises enemy difficulty: 0 for Silver, 1 (3 from A7) for Golden, 3 (6 from A7) for Prismatic.</p>}
      <p className="text-sm text-muted" aria-live="polite">{shown.length} shown</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((i) => (
          <li key={i.name} className="glass flex gap-3 rounded-2xl p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-space">
              {i.image && <Image src={cwInvestmentImage(cwSlug(i.name))} alt="" width={40} height={40} className="size-10 object-contain" />}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold">
                {i.name}
                {i.rarity && <span className="ml-2 text-xs font-normal" style={{ color: RARITY_COLOR[i.rarity] }}>{i.rarity}</span>}
              </h3>
              <GameText text={i.effect} className="mt-1 text-sm text-muted" />
              {i.planes && <p className="mt-1 text-xs text-muted/80">{i.planes}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
