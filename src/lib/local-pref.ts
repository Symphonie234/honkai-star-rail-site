"use client";

import { useSyncExternalStore } from "react";

/*
 * Per-browser reader preferences (story progress, Trailblazer look) in localStorage.
 * Static HTML renders with no preference set; saved values apply right after
 * hydration, so server and client markup always match.
 */

const EVENT = "hsr:pref-change";

// Fallback when storage is unavailable (private mode, blocked site data): the
// preference still works for the current page session.
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
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

export function usePref(key: string): string | null {
  return useSyncExternalStore(subscribe, () => read(key), () => null);
}

export function setPref(key: string, value: string | null) {
  if (value === null) memory.delete(key);
  else memory.set(key, value);
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable; `memory` carries it.
  }
  window.dispatchEvent(new Event(EVENT));
}
