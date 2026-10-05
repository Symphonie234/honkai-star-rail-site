"use client";

import Image from "next/image";
import { useState } from "react";
import type { ArtVariant } from "@/db/schema";
import { characterPortrait, characterPreview } from "@/lib/images";
import { isRevealed } from "@/lib/spoilers";
import { ExpandIcon } from "../icons";
import { useStoryProgress } from "../spoilers/story-progress";
import { ArtViewer } from "./ArtViewer";
import { useArtVariant } from "./art-variant";
import { VariantToggle } from "./VariantToggle";

type Props = {
  name: string;
  caption: string;
  art: ArtVariant[];
  spoilerVersion: string | null;
};

/**
 * The detail page's art panel. Shows full splash art — or, for spoiler-tagged
 * characters whose reveal the reader hasn't reached, the bust shot (Firefly's
 * splash shows SAM). Click to open the full-screen viewer.
 */
export function PortraitShowcase({ name, caption, art, spoilerVersion }: Props) {
  const [variant, selectVariant] = useArtVariant(art);
  const progress = useStoryProgress();
  const showSplash = isRevealed(spoilerVersion, progress);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  if (!variant) {
    return (
      <div className="glass grid aspect-square place-items-center rounded-3xl">
        <span aria-hidden="true" className="font-display text-9xl font-bold text-[var(--c)] drop-shadow-[0_0_30px_var(--c)]">
          {name.charAt(0)}
        </span>
      </div>
    );
  }

  const preview = characterPreview(variant.gameId);
  const src = showSplash ? characterPortrait(variant.gameId) : preview;
  const notice = showSplash ? undefined : `Full splash art hidden — spoilers through v${spoilerVersion}.`;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setViewerOpen(true)}
        aria-label={`View ${name}'s art full screen`}
        className="glass group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--c)_40%,transparent),transparent_70%)] transition hover:border-[var(--c)]"
      >
        {/* The small bust shot stands in while the 2048px splash art loads. */}
        {src !== preview && loadedSrc !== src && (
          <Image src={preview} alt="" fill sizes="(min-width: 768px) 460px, 100vw"
            className="object-contain object-top opacity-50 blur-sm" />
        )}
        <Image
          key={src}
          src={src}
          alt={name}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 768px) 460px, 100vw"
          onLoad={() => setLoadedSrc(src)}
          className={
            src === preview
              ? "object-contain object-top [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
              : "object-contain transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
          }
        />
        <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-space/70 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition group-hover:bg-gold group-hover:text-gold-ink">
          <ExpandIcon />
          Full screen
        </span>
      </button>

      {art.length > 1 && <VariantToggle variants={art} current={variant} onSelect={selectVariant} />}

      {viewerOpen && (
        <ArtViewer
          src={src}
          title={art.length > 1 ? `${name} · ${variant.label}` : name}
          caption={caption}
          notice={notice}
          variants={art}
          current={variant}
          onSelectVariant={selectVariant}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
