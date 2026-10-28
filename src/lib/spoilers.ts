export type StoryProgress = string | null;

export function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function viewingAsOf(progress: StoryProgress) {
  return progress && progress !== "all" ? progress : null;
}

export function isAvailable(version: string, progress: StoryProgress) {
  const asOf = viewingAsOf(progress);
  return !asOf || compareVersions(version, asOf) <= 0;
}

export function isRevealed(spoilerVersion: string | null | undefined, progress: StoryProgress) {
  if (!spoilerVersion || progress === "all") return true;
  if (!progress) return false;
  return compareVersions(progress, spoilerVersion) >= 0;
}
