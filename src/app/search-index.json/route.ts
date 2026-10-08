import {
  areaImage, characterIcon, enemyImage, gameIcon, lightConeIcon, worldImage,
} from "@/lib/images";
import {
  getAeons, getAreaSummaries, getCharacters, getEnemies, getGlossary, getLightCones, getMaterialList, getRelicSets, getVersions, getWorld, getWorlds,
} from "@/lib/queries";
import type { SearchEntry } from "@/lib/search";

// Built once at build time; the search box downloads it the first time it opens.
export const dynamic = "force-static";

export async function GET() {
  const [characters, cones, relics, materials, enemies, worlds, areas, aeons, glossary, versions] = await Promise.all([
    getCharacters(), getLightCones(), getRelicSets(), getMaterialList(), getEnemies(), getWorlds(), getAreaSummaries(), getAeons(),
    getGlossary(), getVersions(),
  ]);
  const worldDetails = await Promise.all(worlds.map((w) => getWorld(w.slug)));
  const worldName = new Map(worlds.map((w) => [w.slug, w.name]));
  const characterName = new Map(characters.map((c) => [c.slug, c.name]));

  const entries: SearchEntry[] = [
    ...characters.map((c) => ({
      t: "Character", n: c.name, s: `${c.rarity}★ ${c.element.name} · ${c.path.name}`, u: `/characters/${c.slug}`,
      v: c.releaseVersion, sp: null, i: c.art[0] ? characterIcon(c.art[0].gameId) : null,
      // The faction can be the spoiler (Firefly), so it only counts when the card is safe.
      k: [c.element.name, c.path.name, c.spoilerVersion ? "" : c.faction?.name ?? "", c.lightCone ?? ""].join(" "),
    })),
    ...cones.map((lc) => ({
      t: "Light Cone", n: lc.name, s: `${lc.rarity}★ ${lc.path.name}`, u: `/light-cones/${lc.slug}`,
      v: lc.releaseVersion ?? "1.0", sp: null, i: lightConeIcon(lc.gameId),
      // Found by its signature character too ("acheron" → Along the Passing Shore).
      k: [lc.data.skill, ...lc.data.signature.map((s) => characterName.get(s) ?? "")].join(" "),
    })),
    ...relics.map((r) => ({
      t: "Relic", n: r.name, s: r.data.kind === "planar" ? "Planar Ornament" : "Cavern Relic", u: `/relics/${r.slug}`,
      v: r.releaseVersion ?? "1.0", sp: null, i: gameIcon(r.data.icon), k: r.data.pieces.map((p) => p.name).join(" "),
    })),
    ...materials.map((m) => ({
      t: "Material", n: m.name, s: m.category || "Material", u: `/materials/${m.slug}`, v: "1.0", sp: null, i: gameIcon(m.icon),
    })),
    ...enemies.map((e) => ({
      t: "Enemy", n: e.name, s: `${e.tier}${e.faction ? ` · ${e.faction}` : ""}`, u: `/enemies/${e.slug}`,
      v: e.releaseVersion, sp: e.spoilerVersion, i: e.data.image ? enemyImage(e.slug) : null,
    })),
    ...worlds.map((w) => ({
      t: "World", n: w.name, s: w.tagline, u: `/worlds/${w.slug}`, v: w.releaseVersion, sp: null, i: w.image ? worldImage(w.slug) : null,
    })),
    ...areas.map((a) => ({
      t: "Area", n: a.name, s: `${worldName.get(a.worldSlug) ?? ""}${a.region ? ` · ${a.region}` : ""}`, u: `/worlds/${a.worldSlug}/${a.slug}`,
      v: a.releaseVersion, sp: a.spoilerVersion, i: a.image ? areaImage(a.slug) : null,
    })),
    ...aeons.map((a) => ({
      t: "Aeon", n: a.name, s: `Aeon of ${a.concept}`, u: `/aeons/${a.slug}`, v: a.introducedVersion, sp: null, i: a.image, k: a.epithets.join(" "),
    })),
    ...worldDetails.flatMap((w) => (w ? w.chapters.map((ch) => ({
      t: "Story", n: ch.title, s: `${w.name} · Version ${ch.version}`, u: `/worlds/${w.slug}#${ch.slug}`, v: ch.version, sp: ch.spoilerVersion, i: null,
    })) : [])),
    ...glossary.map((g) => ({
      t: "Glossary", n: g.term, s: g.definition.slice(0, 90), u: `/glossary#${g.slug}`, v: g.version, sp: g.spoilerVersion, i: null, k: g.aliases.join(" "),
    })),
    ...versions.map((v) => ({
      t: "Version", n: `${v.version} · ${v.title}`, s: v.releaseDate, u: `/versions#v${v.version}`, v: v.version, sp: null, i: null,
    })),
  ];
  return Response.json(entries);
}
