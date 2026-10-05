"use client";

import type { ArtVariant } from "@/db/schema";

/** Segmented control for switching between a character's looks (e.g. Stelle / Caelus). */
export function VariantToggle({
  variants, current, onSelect, label = "Appearance",
}: {
  variants: ArtVariant[];
  current: ArtVariant;
  onSelect: (v: ArtVariant) => void;
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="glass inline-flex rounded-full p-1">
      {variants.map((v) => (
        <button
          key={v.gameId}
          type="button"
          role="radio"
          aria-checked={v.gameId === current.gameId}
          onClick={() => onSelect(v)}
          className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted transition hover:text-ink aria-checked:bg-gold aria-checked:text-gold-ink"
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
