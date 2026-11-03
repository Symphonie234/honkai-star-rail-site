"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COST_COLOR, type CwBond, type CwUnit } from "@/lib/currency-wars";
import { FIELD_STYLE, UnitAvatar, unitCost } from "./UnitBits";

const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

export function UnitBrowser({ units, bonds }: { units: CwUnit[]; bonds: CwBond[] }) {
  const [query, setQuery] = useState("");
  const [cost, setCost] = useState<number | null>(null);
  const [bond, setBond] = useState("");
  const [field, setField] = useState<CwUnit["field"] | null>(null);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return units
      .filter((u) => (cost === null ? true : cost === 0 ? u.advisor : u.costs.includes(cost)))
      .filter((u) => (!bond || u.bonds.includes(bond)) && (!field || u.field === field) && (!q || u.name.toLowerCase().includes(q)))
      .sort((a, b) => unitCost(b) - unitCost(a) || a.name.localeCompare(b.name));
  }, [units, query, cost, bond, field]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="block w-full max-w-xs">
          <span className="sr-only">Search units</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search units…" autoComplete="off"
            className="glass w-full rounded-full px-5 py-2.5 placeholder:text-muted focus:border-gold focus:outline-none" />
        </label>
        <select value={bond} onChange={(e) => setBond(e.target.value)} aria-label="Bond" className="glass rounded-full px-4 py-2.5 text-ink">
          <option value="">All Bonds</option>
          {bonds.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>
      </div>
      <div role="group" aria-label="Cost" className="flex flex-wrap gap-2">
        <button type="button" className={chip} aria-pressed={cost === null} onClick={() => setCost(null)}>All costs</button>
        {[1, 2, 3, 4, 5].map((c) => (
          <button key={c} type="button" className={chip} aria-pressed={cost === c} onClick={() => setCost(cost === c ? null : c)}>
            <span style={{ color: COST_COLOR[c] }}>●</span> {c}-cost
          </button>
        ))}
        <button type="button" className={chip} aria-pressed={cost === 0} onClick={() => setCost(cost === 0 ? null : 0)}>Expert Advisors</button>
        {(["On Field", "Off Field", "On/Off Field"] as const).map((f) => (
          <button key={f} type="button" className={chip} aria-pressed={field === f} onClick={() => setField(field === f ? null : f)}>{f}</button>
        ))}
      </div>
      <p className="text-sm text-muted" aria-live="polite">{shown.length} units</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((u) => (
          <li key={u.slug}>
            <Link href={`/currency-wars/units/${u.slug}`} className="glass group flex h-full items-center gap-3 rounded-2xl p-3 transition hover:border-gold">
              <UnitAvatar unit={u} size={64} link={false} />
              <span className="min-w-0">
                <span className="block font-semibold group-hover:text-gold">{u.name}</span>
                <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.65rem] tracking-wider uppercase ${FIELD_STYLE[u.field]}`}>{u.field}</span>
                <span className="mt-1 block truncate text-xs text-muted">{u.bonds.join(" · ")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
