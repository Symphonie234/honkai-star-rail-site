"use client";

import { useId, useState, type ReactNode } from "react";
import { isRevealed } from "@/lib/spoilers";
import { useStoryProgress } from "../spoilers/story-progress";

type Props = { term: string; definition: string; spoilerVersion: string | null; children: ReactNode };

export function Term({ term, definition, spoilerVersion, children }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const progress = useStoryProgress();
  const hidden = !isRevealed(spoilerVersion, progress);

  return (
    <span className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="cursor-help text-ink underline decoration-gold/60 decoration-dotted underline-offset-4 hover:decoration-gold"
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute bottom-full left-1/2 z-50 mb-2 block w-72 max-w-[80vw] -translate-x-1/2 rounded-xl border border-line bg-surface-solid p-4 text-left text-sm leading-relaxed font-normal text-muted shadow-[0_10px_40px_rgb(0_0_0/0.5)]"
        >
          <span className="block font-display font-bold text-gold">{term}</span>
          <span className="mt-1 block">
            {hidden ? `This definition contains spoilers through v${spoilerVersion}.` : definition}
          </span>
        </span>
      )}
    </span>
  );
}
