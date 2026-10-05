/*
 * Character art lives in public/art, fetched from StarRailRes
 * (github.com/Mar-7th/StarRailRes) by `npm run art:fetch`. Art © HoYoverse.
 */
export const ART_DIR = "art/characters";

export type ArtKind = "preview" | "portrait";

const art = (kind: ArtKind) => (gameId: string) => `/${ART_DIR}/${kind}/${gameId}.webp`;

/** 376×512 bust shot that fades out at the bottom. Used on cards. */
export const characterPreview = art("preview");

/** 2048×2048 full splash art on a transparent background. Used on detail pages and the viewer. */
export const characterPortrait = art("portrait");
