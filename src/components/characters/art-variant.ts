"use client";

import type { ArtVariant } from "@/db/schema";
import { setPref, usePref } from "@/lib/local-pref";

/**
 * The art variant the reader chose (e.g. Stelle or Caelus), remembered per browser
 * and falling back to the first variant. The preference is keyed by the set of
 * variant labels, so one choice applies to every character sharing them — all four
 * Trailblazer Paths.
 */
export function useArtVariant(art: ArtVariant[]) {
  const key = `hsr:art:${art.map((v) => v.label).join("|")}`;
  const saved = usePref(key);
  const current = art.find((v) => v.label === saved) ?? art[0];
  const select = (v: ArtVariant) => setPref(key, v.label);
  return [current, select] as const;
}
