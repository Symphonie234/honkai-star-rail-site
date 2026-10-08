/*
 * Relic sets (Cavern Relics and Planar Ornaments), as imported by
 * scripts/import-game-data.ts from StarRailRes and Yatta.
 */

export type RelicSlot = "HEAD" | "HAND" | "BODY" | "FOOT" | "NECK" | "OBJECT";

export const SLOT_NAME: Record<RelicSlot, string> = {
  HEAD: "Head", HAND: "Hands", BODY: "Body", FOOT: "Feet", NECK: "Planar Sphere", OBJECT: "Link Rope",
};

export type RelicSet = {
  id: string;
  slug: string;
  name: string;
  kind: "cavern" | "planar";
  /** Version that introduced it (null if the wiki doesn't list it). */
  releaseVersion: string | null;
  /** Set bonuses, as the game words them. */
  bonuses: { pieces: number; desc: string }[];
  pieces: {
    slot: RelicSlot;
    name: string;
    /** Short in-game description. */
    description: string;
    /** The piece's story, as the game formats it (paragraphs, <i>). */
    story: string;
    /** StarRailRes icon path. */
    icon: string;
  }[];
  /** StarRailRes icon path for the set. */
  icon: string;
};

/** Main stats a 5★ piece can roll per slot, with their value at +15; and the sub-stat roll values. */
export type RelicStats = {
  main: { slot: RelicSlot; stats: { name: string; max: number; percent: boolean }[] }[];
  sub: { name: string; rolls: [number, number, number]; percent: boolean }[];
};
