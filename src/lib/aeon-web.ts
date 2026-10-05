import type { AeonWebData } from "./queries";

/*
 * Layout for the Aeons web: a radial constellation in a 1000×1000 box.
 *  - Aeons on the middle ring, evenly spaced, in sortOrder.
 *  - Characters on the outer ring, fanned out around their Path's Aeon.
 *  - Factions on the inner ring, near the Aeon they serve (or their members).
 * Pure and deterministic, so server and client render identical positions.
 */

export const SIZE = 1000;
/**
 * Visible area: the 1000×1000 layout plus room for the outer ring's labels, which
 * extend past it at the sides (e.g. "Silver Wolf" to the right of the ring).
 */
export const VIEW = { x: -120, y: -36, width: SIZE + 240, height: SIZE + 72 };
const C = SIZE / 2;
export const R_AEON = 300;
export const R_CHARACTER = 432;
// Inside the Aeon labels, which sit toward the center from each Aeon.
export const R_FACTION = 150;
/** Angular gap between characters that share an Aeon. */
const CHARACTER_SPREAD = 8.5;

export type NodeId = `a:${string}` | `f:${string}` | `c:${string}`;
export type Point = { x: number; y: number; angle: number };
export type Edge = { from: NodeId; to: NodeId; kind: "path" | "devotion" | "membership" };

const rad = (deg: number) => (deg * Math.PI) / 180;
// Rounded: Node and browsers can disagree in the last digits of Math.cos/sin, and
// any difference in the server-rendered coordinates breaks hydration.
const round = (n: number) => Math.round(n * 100) / 100;
export const polar = (r: number, angle: number): Point => ({
  x: round(C + r * Math.cos(rad(angle))),
  y: round(C + r * Math.sin(rad(angle))),
  angle,
});

/** Mean of angles in degrees, handling wrap-around (350° and 10° average to 0°). */
function circularMean(angles: number[]) {
  const x = angles.reduce((s, a) => s + Math.cos(rad(a)), 0);
  const y = angles.reduce((s, a) => s + Math.sin(rad(a)), 0);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

const norm = (a: number) => ((a % 360) + 360) % 360;

export function layoutWeb({ aeons, factions, characters }: AeonWebData, options: { hiddenMemberships: Set<string> }) {
  const positions = new Map<NodeId, Point>();
  const edges: Edge[] = [];
  /** Alternating 0/1 per character within an Aeon's group, to stagger crowded labels. */
  const labelLevels = new Map<NodeId, number>();

  // Aeons: evenly around the ring, starting at the top.
  const aeonAngle = new Map<string, number>();
  const aeonByPath = new Map<string, string>();
  aeons.forEach((a, i) => {
    const angle = -90 + (i * 360) / aeons.length;
    aeonAngle.set(a.slug, angle);
    positions.set(`a:${a.slug}`, polar(R_AEON, angle));
    if (a.pathSlug) aeonByPath.set(a.pathSlug, a.slug);
  });

  // Characters: fanned out around their Path's Aeon.
  const byAeon = Map.groupBy(characters, (c) => aeonByPath.get(c.pathSlug));
  const characterAngle = new Map<string, number>();
  for (const [aeonSlug, group] of byAeon) {
    if (!aeonSlug) continue;
    const base = aeonAngle.get(aeonSlug)!;
    group.forEach((c, j) => {
      const angle = base + (j - (group.length - 1) / 2) * CHARACTER_SPREAD;
      characterAngle.set(c.slug, angle);
      positions.set(`c:${c.slug}`, polar(R_CHARACTER, angle));
      labelLevels.set(`c:${c.slug}`, j % 2);
      edges.push({ from: `a:${aeonSlug}`, to: `c:${c.slug}`, kind: "path" });
    });
  }

  // Factions: prefer the angle of their Aeon, else the middle of their members;
  // then nudge apart so neighbours keep a minimum gap.
  const preferred = factions.map((f) => {
    const members = characters.filter((c) => c.factionSlug === f.slug && !options.hiddenMemberships.has(c.slug));
    const memberAngles = members.map((c) => characterAngle.get(c.slug)).filter((a): a is number => a !== undefined);
    const angle = f.aeonSlug ? aeonAngle.get(f.aeonSlug)! : memberAngles.length ? circularMean(memberAngles) : 0;
    return { f, angle: norm(angle + 90) }; // measured from the top, so sorting starts there
  });
  preferred.sort((a, b) => a.angle - b.angle);
  const minGap = (360 / Math.max(factions.length, 1)) * 0.85;
  for (let i = 1; i < preferred.length; i++) {
    preferred[i].angle = Math.max(preferred[i].angle, preferred[i - 1].angle + minGap);
  }
  // If pushing ran past a full turn, shift everything back so the ring closes evenly.
  const overflow = preferred.length ? preferred.at(-1)!.angle + minGap - (preferred[0].angle + 360) : 0;
  if (overflow > 0) preferred.forEach((p, i) => (p.angle -= (overflow * i) / preferred.length));
  for (const { f, angle } of preferred) {
    positions.set(`f:${f.slug}`, polar(R_FACTION, angle - 90));
    if (f.aeonSlug) edges.push({ from: `a:${f.aeonSlug}`, to: `f:${f.slug}`, kind: "devotion" });
  }

  for (const c of characters) {
    if (c.factionSlug && !options.hiddenMemberships.has(c.slug)) {
      edges.push({ from: `f:${c.factionSlug}`, to: `c:${c.slug}`, kind: "membership" });
    }
  }

  return { positions, edges, labelLevels };
}

/** A gentle curve between two points, bowed toward the center so lines read as a web. */
export function edgePath(a: Point, b: Point) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const cx = round(C + (mx - C) * 0.55);
  const cy = round(C + (my - C) * 0.55);
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

/** Text anchor that keeps a label outside the ring: start on the right, end on the left. */
export function anchorFor(angle: number): "start" | "middle" | "end" {
  const x = Math.cos(rad(angle));
  if (x > 0.25) return "start";
  if (x < -0.25) return "end";
  return "middle";
}
