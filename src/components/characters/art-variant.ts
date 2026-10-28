"use client";

import type { ArtVariant } from "@/db/schema";
import { setPref, usePref } from "@/lib/local-pref";

export function useArtVariant(art: ArtVariant[]) {
  const key = `hsr:art:${art.map((v) => v.label).join("|")}`;
  const saved = usePref(key);
  const current = art.find((v) => v.label === saved) ?? art[0];
  const select = (v: ArtVariant) => setPref(key, v.label);
  return [current, select] as const;
}
