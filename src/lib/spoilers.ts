/**
 * The reader's story-progress setting:
 *  - null (default): everything is listed, spoilers hidden
 *  - a version ("2.2"): view the archive as of that version — anything newer is
 *    hidden entirely, and spoilers up to it are revealed
 *  - "all": everything, spoilers shown
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

/** The version the archive is being viewed as of, or null when showing everything. */
export function viewingAsOf(progress: StoryProgress) {
  return progress && progress !== "all" ? progress : null;
}

/** Whether something that entered the game in `version` exists at this progress setting. */
export function isAvailable(version: string, progress: StoryProgress) {
  const asOf = viewingAsOf(progress);
  return !asOf || compareVersions(version, asOf) <= 0;
}

/** Whether content tagged with `spoilerVersion` is safe to show at this progress. */
export function isRevealed(spoilerVersion: string | null | undefined, progress: StoryProgress) {
  if (!spoilerVersion || progress === "all") return true;
  if (!progress) return false;
  return compareVersions(progress, spoilerVersion) >= 0;
}
