"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { activeBonds, buildAround, COST_COLOR, suggestUnits, type CwData, type CwUnit } from "@/lib/currency-wars";
import { CloseIcon } from "../icons";
import { EquipmentIcon, FIELD_STYLE, UnitAvatar, unitCost } from "./UnitBits";

type Pick = { slug: string; star: number; off: boolean };

const parse = (raw: string | null): Pick[] =>
  (raw ?? "").split(",").filter(Boolean).map((s) => {
    const [slug, star = "1", off = ""] = s.split(".");
    return { slug, star: Math.min(3, Math.max(1, Number(star) || 1)), off: off === "off" };
  });
const serialize = (picks: Pick[]) => picks.map((p) => `${p.slug}${p.star > 1 || p.off ? `.${p.star}` : ""}${p.off ? ".off" : ""}`).join(",");

export function TeamPlanner({ data }: { data: CwData }) {
  const params = useSearchParams();
  const router = useRouter();
  const { units, bonds, shopOdds, equipment } = data;
  const bySlug = useMemo(() => new Map(units.map((u) => [u.slug, u])), [units]);
  const [level, setLevel] = useState(() => Math.min(10, Math.max(1, Number(params.get("lv")) || 8)));
  const [picks, setPicks] = useState<Pick[]>(() => {
    const seed = params.get("bond");
    const bond = seed ? bonds.find((b) => b.slug === seed) : null;
    if (bond) return buildAround(bond, Number(params.get("lv")) || 8, units, bonds).map((u) => ({ slug: u.slug, star: 1, off: u.field === "Off Field" }));
    return parse(params.get("u")).filter((p) => bySlug.has(p.slug)).map((p) => ({ ...p, off: p.off || bySlug.get(p.slug)!.field === "Off Field" }));
  });
  const [query, setQuery] = useState("");
  const [bondFilter, setBondFilter] = useState("");
  const [copied, setCopied] = useState(false);

  const update = (next: Pick[], lv = level) => {
    setPicks(next);
    router.replace(`/currency-wars/planner?${new URLSearchParams({ u: serialize(next), lv: String(lv) })}`, { scroll: false });
  };
  const lineup = picks.map((p) => bySlug.get(p.slug)).filter((u): u is CwUnit => !!u);
  const active = activeBonds(lineup, bonds);
  const maxCost = Math.max(...(shopOdds.find((r) => r.level === level)?.odds ?? [100]).map((o, i) => (o > 0 ? i + 1 : 0)));
  const suggestions = suggestUnits(lineup, units, bonds, { maxCost, limit: 8 });
  const onField = picks.filter((p) => !p.off).length;
  const value = lineup.reduce((n, u, i) => n + unitCost(u) * 3 ** (picks[i].star - 1), 0);

  const pool = units
    .filter((u) => !u.advisor && (!bondFilter || u.bonds.includes(bondFilter)) && (!query || u.name.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => unitCost(a) - unitCost(b) || a.name.localeCompare(b.name));

  const add = (u: CwUnit) => {
    if (picks.some((p) => p.slug === u.slug)) return;
    update([...picks, { slug: u.slug, star: 1, off: u.field === "Off Field" }]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-6">
        {/* Lineup */}
        <section className="glass rounded-2xl p-4" aria-labelledby="lineup">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="lineup" className="font-display text-xl font-bold">Lineup</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <span className="text-muted">Level</span>
                <select value={level} onChange={(e) => { const lv = Number(e.target.value); setLevel(lv); update(picks, lv); }} className="glass rounded-full px-3 py-1.5">
                  {shopOdds.map((r) => <option key={r.level} value={r.level}>{r.level}</option>)}
                </select>
              </label>
              <span className={picks.length > level ? "text-violet" : "text-muted"}>{picks.length}/{level} units</span>
              <span className="text-muted">{onField} on-field · value {value}</span>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="rounded-full border border-line px-3 py-1.5 text-muted transition hover:text-ink">{copied ? "Copied!" : "Copy link"}</button>
              <button type="button" onClick={() => update([])} className="rounded-full border border-line px-3 py-1.5 text-muted transition hover:text-ink">Clear</button>
            </div>
          </div>
          {lineup.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Add units from the pool below, or start from a Bond.</p>
          ) : (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {lineup.map((u, i) => {
                const p = picks[i];
                return (
                  <li key={u.slug} className="flex items-center gap-3 rounded-xl border border-line bg-space/60 p-2">
                    <UnitAvatar unit={u} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{u.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <button type="button" onClick={() => update(picks.map((q, j) => (j === i ? { ...q, star: (q.star % 3) + 1 } : q)))}
                          className="rounded-full border border-gold/50 px-2 py-0.5 text-gold" title="Change star level">{"★".repeat(p.star)}</button>
                        {u.field === "On/Off Field" ? (
                          <button type="button" onClick={() => update(picks.map((q, j) => (j === i ? { ...q, off: !q.off } : q)))}
                            className={`rounded-full border px-2 py-0.5 ${FIELD_STYLE[u.field]}`} title="Switch position">{p.off ? "Off-field" : "On-field"} ⇄</button>
                        ) : (
                          <span className={`rounded-full border px-2 py-0.5 ${FIELD_STYLE[u.field]}`}>{u.field === "Off Field" ? "Off-field" : "On-field"}</span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => update(picks.filter((_, j) => j !== i))} aria-label={`Remove ${u.name}`}
                      className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-gold/15 hover:text-gold"><CloseIcon /></button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Suggestions */}
        <section className="glass rounded-2xl p-4" aria-labelledby="next">
          <h2 id="next" className="font-display text-xl font-bold">Recommended next</h2>
          <p className="mt-1 text-xs text-muted">Units that push your Bonds to their next tier, among the costs your store can roll at level {level} (up to {maxCost}-cost).</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <li key={s.unit.slug}>
                <button type="button" onClick={() => add(s.unit)} className="flex w-full items-center gap-3 rounded-xl border border-line p-2 text-left transition hover:border-gold">
                  <UnitAvatar unit={s.unit} size={44} link={false} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{s.unit.name}</span>
                    <span className="block text-xs text-muted">{s.reasons.join(" · ") || s.unit.bonds.join(" · ")}</span>
                  </span>
                  <span className="ml-auto text-lg text-gold">+</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Or start from a Bond:</span>
            <select defaultValue="" aria-label="Build around a Bond" className="glass rounded-full px-3 py-1.5"
              onChange={(e) => {
                const b = bonds.find((x) => x.slug === e.target.value);
                if (b) update(buildAround(b, level, units, bonds).map((u) => ({ slug: u.slug, star: 1, off: u.field === "Off Field" })));
                e.target.value = "";
              }}>
              <option value="" disabled>Choose a Bond…</option>
              {bonds.filter((b) => b.tiers.length && b.kind !== "Unique").map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </div>
        </section>

        {/* Pool */}
        <section className="glass rounded-2xl p-4" aria-labelledby="pool">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="pool" className="font-display text-xl font-bold">Unit pool</h2>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label="Search units"
              className="rounded-full border border-line bg-transparent px-4 py-1.5 text-sm focus:border-gold focus:outline-none" />
            <select value={bondFilter} onChange={(e) => setBondFilter(e.target.value)} aria-label="Filter by Bond" className="glass rounded-full px-3 py-1.5 text-sm">
              <option value="">All Bonds</option>
              {bonds.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          {[1, 2, 3, 4, 5].map((cost) => {
            const group = pool.filter((u) => unitCost(u) === cost);
            if (!group.length) return null;
            return (
              <div key={cost} className="mt-4">
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: COST_COLOR[cost] }}>{cost}-cost</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {group.map((u) => {
                    const picked = picks.some((p) => p.slug === u.slug);
                    return (
                      <li key={u.slug}>
                        <button type="button" onClick={() => add(u)} disabled={picked} title={`${u.name} — ${u.bonds.join(", ")}`}
                          className="block rounded-xl transition hover:scale-105 disabled:opacity-30">
                          <UnitAvatar unit={u} size={52} link={false} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      </div>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-h,4rem)+1rem)] lg:self-start">
        <section className="glass rounded-2xl p-4" aria-labelledby="bonds-title">
          <h2 id="bonds-title" className="font-display text-xl font-bold">Bonds</h2>
          {active.length === 0 ? <p className="mt-2 text-sm text-muted">No Bonds yet.</p> : (
            <ul className="mt-3 flex flex-col gap-2">
              {active.map((a) => (
                <li key={a.bond.slug} className={`rounded-xl border p-2.5 ${a.tier > 0 ? "border-gold/50 bg-gold/5" : "border-line"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <a href={`/currency-wars/bonds#${a.bond.slug}`} className={`font-semibold ${a.tier > 0 ? "text-gold" : "text-muted"}`}>{a.bond.name}</a>
                    <span className="flex gap-1 text-xs tabular-nums">
                      {a.bond.tiers.map((t) => (
                        <span key={t.count} className={`rounded px-1.5 ${a.count >= t.count ? "bg-gold text-gold-ink" : "border border-line text-muted"}`}>{t.count}</span>
                      ))}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {a.count} active{a.next ? ` · ${a.next - a.count} more for tier ${a.next}` : a.bond.tiers.length ? " · max tier" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-2xl p-4" aria-labelledby="equip-title">
          <h2 id="equip-title" className="font-display text-xl font-bold">Equipment plan</h2>
          {lineup.length === 0 ? <p className="mt-2 text-sm text-muted">Add units to see their best items.</p> : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {lineup.map((u) => (
                <li key={u.slug} className="flex items-center gap-2">
                  <UnitAvatar unit={u} size={32} />
                  <span className="flex gap-1.5">
                    {u.equipment.slice(0, 3).map((name) => {
                      const e = equipment.find((x) => x.name === name);
                      return e ? (
                        <a key={name} href={`/currency-wars/equipment#${e.slug}`} title={`${e.name}${e.recipe.length === 2 ? ` = ${e.recipe.join(" + ")}` : ""}`}>
                          <EquipmentIcon slug={e.slug} name={e.name} size={24} />
                        </a>
                      ) : null;
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">Hover an item for its recipe. <a href="/currency-wars/equipment" className="text-gold">Recipe chart →</a></p>
        </section>
      </aside>
    </div>
  );
}

