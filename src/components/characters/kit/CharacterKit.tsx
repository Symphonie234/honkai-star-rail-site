import Image from "next/image";
import type { ReactNode } from "react";
import { gameIcon } from "@/lib/images";
import { formatBonus, type Kit, type KitSkill, type Material } from "@/lib/kit";
import { KitDescription } from "./KitDescription";
import { SkillCard } from "./SkillCard";

const SECTIONS = [
  { id: "skills", label: "Skills" },
  { id: "memosprite", label: "Memosprite" },
  { id: "traces", label: "Traces" },
  { id: "eidolons", label: "Eidolons" },
  { id: "stats", label: "Stats & materials" },
] as const;

const isMemosprite = (s: KitSkill) => s.kind.startsWith("memosprite");
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];

/**
 * A character's full kit — skills, memosprite, Traces, Eidolons, stats and upgrade
 * materials — from imported game data (current game values).
 */
export function CharacterKit({ name, kit, materials }: { name: string; kit: Kit; materials: Map<string, Material> }) {
  const skills = kit.skills.filter((s) => !isMemosprite(s));
  const memosprite = kit.skills.filter(isMemosprite);
  const sections = SECTIONS.filter((s) => s.id !== "memosprite" || memosprite.length > 0);
  const max = kit.stats.at(-1)!;

  return (
    <div className="mt-16">
      {/* Sticks right below the site header, whatever its height (see HeaderHeight). */}
      <nav aria-label="Kit sections" className="sticky top-[var(--header-h,4rem)] z-30 -mx-2 mb-8 overflow-x-auto px-2 py-2">
        <ul className="inline-flex gap-1 rounded-full border border-line bg-space/90 p-1 text-sm whitespace-nowrap shadow-[0_8px_24px_rgb(0_0_0/0.4)] backdrop-blur-md">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block rounded-full px-4 py-1.5 text-muted transition-colors hover:bg-gold/15 hover:text-ink">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <KitSection id="skills" title={`${name}'s skills`}>
        <div className="grid gap-4 lg:grid-cols-2">
          {skills.map((s) => <SkillCard key={s.id} skill={s} />)}
        </div>
      </KitSection>

      {memosprite.length > 0 && (
        <KitSection id="memosprite" title="Memosprite">
          <div className="grid gap-4 lg:grid-cols-2">
            {memosprite.map((s) => <SkillCard key={s.id} skill={s} />)}
          </div>
        </KitSection>
      )}

      <KitSection id="traces" title="Traces">
        <div className="grid gap-4 lg:grid-cols-3">
          {kit.majorTraces.map((t) => (
            <article key={t.name} className="glass flex flex-col gap-3 rounded-2xl p-5">
              <header className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-space">
                  <Image src={gameIcon(t.icon)} alt="" width={30} height={30} />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                    {t.unlock > 0 ? `Ascension ${t.unlock}` : "Special unlock"}
                  </p>
                  <h4 className="font-display text-lg leading-tight font-bold">{t.name}</h4>
                </div>
              </header>
              <KitDescription desc={t.desc} params={t.params} className="text-sm" />
            </article>
          ))}
        </div>
        {kit.statBonuses.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold tracking-widest text-muted uppercase">Stat bonuses from minor Traces (total)</h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {kit.statBonuses.map((b) => (
                <li key={b.type} className="glass flex items-center gap-2 rounded-full py-1.5 pr-4 pl-2 text-sm">
                  {b.icon && <Image src={gameIcon(b.icon)} alt="" width={22} height={22} />}
                  {b.name} <strong className="text-gold-strong tabular-nums">{formatBonus(b.value, b.percent)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </KitSection>

      <KitSection id="eidolons" title="Eidolons">
        <ol className="grid gap-4 md:grid-cols-2">
          {kit.eidolons.map((e) => (
            <li key={e.rank} className="glass flex gap-4 rounded-2xl p-5">
              <span className="relative grid size-14 shrink-0 place-items-center rounded-full border border-violet/50 bg-space">
                <Image src={gameIcon(e.icon)} alt="" width={40} height={40} className="rounded-full" />
                <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-violet text-[0.65rem] font-bold text-space">
                  E{e.rank}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-widest text-violet uppercase">Eidolon {ROMAN[e.rank]}</p>
                <h4 className="font-display text-lg leading-tight font-bold">{e.name}</h4>
                <KitDescription desc={e.desc} className="mt-2 text-sm" />
              </div>
            </li>
          ))}
        </ol>
      </KitSection>

      <KitSection id="stats" title="Stats & materials">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <dl className="mb-4 flex flex-wrap gap-2 text-sm">
              <StatPill label="HP" value={max.hp} />
              <StatPill label="ATK" value={max.atk} />
              <StatPill label="DEF" value={max.def} />
              <StatPill label="SPD" value={max.spd} />
              <StatPill label="CRIT Rate" value={`${Math.round(kit.critRate * 100)}%`} />
              <StatPill label="CRIT DMG" value={`${Math.round(kit.critDmg * 100)}%`} />
              <StatPill label="Taunt" value={kit.taunt} />
              {kit.maxEnergy ? <StatPill label="Max Energy" value={kit.maxEnergy} /> : null}
            </dl>
            <div className="glass overflow-x-auto rounded-2xl">
              <table className="w-full text-right text-sm tabular-nums">
                <caption className="sr-only">Base stats by level and ascension</caption>
                <thead className="border-b border-line text-xs tracking-widest text-muted uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 text-left font-semibold">Level</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">HP</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">ATK</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">DEF</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">SPD</th>
                  </tr>
                </thead>
                <tbody>
                  {kit.stats.map((s) => (
                    <tr key={`${s.level}-${s.ascension}`} className="border-b border-line/50 last:border-0">
                      <th scope="row" className="px-4 py-2 text-left font-normal">
                        Lv. {s.level}
                        {s.ascension > 0 && <span className="ml-1 text-xs text-muted">A{s.ascension}</span>}
                      </th>
                      <td className="px-4 py-2">{Math.round(s.hp)}</td>
                      <td className="px-4 py-2">{Math.round(s.atk)}</td>
                      <td className="px-4 py-2">{Math.round(s.def)}</td>
                      <td className="px-4 py-2">{s.spd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <MaterialGroup title="Ascension · Lv. 1 → 80" items={kit.materials.ascension} materials={materials} />
            <MaterialGroup title="All Traces to max" items={kit.materials.traces} materials={materials} />
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Values reflect the current game data and may differ from the character&apos;s launch version.
          {kit.hasEnhanced && ` ${name} later received an Enhanced version; this page shows the original kit.`}
        </p>
      </KitSection>
    </div>
  );
}

function KitSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-14 scroll-mt-[calc(var(--header-h,4rem)+4.5rem)] first-of-type:mt-0">
      <h2 id={`${id}-title`} className="mb-6 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-xl px-3 py-2">
      <dt className="text-[0.65rem] tracking-widest text-muted uppercase">{label}</dt>
      <dd className="font-semibold tabular-nums">{typeof value === "number" ? Math.round(value).toLocaleString("en-US") : value}</dd>
    </div>
  );
}

/** Rarity backgrounds in the game's own order: gray, green, blue, purple, gold. */
const RARITY_BG = [
  "",
  "from-[#5b5f6b] to-[#2e3140]",
  "from-[#3f7a5c] to-[#1f3b2e]",
  "from-[#3d6fb0] to-[#1d3358]",
  "from-[#7b55c7] to-[#3a2763]",
  "from-[#c99a45] to-[#6b4e1d]",
];

function MaterialGroup({ title, items, materials }: { title: string; items: { id: string; num: number }[]; materials: Map<string, Material> }) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest text-muted uppercase">{title}</h4>
      <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
        {items.map(({ id, num }) => {
          const m = materials.get(id);
          if (!m) return null;
          return (
            <li key={id} title={m.sources.length ? `${m.name}\nFrom: ${m.sources.join(", ")}` : m.name}
              className="glass flex flex-col items-center overflow-hidden rounded-xl text-center">
              <span className={`grid w-full place-items-center bg-gradient-to-b py-2 ${RARITY_BG[m.rarity] ?? RARITY_BG[1]}`}>
                <Image src={gameIcon(m.icon)} alt="" width={48} height={48} />
              </span>
              <span className="w-full px-1 pt-1 text-sm font-semibold tabular-nums">{num.toLocaleString("en-US")}</span>
              <span className="line-clamp-2 w-full px-1.5 pb-2 text-[0.7rem] leading-tight text-muted">{m.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
