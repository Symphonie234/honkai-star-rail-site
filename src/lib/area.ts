export type MapMarker = {
  id: string;
  cat: string;
  x: number;
  y: number;
  title: string;
  desc: string;
  rewards: { name: string; count: number }[];
  image: string | null;
};

export type MapCategory = {
  id: string;
  name: string;
  icon: string | null;
  defaultOn: boolean;
};

export type AreaFloor = {
  label: string;
  image: string;
  width: number;
  height: number;
  markers: MapMarker[];
};

export type Area = {
  slug: string;
  name: string;
  worldSlug: string;
  region: string | null;
  description: string;
  unlock: string | null;
  image: string | null;
  connections: { name: string; slug: string | null; oneWay: boolean }[];
  releaseVersion: string;
  spoilerVersion: string | null;
  floors: AreaFloor[];
  categories: MapCategory[];
  enemies: { normal: string[]; elite: string[] };
  activities: string[];
  collectibles: { name: string; count: number }[];
  shops: string[];
  sortOrder: number;
};

export const areaSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/™/g, "")
    .replace(/['’"!?.,:()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
