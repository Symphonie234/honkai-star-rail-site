"use client";

import { setPref, usePref } from "@/lib/local-pref";
import type { StoryProgress } from "@/lib/spoilers";

/* The reader's story progress, saved per browser. */

const KEY = "hsr:story-progress";

export function useStoryProgress(): StoryProgress {
  return usePref(KEY);
}

export function setStoryProgress(progress: StoryProgress) {
  setPref(KEY, progress);
}

export function StoryProgressPicker({ versions }: { versions: string[] }) {
  const progress = useStoryProgress();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden lg:inline">Story</span>
      <select
        value={progress ?? ""}
        onChange={(e) => setStoryProgress(e.target.value || null)}
        aria-label="Story progress — spoilers up to this version are shown"
        className="glass max-w-36 cursor-pointer rounded-full py-1.5 pr-2 pl-3 text-xs text-ink focus:border-gold focus:outline-none sm:max-w-44 sm:pr-3 sm:text-sm"
      >
        <option value="">Hide all spoilers</option>
        {versions.map((v) => (
          <option key={v} value={v}>Caught up to v{v}</option>
        ))}
        <option value="all">Show everything</option>
      </select>
    </label>
  );
}
