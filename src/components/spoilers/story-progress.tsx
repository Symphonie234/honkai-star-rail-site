"use client";

import { useSyncExternalStore } from "react";
import type { StoryProgress } from "@/lib/spoilers";

/*
 * The reader's story progress lives in localStorage, so it's per-browser and
 * needs no account. Static HTML renders with spoilers hidden; the saved
 * progress applies right after hydration.
 */

const KEY = "hsr:story-progress";
const EVENT = "hsr:story-progress-change";

// Fallback when storage is unavailable (private mode, blocked site data): progress
// still works for the current page session.
let memory: StoryProgress = null;

function read(): StoryProgress {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useStoryProgress(): StoryProgress {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function setStoryProgress(progress: StoryProgress) {
  memory = progress;
  try {
    if (progress === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, progress);
  } catch {
    // Storage unavailable; `memory` carries it.
  }
  window.dispatchEvent(new Event(EVENT));
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
