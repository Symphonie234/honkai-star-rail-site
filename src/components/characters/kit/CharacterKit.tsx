import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { eidolonArt, gameIcon, lightConePreview, pathIcon } from "@/lib/images";
import { formatBonus, type Kit, type KitSkill, type Material } from "@/lib/kit";
import type { LightCone } from "@/lib/light-cone";
import { LightConePassive } from "../../light-cones/LightConePassive";
import { Stars } from "../CharacterCard";
import { EidolonGallery } from "./EidolonGallery";
import { KitDescription } from "./KitDescription";
import { MaterialGroup } from "./MaterialTiles";
import { SkillCard } from "./SkillCard";

const SECTIONS = [
  { id: "skills", label: "Skills" },
  { id: "memosprite", label: "Memosprite" },
  { id: "traces", label: "Traces" },
  { id: "eidolons", label: "Eidolons" },
  { id: "light-cone", label: "Light Cone" },
  { id: "stats", label: "Stats & materials" },
] as const;

const isMemosprite = (s: KitSkill) => s.kind.startsWith("memosprite");

export function CharacterKit({
  name, kit, materials, lightCone,
}: {
  name: string;
  kit: Kit;
  materials: Map<string, Material>;
  lightCone?: LightCone | null;
}) {
  const skills = kit.skills.filter((s) => !isMemosprite(s));
  const memosprite = kit.skills.filter(isMemosprite);
  const sections = SECTIONS.filter(
    (s) => (s.id !== "memosprite" || memosprite.length > 0) && (s.id !== "light-cone" || lightCone),
  );
  const max = kit.stats.at(-1)!;

  return (
    <div className="mt-16">
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
        <EidolonGallery
          name={name}
          eidolons={kit.eidolons.map((e) => ({
            rank: e.rank, name: e.name, desc: e.desc, icon: gameIcon(e.icon), art: e.art ? eidolonArt(kit.gameId, e.rank) : null,
          }))}
        />
        <p className="mt-3 text-xs text-muted">Select an Eidolon to browse the full art and effects.</p>
      </KitSection>

      {lightCone && (
        <KitSection id="light-cone" title="Signature Light Cone">
          <div className="glass grid gap-6 rounded-2xl p-5 sm:grid-cols-[180px_1fr] sm:p-6">
            <Link href={`/light-cones/${lightCone.slug}`} className="group mx-auto block w-40 sm:w-full">
              <Image
                src={lightConePreview(lightCone.id)}
                alt={lightCone.name}
                width={348}
                height={408}
                sizes="180px"
                className="w-full drop-shadow-[0_12px_24px_rgb(0_0_0/0.5)] transition duration-300 ease-out-expo group-hover:-translate-y-1"
              />
            </Link>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm">
                <Stars rarity={lightCone.rarity} />
                <Image src={pathIcon(lightCone.pathSlug)} alt="" width={18} height={18} />
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold">
                <Link href={`/light-cones/${lightCone.slug}`} className="hover:text-gold">{lightCone.name}</Link>
              </h3>
              <LightConePassive skill={lightCone.skill} desc={lightCone.desc} params={lightCone.params} heading="h4" className="mt-4" />
              <Link href={`/light-cones/${lightCone.slug}`} className="mt-4 inline-block text-sm font-semibold text-gold hover:text-gold-strong">
                Stats, materials and story →
              </Link>
            </div>
          </div>
        </KitSection>
      )}

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
