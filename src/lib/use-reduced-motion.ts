"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Hydration-safe reduced-motion preference. Framer Motion's useReducedMotion reads
 * the real value on the first client render, which differs from the server's HTML
 * and breaks hydration; this reports false (matching the server) until hydrated.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
}
