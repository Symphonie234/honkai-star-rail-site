import type { MetadataRoute } from "next";
import { getAeons, getCharacters, getWorlds } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [characters, worlds, aeons] = await Promise.all([getCharacters(), getWorlds(), getAeons()]);

  const pages = ["/", "/characters", "/worlds", "/aeons", "/versions", "/glossary"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  return [
    ...pages,
    ...characters.map((c) => ({ url: absoluteUrl(`/characters/${c.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...worlds.map((w) => ({ url: absoluteUrl(`/worlds/${w.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...aeons.map((a) => ({ url: absoluteUrl(`/aeons/${a.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
