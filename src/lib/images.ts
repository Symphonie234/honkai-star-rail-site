export const ART_DIR = "art";

export type CharacterArtKind = "preview" | "portrait" | "icon";

const characterArt = (kind: CharacterArtKind) => (gameId: string) => `/${ART_DIR}/characters/${kind}/${gameId}.webp`;

export const characterPreview = characterArt("preview");

export const characterPortrait = characterArt("portrait");

export const characterIcon = characterArt("icon");

export const worldImage = (slug: string) => `/${ART_DIR}/worlds/${slug}.webp`;

export const pathIcon = (slug: string) => `/${ART_DIR}/paths/${slug}.webp`;

export const elementIcon = (slug: string) => `/${ART_DIR}/elements/${slug}.webp`;

export const gameIcon = (iconPath: string) => `/${ART_DIR}/game/${iconPath.replace(/^icon\//, "").replace(/\.png$/, ".webp")}`;

export const aeonImage = (slug: string) => `/${ART_DIR}/aeons/${slug}.webp`;

export type LightConeArtKind = "portrait" | "preview" | "icon";

const lightConeArt = (kind: LightConeArtKind) => (gameId: string) => `/${ART_DIR}/light-cones/${kind}/${gameId}.webp`;

export const lightConePortrait = lightConeArt("portrait");

export const lightConePreview = lightConeArt("preview");

export const lightConeIcon = lightConeArt("icon");

export const areaImage = (slug: string) => `/${ART_DIR}/areas/${slug}.webp`;

export const mapImage = (areaSlug: string, floor: string) => `/${ART_DIR}/maps/${areaSlug}-${floor.toLowerCase()}.webp`;

const fileSlug = (file: string) =>
  file.replace(/\.\w+$/, "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const mapPinImage = (file: string) => `/${ART_DIR}/maps/pins/${fileSlug(file)}.webp`;

export const mapIcon = (file: string) => `/${ART_DIR}/maps/icons/${fileSlug(file)}.webp`;

export const enemyImage = (slug: string) => `/${ART_DIR}/enemies/${slug}.webp`;

export const eidolonArt = (gameId: string, rank: number) => `/${ART_DIR}/eidolons/${gameId}-${rank}.webp`;

export const simulatedEventImage = (imagePath: string) =>
  `/${ART_DIR}/simulated/events/${imagePath.split("/").pop()!.replace(/\.png$/, ".webp")}`;
