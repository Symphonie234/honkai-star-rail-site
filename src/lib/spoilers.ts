/**
 * Story progress is the latest game version the reader has caught up to ("2.2"),
 * "all" to show every spoiler, or null (the default) to hide them all.
 */
export type StoryProgress = string | null;

/** Compares "major.minor" version strings numerically ("1.10" > "1.9"). */
export function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Whether content tagged with `spoilerVersion` is safe to show at this progress. */
export function isRevealed(spoilerVersion: string | null | undefined, progress: StoryProgress) {
  if (!spoilerVersion || progress === "all") return true;
  if (!progress) return false;
  return compareVersions(progress, spoilerVersion) >= 0;
}
