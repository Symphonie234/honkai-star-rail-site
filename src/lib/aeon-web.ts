import type { AeonWebData } from "./queries";

/*
 * Layout for the Aeons web: a radial constellation in a 1000×1000 box.
 *  - Aeons on the middle ring, each centered over its group of characters.
 *  - Characters outside, alternating between two rings so many fit side by side.
 *  - Factions on the inner ring, near the Aeon they serve (or their members).
 * Each Aeon claims angular space in proportion to its group (with a minimum, so
 * Aeons with few or no playable characters keep their room).
 * Pure and deterministic, so server and client render identical positions.
 */

export const SIZE = 1000;
const C = SIZE / 2;
/**
 * Visible area: the 1000×1000 layout plus room for the outer ring's labels, which
 * extend past it at the sides ("Trailblazer (Remembrance)" on the left).
 */
export const VIEW = { x: -210, y: -40, width: SIZE + 420, height: SIZE + 80 };
export const R_AEON = 290;
export const R_CHARACTER_INNER = 398;
export const R_CHARACTER_OUTER = 456;
/** Character labels sit just beyond the outer ring. */
export const R_LABEL = 490;
// Inside the Aeon labels, which sit toward the center from each Aeon.
export const R_FACTION = 150;
/** The least angular space an Aeon gets, in character slots. */
const MIN_SLOTS = 5;

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
  /** Alternating 0/1 within an Aeon's group: which character ring, and which label row. */
  const labelLevels = new Map<NodeId, number>();

  // Group characters under the Aeon of their Path.
  const aeonByPath = new Map(aeons.filter((a) => a.pathSlug).map((a) => [a.pathSlug!, a.slug]));
  const groups = new Map(aeons.map((a) => [a.slug, characters.filter((c) => aeonByPath.get(c.pathSlug) === a.slug)]));
  const slots = aeons.map((a) => Math.max(groups.get(a.slug)!.length, MIN_SLOTS));
  const step = 360 / slots.reduce((s, n) => s + n, 0);

  // Walk the ring clockwise from the top, centering each Aeon over its slots.
  const aeonAngle = new Map<string, number>();
  const characterAngle = new Map<string, number>();
  let cursor = -90 - (slots[0] * step) / 2;
  aeons.forEach((a, i) => {
    const center = cursor + (slots[i] * step) / 2;
    aeonAngle.set(a.slug, center);
    positions.set(`a:${a.slug}`, polar(R_AEON, center));

    const group = groups.get(a.slug)!;
    group.forEach((c, j) => {
      const angle = center + (j - (group.length - 1) / 2) * step;
      const id: NodeId = `c:${c.slug}`;
      characterAngle.set(c.slug, angle);
      labelLevels.set(id, j % 2);
      positions.set(id, polar(j % 2 ? R_CHARACTER_OUTER : R_CHARACTER_INNER, angle));
      edges.push({ from: `a:${a.slug}`, to: id, kind: "path" });
    });
    cursor += slots[i] * step;
  });

  // Factions: prefer the angle of their Aeon, else the middle of their members;
  // then nudge apart so neighbours keep a minimum gap.
  const preferred = factions.map((f) => {
    const memberAngles = characters
      .filter((c) => c.factionSlug === f.slug && !options.hiddenMemberships.has(c.slug))
      .map((c) => characterAngle.get(c.slug))
      .filter((a): a is number => a !== undefined);
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
