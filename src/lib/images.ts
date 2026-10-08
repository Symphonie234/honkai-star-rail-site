/*
 * Game art lives in public/art, downloaded and converted to WebP by
 * `npm run art:fetch` (scripts/fetch-art.ts). Art © HoYoverse.
 *  - Characters and Path icons: StarRailRes (github.com/Mar-7th/StarRailRes)
 *  - World renders: the Honkai: Star Rail Wiki on Fandom (in-game star chart art)
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
