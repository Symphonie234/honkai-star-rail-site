"use client";

import Image from "next/image";
import type { ArtVariant } from "@/db/schema";
import { characterPreview } from "@/lib/images";
import { useArtVariant } from "./art-variant";

export function CardArt({
  name, art, sizes = "(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw",
}: {
  name: string;
  art: ArtVariant[];
  sizes?: string;
}) {
  const [variant] = useArtVariant(art);

  if (!variant) {
    return (
      <span
        aria-hidden="true"
        className="font-display text-6xl font-bold text-[var(--c)] drop-shadow-[0_0_20px_var(--c)] transition-transform duration-500 ease-out-expo group-hover:scale-110"
      >
        {name.charAt(0)}
      </span>
    );
  }

  return (
    <Image
      src={characterPreview(variant.gameId)}
      alt=""
      fill
      sizes={sizes}
      className="object-cover object-top transition-transform duration-500 ease-out-expo [mask-image:linear-gradient(to_bottom,black_65%,transparent)] group-hover:scale-105"
    />
  );
}
