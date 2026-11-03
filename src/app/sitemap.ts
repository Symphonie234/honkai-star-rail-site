import type { MetadataRoute } from "next";
import {
  getAeons, getAreaSummaries, getCharacters, getEnemies, getLightCones, getMaterialList, getRelicSets, getWorlds,
} from "@/lib/queries";
import { ACHIEVEMENT_SERIES, CURRENCY_WARS } from "@/db/seed-data";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [characters, worlds, aeons, lightCones, relics, materials, enemies, areas] = await Promise.all([
    getCharacters(), getWorlds(), getAeons(), getLightCones(), getRelicSets(), getMaterialList(), getEnemies(), getAreaSummaries(),
  ]);

  const pages = ["/", "/characters", "/light-cones", "/relics", "/materials", "/enemies", "/achievements", "/simulated-universe", "/simulated-universe/blessings", "/simulated-universe/curios", "/simulated-universe/occurrences", "/currency-wars", "/currency-wars/planner", "/currency-wars/units", "/currency-wars/bonds", "/currency-wars/equipment", "/currency-wars/investments", "/currency-wars/opponents", "/worlds", "/aeons", "/versions", "/glossary", "/search"].map(
    (path) => ({ url: absoluteUrl(path), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.8 }),
  );
  const page = (path: string, priority: number) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority });

  return [
    ...pages,
    ...characters.map((c) => page(`/characters/${c.slug}`, 0.7)),
    ...lightCones.map((lc) => page(`/light-cones/${lc.slug}`, 0.6)),
    ...relics.map((r) => page(`/relics/${r.slug}`, 0.6)),
    ...materials.map((m) => page(`/materials/${m.slug}`, 0.5)),
    ...enemies.filter((e) => !e.spoilerVersion).map((e) => page(`/enemies/${e.slug}`, 0.5)),
    ...worlds.map((w) => page(`/worlds/${w.slug}`, 0.7)),
    ...areas.map((a) => page(`/worlds/${a.worldSlug}/${a.slug}`, 0.6)),
    ...aeons.map((a) => page(`/aeons/${a.slug}`, 0.6)),
    ...ACHIEVEMENT_SERIES.map((s) => page(`/achievements/${s.slug}`, 0.5)),
    ...CURRENCY_WARS.units.map((u) => page(`/currency-wars/units/${u.slug}`, 0.5)),
  ];
}
