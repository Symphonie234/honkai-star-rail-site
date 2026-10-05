"use client";

import { useState, type ReactNode } from "react";

/**
 * Blurs story-revealing content until clicked. Phase 3 replaces the per-click
 * reveal with the reader's saved story progress.
 */
export function Spoiler({ version, children }: { version: string; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <>{children}</>;
  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="group relative inline-flex items-center rounded-md"
      aria-label={`Spoiler through version ${version}. Reveal`}
    >
      <span aria-hidden="true" className="blur-sm select-none">{children}</span>
      <span className="absolute inset-0 grid place-items-center text-xs font-semibold tracking-wide text-gold uppercase">
        v{version} spoiler · reveal
      </span>
    </button>
  );
}
