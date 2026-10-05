"use client";

import type { ArtVariant } from "@/db/schema";
import { setPref, usePref } from "@/lib/local-pref";

/**
 * The art variant the reader chose for a character (e.g. Stelle or Caelus),
 * remembered per browser; falls back to the first variant.
 */
export function useArtVariant(slug: string, art: ArtVariant[]) {
  const key = `hsr:art:${slug}`;
  const saved = usePref(key);
  const current = art.find((v) => v.gameId === saved) ?? art[0];
  const select = (v: ArtVariant) => setPref(key, v.gameId);
  return [current, select] as const;
}
