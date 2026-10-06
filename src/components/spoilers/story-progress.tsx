"use client";

import { setPref, usePref } from "@/lib/local-pref";
import type { StoryProgress } from "@/lib/spoilers";

/* The reader's story-progress setting, saved per browser (see StoryProgress). */

const KEY = "hsr:story-progress";

export function useStoryProgress(): StoryProgress {
  return usePref(KEY);
}

export function setStoryProgress(progress: StoryProgress) {
  setPref(KEY, progress);
}

export type VersionOption = { version: string; title: string };

export function StoryProgressPicker({ versions }: { versions: VersionOption[] }) {
  const progress = useStoryProgress();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden lg:inline">Story</span>
      <select
        value={progress ?? ""}
        onChange={(e) => setStoryProgress(e.target.value || null)}
        aria-label="Story progress: view the archive as of a version, or choose how spoilers are shown"
        className="glass max-w-36 cursor-pointer rounded-full py-1.5 pr-2 pl-3 text-xs text-ink focus:border-gold focus:outline-none sm:max-w-48 sm:pr-3 sm:text-sm"
      >
        <option value="">Everything · spoilers hidden</option>
        <option value="all">Everything · spoilers shown</option>
        <optgroup label="View the archive as of…">
          {[...versions].reverse().map((v) => (
            <option key={v.version} value={v.version}>v{v.version} · {v.title}</option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
