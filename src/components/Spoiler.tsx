"use client";

import { useState, type ReactNode } from "react";

/**
 * Blurs story-revealing content until clicked. `block` covers a whole section
 * (e.g. a story chapter) instead of an inline phrase. Phase 3 replaces the
 * per-click reveal with the reader's saved story progress.
 */
export function Spoiler({ version, block = false, children }: { version: string; block?: boolean; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <>{children}</>;

  if (block) {
    return (
      <div className="relative">
        <div aria-hidden="true" inert className="pointer-events-none blur-md select-none">
          {children}
        </div>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="absolute inset-0 grid place-items-center rounded-2xl"
        >
          <span className="rounded-full border border-gold bg-space/80 px-4 py-2 text-sm font-semibold text-gold">
            Spoilers through v{version} · reveal
          </span>
        </button>
      </div>
    );
  }

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
