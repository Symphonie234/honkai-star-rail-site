/*
 * Game art lives in public/art, downloaded and converted to WebP by
 * `npm run art:fetch` (scripts/fetch-art.ts). Art © HoYoverse.
 *  - Characters and Path icons: StarRailRes (github.com/Mar-7th/StarRailRes)
 *  - Light Cones: StarRailRes
 *  - World renders, Eidolon art: the Honkai: Star Rail Wiki on Fandom (in-game art)
 */
export const ART_DIR = "art";

export type CharacterArtKind = "preview" | "portrait" | "icon";

const characterArt = (kind: CharacterArtKind) => (gameId: string) => `/${ART_DIR}/characters/${kind}/${gameId}.webp`;

/** 376×512 bust shot that fades out at the bottom. Used on cards. */
export const characterPreview = characterArt("preview");

/** 2048×2048 full splash art on a transparent background. Used on detail pages and the viewer. */
export const characterPortrait = characterArt("portrait");

/** Round 256×256 head-and-shoulders avatar. Used as nodes in the Aeons web. */
export const characterIcon = characterArt("icon");

/** In-game star chart render of a world, on a transparent background. */
export const worldImage = (slug: string) => `/${ART_DIR}/worlds/${slug}.webp`;

/** White Path glyph on a transparent background. */
export const pathIcon = (slug: string) => `/${ART_DIR}/paths/${slug}.webp`;

/** Official combat type icon, in the element's own color. */
export const elementIcon = (slug: string) => `/${ART_DIR}/elements/${slug}.webp`;

/**
 * A game icon (skill, Trace, Eidolon, stat, material) from its StarRailRes path,
 * e.g. "icon/skill/1407_skill.png" → "/art/game/skill/1407_skill.webp".
 */
export const gameIcon = (iconPath: string) => `/${ART_DIR}/game/${iconPath.replace(/^icon\//, "").replace(/\.png$/, ".webp")}`;

/** Official Aeon art (or, for Aeons never depicted, their Path emblem). */
export const aeonImage = (slug: string) => `/${ART_DIR}/aeons/${slug}.webp`;

export type LightConeArtKind = "portrait" | "preview" | "icon";

const lightConeArt = (kind: LightConeArtKind) => (gameId: string) => `/${ART_DIR}/light-cones/${kind}/${gameId}.webp`;

/** 904×1260 framed card art. Used on Light Cone pages. */
export const lightConePortrait = lightConeArt("portrait");

/** 348×408 card art without the frame. Used in lists and on character pages. */
export const lightConePreview = lightConeArt("preview");

/** 128×128 icon. */
export const lightConeIcon = lightConeArt("icon");

/** In-game art of a world's area. */
export const areaImage = (slug: string) => `/${ART_DIR}/areas/${slug}.webp`;

/** An area's in-game map, per floor ("F1", "B2", "Map"). */
export const mapImage = (areaSlug: string, floor: string) => `/${ART_DIR}/maps/${areaSlug}-${floor.toLowerCase()}.webp`;

const fileSlug = (file: string) =>
  file.replace(/\.\w+$/, "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** In-game screenshot of a map marker's spot, by its wiki file name. */
export const mapPinImage = (file: string) => `/${ART_DIR}/maps/pins/${fileSlug(file)}.webp`;

/** A map marker category's icon, by its wiki file name. */
export const mapIcon = (file: string) => `/${ART_DIR}/maps/icons/${fileSlug(file)}.webp`;

/** An enemy's art. */
export const enemyImage = (slug: string) => `/${ART_DIR}/enemies/${slug}.webp`;

/** An Eidolon's card art (in-game, irregular shape on a transparent background), by character game ID and rank. */
export const eidolonArt = (gameId: string, rank: number) => `/${ART_DIR}/eidolons/${gameId}-${rank}.webp`;
