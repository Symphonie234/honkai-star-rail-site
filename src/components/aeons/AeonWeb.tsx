"use client";

import { MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type SVGProps } from "react";
import {
  anchorFor, edgePath, layoutWeb, R_AEON, R_CHARACTER_INNER, R_CHARACTER_OUTER, R_FACTION, R_LABEL, SIZE, VIEW,
  type Edge, type NodeId, type Point,
} from "@/lib/aeon-web";
import { characterIcon, pathIcon } from "@/lib/images";
import type { AeonWebData } from "@/lib/queries";
import { isAvailable, isRevealed } from "@/lib/spoilers";
import { colorVar } from "@/lib/theme";
import { useArtVariant } from "../characters/art-variant";
import { CloseIcon } from "../icons";
import { Spoiler } from "../Spoiler";
import { useStoryProgress } from "../spoilers/story-progress";

type Aeon = AeonWebData["aeons"][number];
type Faction = AeonWebData["factions"][number];
type Character = AeonWebData["characters"][number];

const EDGE_COLOR: Record<Edge["kind"], string> = {
  path: "var(--color-gold)",
  devotion: "var(--color-cyan)",
  membership: "var(--color-violet)",
};

type NodeHandlers = {
  onHover: (id: NodeId | null) => void;
  onSelect: (id: NodeId) => void;
};

function nodeProps(id: NodeId, label: string, selected: boolean, { onHover, onSelect }: NodeHandlers) {
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    "aria-pressed": selected,
    className: "cursor-pointer outline-none",
    onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && onHover(id),
    onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && onHover(null),
    onFocus: () => onHover(id),
    onBlur: () => onHover(null),
    onClick: () => onSelect(id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    },
  } as const;
}

const offset = (angle: number, d: number) => ({
  x: Math.round(Math.cos((angle * Math.PI) / 180) * d * 100) / 100,
  y: Math.round(Math.sin((angle * Math.PI) / 180) * d * 100) / 100,
});

function Label({ children, ...props }: SVGProps<SVGTextElement>) {
  return (
    <text paintOrder="stroke" stroke="var(--color-space)" strokeWidth={6} strokeLinejoin="round" {...props}>
      {children}
    </text>
  );
}

export function AeonWeb({ data: allData }: { data: AeonWebData }) {
  const progress = useStoryProgress();
  const data = useMemo(
    () => ({
      aeons: allData.aeons.filter((a) => isAvailable(a.introducedVersion, progress)),
      factions: allData.factions.filter((f) => isAvailable(f.introducedVersion, progress)),
      characters: allData.characters.filter((c) => isAvailable(c.releaseVersion, progress)),
    }),
    [allData, progress],
  );
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [hovered, setHovered] = useState<NodeId | null>(null);
  const [showCharacters, setShowCharacters] = useState(true);
  const [showFactions, setShowFactions] = useState(true);

  const hiddenKey = data.characters.filter((c) => !isRevealed(c.spoilerVersion, progress)).map((c) => c.slug).join();
  const { positions, edges, labelLevels, aeonLabels } = useMemo(
    () => layoutWeb(data, { hiddenMemberships: new Set(hiddenKey ? hiddenKey.split(",") : []) }),
    [data, hiddenKey],
  );

  const visible = (id: NodeId) =>
    (showCharacters || !id.startsWith("c:")) && (showFactions || !id.startsWith("f:"));
  const shownEdges = edges.filter((e) => visible(e.from) && visible(e.to));

  const active = hovered && visible(hovered) ? hovered : selected && visible(selected) ? selected : null;
  const lit = new Set<NodeId>(active ? [active] : []);
  for (const e of shownEdges) {
    if (e.from === active) lit.add(e.to);
    if (e.to === active) lit.add(e.from);
  }
  const dim = (id: NodeId) => (active && !lit.has(id) ? 0.18 : 1);
  const litCharacters = [...lit].filter((id) => id.startsWith("c:")).length;
  const labelCharacter = (id: NodeId) => id === active || (lit.has(id) && litCharacters <= 6);

  const select = (id: NodeId) => setSelected((s) => (s === id ? null : id));
  const handlers: NodeHandlers = { onHover: setHovered, onSelect: select };
  const hidden = new Set(hiddenKey ? hiddenKey.split(",") : []);

  const aeonOf = (pathSlug: string) => data.aeons.find((a) => a.pathSlug === pathSlug);
  const describe = (id: NodeId): { title: string; kind: string } => {
    const slug = id.slice(2);
    if (id.startsWith("a:")) {
      const a = data.aeons.find((x) => x.slug === slug)!;
      return { title: a.name, kind: `Aeon of ${a.concept}` };
    }
    if (id.startsWith("f:")) return { title: data.factions.find((x) => x.slug === slug)!.name, kind: "Faction" };
    const c = data.characters.find((x) => x.slug === slug)!;
    return { title: c.name, kind: `Walks ${aeonOf(c.pathSlug)?.concept ?? c.pathSlug}` };
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onKeyDown={onKeyDown}>
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Show in the web">
            <Toggle pressed={showCharacters} onChange={setShowCharacters}>Characters</Toggle>
            <Toggle pressed={showFactions} onChange={setShowFactions}>Factions</Toggle>
            <span className="ml-auto hidden text-xs text-muted sm:block">Hover to preview · click to pin · Esc to clear</span>
          </div>

          <div className="glass mx-auto aspect-[1420/1080] w-full max-w-[920px] overflow-hidden rounded-3xl">
            <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`} className="h-full w-full select-none" role="group" aria-label="Web of Aeons, factions and characters">
              <defs>
                <clipPath id="avatar-clip" clipPathUnits="objectBoundingBox">
                  <circle cx="0.5" cy="0.5" r="0.5" />
                </clipPath>
                <radialGradient id="core-glow">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx={SIZE / 2} cy={SIZE / 2} r={R_FACTION - 30} fill="url(#core-glow)" />
              {[R_FACTION, R_AEON, R_CHARACTER_INNER, R_CHARACTER_OUTER].map((r) => (
                <circle key={r} cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke="var(--color-line)" strokeDasharray="2 8" />
              ))}

              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}>
                {shownEdges.map((e) => {
                  const on = active && (e.from === active || e.to === active);
                  return (
                    <path
                      key={`${e.from}-${e.to}`}
                      d={edgePath(positions.get(e.from)!, positions.get(e.to)!)}
                      fill="none"
                      stroke={on ? EDGE_COLOR[e.kind] : "var(--color-muted)"}
                      strokeWidth={on ? 3 : 1.25}
                      strokeOpacity={on ? 0.95 : active ? 0.05 : 0.22}
                      className="transition-[stroke-opacity,stroke-width] duration-300"
                    />
                  );
                })}
              </motion.g>

              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                {data.aeons.map((a) => {
                  const id: NodeId = `a:${a.slug}`;
                  return <AeonNode key={a.slug} aeon={a} at={positions.get(id)!} label={aeonLabels.get(a.slug)!} opacity={dim(id)} selected={selected === id} handlers={handlers} />;
                })}
              </motion.g>

              {showFactions && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
                  {data.factions.map((f) => {
                    const id: NodeId = `f:${f.slug}`;
                    return (
                      <FactionNode key={f.slug} faction={f} at={positions.get(id)!} opacity={dim(id)}
                        selected={selected === id} showLabel={lit.has(id)} handlers={handlers} />
                    );
                  })}
                </motion.g>
              )}

              {showCharacters && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}>
                  {data.characters.map((c) => {
                    const id: NodeId = `c:${c.slug}`;
                    const at = positions.get(id);
                    if (!at) return null;
                    return (
                      <CharacterNode key={c.slug} character={c} at={at} labelLevel={labelLevels.get(id) ?? 0} opacity={dim(id)}
                        selected={selected === id} showLabel={labelCharacter(id)} lit={lit.has(id)} handlers={handlers} />
                    );
                  })}
                </motion.g>
              )}

              <g pointerEvents="none" textAnchor="middle">
                {active ? (
                  <>
                    <Label x={SIZE / 2} y={SIZE / 2 - 4} fontSize={34} fontWeight={700} fill="var(--color-ink)" className="font-display">
                      {describe(active).title}
                    </Label>
                    <Label x={SIZE / 2} y={SIZE / 2 + 26} fontSize={16} fill="var(--color-gold)" letterSpacing={3}>
                      {describe(active).kind.toUpperCase()}
                    </Label>
                  </>
                ) : (
                  <>
                    <Label x={SIZE / 2} y={SIZE / 2 - 2} fontSize={26} fontWeight={700} fill="var(--color-ink)" className="font-display">The Aeons</Label>
                    <Label x={SIZE / 2} y={SIZE / 2 + 24} fontSize={15} fill="var(--color-muted)">Select anything to trace its ties</Label>
                  </>
                )}
              </g>
            </svg>
          </div>
        </div>

        <Panel data={data} selected={selected} hidden={hidden} onSelect={(id) => setSelected(id)} onClear={() => setSelected(null)} />
      </div>
    </MotionConfig>
  );
}

function Toggle({ pressed, onChange, children }: { pressed: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      className="rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-ink aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink"
    >
      {children}
    </button>
  );
}

type NodeBase = { at: Point; opacity: number; selected: boolean; handlers: NodeHandlers };

function AeonNode({ aeon, at, label, opacity, selected, handlers }: NodeBase & { aeon: Aeon; label: { x: number; y: number } }) {
  const id: NodeId = `a:${aeon.slug}`;
  return (
    <g transform={`translate(${at.x} ${at.y})`} style={{ opacity }} {...nodeProps(id, `${aeon.name}, Aeon of ${aeon.concept}`, selected, handlers)}>
      <circle r={39} fill="none" stroke="var(--color-gold)" strokeWidth={3} className="opacity-0 in-focus-visible:opacity-100" />
      <circle r={31} fill="var(--color-surface-solid)" stroke="var(--color-gold)" strokeOpacity={selected ? 1 : 0.5} strokeWidth={selected ? 3 : 2} />
      {aeon.pathSlug ? (
        <image href={pathIcon(aeon.pathSlug)} x={-19} y={-19} width={38} height={38} />
      ) : (
        <text textAnchor="middle" dominantBaseline="central" fontSize={30} fill="var(--color-gold)">{aeon.glyph}</text>
      )}
      <g textAnchor="middle">
        <Label x={label.x} y={label.y} fontSize={20} fontWeight={700} fill="var(--color-gold-strong)" className="font-display">{aeon.name}</Label>
        <Label x={label.x} y={label.y + 19} fontSize={13} fill="var(--color-muted)" letterSpacing={1.5}>{aeon.concept.toUpperCase()}</Label>
      </g>
    </g>
  );
}

function CharacterNode({ character: c, at, labelLevel, opacity, selected, showLabel, lit, handlers }: NodeBase & {
  character: Character; labelLevel: number; showLabel: boolean; lit: boolean;
}) {
  const id: NodeId = `c:${c.slug}`;
  const [variant] = useArtVariant(c.art);
  const anchor = anchorFor(at.angle);
  const ring = Math.hypot(at.x - SIZE / 2, at.y - SIZE / 2);
  const out = offset(at.angle, R_LABEL - ring + (anchor === "middle" ? labelLevel * 24 : 0));
  return (
    <g transform={`translate(${at.x} ${at.y})`} style={{ opacity, ...colorVar(c.elementSlug) }} {...nodeProps(id, c.name, selected, handlers)}>
      <circle r={27} fill="none" stroke="var(--color-gold)" strokeWidth={3} className="opacity-0 in-focus-visible:opacity-100" />
      <circle r={22} fill="var(--color-space)" stroke="var(--c)" strokeWidth={selected || lit ? 3.5 : 2} />
      {variant ? (
        <image href={characterIcon(variant.gameId)} x={-20} y={-20} width={40} height={40} clipPath="url(#avatar-clip)" />
      ) : (
        <text textAnchor="middle" dominantBaseline="central" fontSize={18} fill="var(--c)">{c.name[0]}</text>
      )}
      {showLabel && (
        <Label x={out.x} y={out.y + 5} fontSize={17} fontWeight={600} fill="var(--color-ink)" textAnchor={anchor}>
          {c.name}
        </Label>
      )}
    </g>
  );
}

function FactionNode({ faction: f, at, opacity, selected, showLabel, handlers }: NodeBase & { faction: Faction; showLabel: boolean }) {
  const id: NodeId = `f:${f.slug}`;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${Math.cos(a) * 15},${Math.sin(a) * 15}`;
  }).join(" ");
  return (
    <g transform={`translate(${at.x} ${at.y})`} style={{ opacity }} {...nodeProps(id, `${f.name}, faction`, selected, handlers)}>
      <circle r={22} fill="none" stroke="var(--color-gold)" strokeWidth={3} className="opacity-0 in-focus-visible:opacity-100" />
      <polygon points={hex} fill="var(--color-space)" stroke="var(--color-cyan)" strokeWidth={selected ? 3.5 : 2} />
      <circle r={4} fill="var(--color-cyan)" />
      {showLabel && (
        <Label y={38} fontSize={16} fontWeight={600} fill="var(--color-cyan)" textAnchor="middle">{f.name}</Label>
      )}
    </g>
  );
}

function Panel({
  data, selected, hidden, onSelect, onClear,
}: {
  data: AeonWebData;
  selected: NodeId | null;
  hidden: Set<string>;
  onSelect: (id: NodeId) => void;
  onClear: () => void;
}) {
  const slug = selected?.slice(2);
  const aeon = selected?.startsWith("a:") ? data.aeons.find((a) => a.slug === slug) : undefined;
  const faction = selected?.startsWith("f:") ? data.factions.find((f) => f.slug === slug) : undefined;
  const character = selected?.startsWith("c:") ? data.characters.find((c) => c.slug === slug) : undefined;

  const aeonOfPath = (pathSlug: string) => data.aeons.find((a) => a.pathSlug === pathSlug);
  const membersOf = (f: Faction) => data.characters.filter((c) => c.factionSlug === f.slug && !hidden.has(c.slug));

  return (
    <aside aria-live="polite" className="glass h-fit rounded-3xl p-6 lg:sticky lg:top-24">
      {selected && (
        <button type="button" onClick={onClear} aria-label="Clear selection" title="Clear (Esc)"
          className="float-right -mt-1 -mr-1 grid size-9 place-items-center rounded-full text-muted transition hover:text-gold">
          <CloseIcon />
        </button>
      )}

      {aeon && (
        <div>
          <p className="eyebrow">Aeon of {aeon.concept}</p>
          <h2 className="mt-2 flex items-center gap-3 font-display text-3xl font-bold">
            {aeon.pathSlug ? (
              <Image src={pathIcon(aeon.pathSlug)} alt="" width={36} height={36} />
            ) : (
              <span aria-hidden="true" className="text-gold">{aeon.glyph}</span>
            )}
            {aeon.name}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">{aeon.description}</p>
          <Link href={`/aeons/${aeon.slug}`} className="mt-3 inline-block font-semibold text-gold hover:text-gold-strong">
            Read {aeon.name}&apos;s full lore →
          </Link>
          {aeon.path ? (
            <Section title={`Walking ${aeon.path.name}`}>
              <AvatarList characters={data.characters.filter((c) => c.pathSlug === aeon.pathSlug)} onSelect={onSelect} />
            </Section>
          ) : (
            <p className="mt-6 text-sm text-muted">No playable Path — no travelers in the archive walk {aeon.concept}.</p>
          )}
          <FactionChips factions={data.factions.filter((f) => f.aeonSlug === aeon.slug)} title="Devoted factions" onSelect={onSelect} />
        </div>
      )}

      {faction && (
        <div>
          <p className="eyebrow !text-cyan">Faction</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{faction.name}</h2>
          {faction.description && <p className="mt-4 leading-relaxed text-muted">{faction.description}</p>}
          <Section title="Devoted to">
            {faction.aeonSlug ? (
              <AeonChip aeon={data.aeons.find((a) => a.slug === faction.aeonSlug)!} onSelect={onSelect} />
            ) : (
              <p className="text-sm text-muted">No Aeon allegiance on record.</p>
            )}
          </Section>
          {membersOf(faction).length > 0 && (
            <Section title="Members in the archive">
              <AvatarList characters={membersOf(faction)} onSelect={onSelect} />
            </Section>
          )}
        </div>
      )}

      {character && (
        <CharacterDetail character={character} aeon={aeonOfPath(character.pathSlug)}
          faction={data.factions.find((f) => f.slug === character.factionSlug)} onSelect={onSelect} />
      )}

      {!selected && (
        <div>
          <p className="eyebrow">How to read the web</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Gods, factions, travelers</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The Aeons form the middle ring. Each traveler orbits the Aeon whose Path they walk, and the factions at the
            heart are tied to the Aeons they serve and the travelers who belong to them.
          </p>
          <ul className="mt-4 flex flex-col gap-1.5 text-sm">
            <LegendRow color="var(--color-gold)">Walks the Aeon&apos;s Path</LegendRow>
            <LegendRow color="var(--color-cyan)">Faction devoted to an Aeon</LegendRow>
            <LegendRow color="var(--color-violet)">Member of a faction</LegendRow>
          </ul>
          <Section title="Aeons">
            <div className="flex flex-wrap gap-2">
              {data.aeons.map((a) => <AeonChip key={a.slug} aeon={a} onSelect={onSelect} />)}
            </div>
          </Section>
          <FactionChips factions={data.factions} title="Factions" onSelect={onSelect} />
        </div>
      )}
    </aside>
  );
}

function CharacterDetail({ character: c, aeon, faction, onSelect }: {
  character: Character; aeon?: Aeon; faction?: Faction; onSelect: (id: NodeId) => void;
}) {
  const [variant] = useArtVariant(c.art);
  const factionChip = faction && (
    <button type="button" onClick={() => onSelect(`f:${faction.slug}`)} className={chipClass("cyan")}>{faction.name}</button>
  );
  return (
    <div style={colorVar(c.elementSlug)}>
      <p className="eyebrow !text-[var(--c)]">Traveler</p>
      <div className="mt-2 flex items-center gap-4">
        {variant && (
          <Image src={characterIcon(variant.gameId)} alt="" width={72} height={72}
            className="rounded-full border-2 border-[var(--c)] bg-space" />
        )}
        <h2 className="font-display text-3xl font-bold">{c.name}</h2>
      </div>
      <Section title="Walks the Path of">
        {aeon ? <AeonChip aeon={aeon} onSelect={onSelect} /> : <span className="text-sm text-muted">—</span>}
      </Section>
      <Section title="Faction">
        {!faction ? (
          <span className="text-sm text-muted">Unaffiliated</span>
        ) : c.spoilerVersion ? (
          <Spoiler version={c.spoilerVersion}>{factionChip}</Spoiler>
        ) : (
          factionChip
        )}
      </Section>
      <Link href={`/characters/${c.slug}`} className="mt-6 inline-block font-semibold text-gold hover:text-gold-strong">
        Open {c.name}&apos;s profile →
      </Link>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

const chipClass = (color: "gold" | "cyan") =>
  `rounded-full border px-3 py-1 text-sm transition ${
    color === "gold"
      ? "border-gold/40 text-gold hover:border-gold hover:bg-gold/10"
      : "border-cyan/40 text-cyan hover:border-cyan hover:bg-cyan/10"
  }`;

function AeonChip({ aeon, onSelect }: { aeon: Aeon; onSelect: (id: NodeId) => void }) {
  return (
    <button type="button" onClick={() => onSelect(`a:${aeon.slug}`)} className={chipClass("gold")}>
      {aeon.name} <span className="text-muted">· {aeon.concept}</span>
    </button>
  );
}

function FactionChips({ factions, title, onSelect }: { factions: Faction[]; title: string; onSelect: (id: NodeId) => void }) {
  if (factions.length === 0) return null;
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-2">
        {factions.map((f) => (
          <button key={f.slug} type="button" onClick={() => onSelect(`f:${f.slug}`)} className={chipClass("cyan")}>{f.name}</button>
        ))}
      </div>
    </Section>
  );
}

function AvatarList({ characters, onSelect }: { characters: Character[]; onSelect: (id: NodeId) => void }) {
  if (characters.length === 0) return <p className="text-sm text-muted">None in the archive yet.</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {characters.map((c) => <li key={c.slug}><AvatarButton character={c} onSelect={onSelect} /></li>)}
    </ul>
  );
}

function AvatarButton({ character: c, onSelect }: { character: Character; onSelect: (id: NodeId) => void }) {
  const [variant] = useArtVariant(c.art);
  return (
    <button type="button" onClick={() => onSelect(`c:${c.slug}`)} style={colorVar(c.elementSlug)}
      className="flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 text-sm transition hover:border-[var(--c)]">
      {variant && <Image src={characterIcon(variant.gameId)} alt="" width={28} height={28} className="rounded-full bg-space" />}
      {c.name}
    </button>
  );
}

function LegendRow({ color, children }: { color: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-muted">
      <span aria-hidden="true" className="h-0.5 w-6 rounded-full" style={{ background: color }} />
      {children}
    </li>
  );
}
