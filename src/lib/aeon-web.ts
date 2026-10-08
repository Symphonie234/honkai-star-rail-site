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
/** Aeon labels (name over concept) sit this far inside the ring, toward the center. */
const R_AEON_LABEL = R_AEON - 58;
/** How far a label may slide along the ring, in degrees, to clear a neighbour. */
const MAX_LABEL_SLIDE = 14;

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
  /** Per Aeon, where its label sits, relative to the Aeon. */
  const aeonLabels = new Map<string, { x: number; y: number }>();

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

  // Aeon labels: centered toward the middle, under each Aeon. Near the top and bottom of
  // the ring they run side by side, so where neighbours would overlap, slide both apart
  // along the ring (sizes measured from the rendered labels: ~15px per letter of the
  // name, ~10px per letter of the concept; two lines, ~46px tall).
  const labelAngle = aeons.map((a) => aeonAngle.get(a.slug)!);
  const halfWidth = aeons.map((a) => Math.max(a.name.length * 15, a.concept.length * 10) / 2 + 4);
  const box = (i: number) => {
    const p = polar(R_AEON_LABEL, labelAngle[i]);
    return { x1: p.x - halfWidth[i], x2: p.x + halfWidth[i], y1: p.y - 22, y2: p.y + 26 };
  };
  const overlap = (i: number, j: number) => {
    const a = box(i), b = box(j);
    return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
  };
  for (let round = 0; round < 200; round++) {
    let moved = false;
    for (let i = 0; i < aeons.length; i++) {
      const j = (i + 1) % aeons.length; // ring order, so the last neighbours the first
      if (i === j || !overlap(i, j)) continue;
      const home = (k: number) => aeonAngle.get(aeons[k].slug)!;
      if (labelAngle[i] - home(i) > -MAX_LABEL_SLIDE) labelAngle[i] -= 0.5;
      if (labelAngle[j] - home(j) < MAX_LABEL_SLIDE) labelAngle[j] += 0.5;
      moved = true;
    }
    if (!moved) break;
  }
  aeons.forEach((a, i) => {
    const at = positions.get(`a:${a.slug}`)!;
    const p = polar(R_AEON_LABEL, labelAngle[i]);
    aeonLabels.set(a.slug, { x: round(p.x - at.x), y: round(p.y - at.y) });
  });

  // Factions: prefer the angle of their Aeon, else the middle of their members;
  // then nudge apart so neighbours keep a minimum gap.
  const preferred = factions.map((f) => {
    const memberAngles = characters
      .filter((c) => c.factionSlug === f.slug && !options.hiddenMemberships.has(c.slug))
      .map((c) => characterAngle.get(c.slug))
      .filter((a): a is number => a !== undefined);
    const aeon = f.aeonSlug ? aeonAngle.get(f.aeonSlug) : undefined;
    const angle = aeon ?? (memberAngles.length ? circularMean(memberAngles) : 0);
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
    if (f.aeonSlug && aeonAngle.has(f.aeonSlug)) edges.push({ from: `a:${f.aeonSlug}`, to: `f:${f.slug}`, kind: "devotion" });
  }

  for (const c of characters) {
    if (c.factionSlug && positions.has(`f:${c.factionSlug}`) && positions.has(`c:${c.slug}`) && !options.hiddenMemberships.has(c.slug)) {
      edges.push({ from: `f:${c.factionSlug}`, to: `c:${c.slug}`, kind: "membership" });
    }
  }

  return { positions, edges, labelLevels, aeonLabels };
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
