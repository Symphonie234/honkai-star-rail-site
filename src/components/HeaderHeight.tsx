"use client";

import { useEffect } from "react";

/**
 * Publishes the sticky site header's height as the CSS variable --header-h, so
 * other sticky elements (e.g. the kit section nav) sit right below it — whether
 * the header has one row, two rows on phones, or the time-travel banner.
 */
export function HeaderHeight({ targetId }: { targetId: string }) {
  useEffect(() => {
    const header = document.getElementById(targetId);
    if (!header) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty("--header-h", `${header.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, [targetId]);
  return null;
}
