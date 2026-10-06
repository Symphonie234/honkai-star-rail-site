"use client";

import type { ReactNode } from "react";
import { isAvailable, viewingAsOf } from "@/lib/spoilers";
import { setStoryProgress, useStoryProgress, type VersionOption } from "./story-progress";

/**
 * Renders its children only if something from `version` exists in the version the
 * reader is viewing the archive as of (always, unless they picked a version).
 */
export function AsOf({ version, children, fallback = null }: { version: string; children: ReactNode; fallback?: ReactNode }) {
  const progress = useStoryProgress();
  return <>{isAvailable(version, progress) ? children : fallback}</>;
}

/** Shown in place of a page whose subject doesn't exist yet in the chosen version. */
export function NotYet({ what, version }: { what: string; version: string }) {
  const progress = useStoryProgress();
  return (
    <div className="glass mx-auto my-16 max-w-xl rounded-3xl p-8 text-center">
      <p className="eyebrow">Not on the rails yet</p>
      <h1 className="mt-3 font-display text-3xl font-bold">{what} arrives in Version {version}</h1>
      <p className="mt-3 text-muted">
        You&apos;re viewing the archive as of Version {viewingAsOf(progress)}, so this page is hidden to keep later
        story out of sight.
      </p>
      <button
        type="button"
        onClick={() => setStoryProgress(version)}
        className="mt-6 rounded-full bg-gold px-5 py-2.5 font-semibold text-gold-ink transition hover:bg-gold-strong"
      >
        Jump to Version {version}
      </button>
    </div>
  );
}

/** A slim bar under the header while the archive is viewed as of a past version. */
export function TimeTravelBanner({ versions }: { versions: VersionOption[] }) {
  const progress = useStoryProgress();
  const asOf = viewingAsOf(progress);
  if (!asOf) return null;
  const title = versions.find((v) => v.version === asOf)?.title;
  return (
    <div role="status" className="border-b border-gold/30 bg-gold/10 text-sm">
      <div className="mx-auto flex w-[min(100%-2rem,1200px)] flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
        <p>
          <span aria-hidden="true" className="mr-2 text-gold">⟲</span>
          Viewing the archive as of <strong className="text-gold">Version {asOf}</strong>
          {title && <span className="text-muted"> · {title}</span>}
          <span className="hidden text-muted sm:inline"> — later characters, worlds and story are hidden.</span>
        </p>
        <button type="button" onClick={() => setStoryProgress(null)} className="font-semibold text-gold hover:text-gold-strong">
          Back to the present →
        </button>
      </div>
    </div>
  );
}
