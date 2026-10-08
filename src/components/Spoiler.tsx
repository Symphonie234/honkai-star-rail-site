"use client";

import { useState, type ReactNode } from "react";
import { isRevealed } from "@/lib/spoilers";
import { useStoryProgress } from "./spoilers/story-progress";

/**
 * Hides story-revealing content unless the reader's story progress covers
 * `version`; they can also reveal it with a click. `block` covers a whole section
 * (e.g. a story chapter) instead of an inline phrase.
 */
export function Spoiler({ version, block = false, children }: { version: string; block?: boolean; children: ReactNode }) {
  const progress = useStoryProgress();
  const [clicked, setClicked] = useState(false);

  if (clicked || isRevealed(version, progress)) return <>{children}</>;

  if (block) {
    return (
      <div className="relative">
        <div aria-hidden="true" inert className="pointer-events-none blur-md select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center">
          <button
            type="button"
            onClick={() => setClicked(true)}
            className="rounded-full border border-gold bg-space/80 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold hover:text-gold-ink"
          >
            Spoilers through v{version} · reveal
          </button>
          <span className="text-xs text-muted">or set your story progress in the header</span>
        </div>
      </div>
    );
  }

  // No blurred placeholder text inline: its length alone can hint at the answer.
  return (
    <button
      type="button"
      onClick={() => setClicked(true)}
      className="rounded-full border border-dashed border-gold/60 px-3 py-0.5 text-sm font-semibold text-gold transition hover:border-gold hover:bg-gold/10"
      aria-label={`Hidden: spoiler through version ${version}. Reveal`}
    >
      v{version} spoiler · reveal
    </button>
  );
}


/** A label (e.g. a link's text) that names a spoiler only once the reader's progress covers it — plain text, no reveal button. */
export function SpoilerLabel({ version, children }: { version: string; children: ReactNode }) {
  const progress = useStoryProgress();
  return isRevealed(version, progress) ? <>{children}</> : <span className="italic">v{version} spoiler</span>;
}
