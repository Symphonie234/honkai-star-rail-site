export type RelicSlot = "HEAD" | "HAND" | "BODY" | "FOOT" | "NECK" | "OBJECT";

export const SLOT_NAME: Record<RelicSlot, string> = {
  HEAD: "Head", HAND: "Hands", BODY: "Body", FOOT: "Feet", NECK: "Planar Sphere", OBJECT: "Link Rope",
};

export type RelicSet = {
  id: string;
  slug: string;
  name: string;
  kind: "cavern" | "planar";
  releaseVersion: string | null;
  bonuses: { pieces: number; desc: string }[];
  pieces: {
    slot: RelicSlot;
    name: string;
    description: string;
    story: string;
    icon: string;
  }[];
  icon: string;
};

export type RelicStats = {
  main: { slot: RelicSlot; stats: { name: string; max: number; percent: boolean }[] }[];
  sub: { name: string; rolls: [number, number, number]; percent: boolean }[];
};
