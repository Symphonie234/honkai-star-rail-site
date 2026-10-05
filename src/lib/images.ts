/*
 * Character art comes from StarRailRes (github.com/Mar-7th/StarRailRes), a
 * community archive of game assets, served through jsDelivr's GitHub CDN.
 * Art © HoYoverse. Allowed hosts are configured in next.config.ts.
 */
const BASE = "https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master";

/** 376×512 bust shot, fades out at the bottom. Used on cards. */
export const characterPreview = (gameId: string) => `${BASE}/image/character_preview/${gameId}.png`;

/** 2048×2048 full splash art on a transparent background. Used on detail pages. */
export const characterPortrait = (gameId: string) => `${BASE}/image/character_portrait/${gameId}.png`;
