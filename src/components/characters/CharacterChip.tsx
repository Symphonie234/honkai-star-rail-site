"use client";

import Image from "next/image";
import Link from "next/link";
import type { ArtVariant } from "@/db/schema";
import { characterIcon } from "@/lib/images";
import { colorVar } from "@/lib/theme";
import { useArtVariant } from "./art-variant";
import { Stars } from "./CharacterCard";

type Props = { slug: string; name: string; rarity: number; elementSlug: string; art: ArtVariant[] };

/** A compact avatar link to a character, following the reader's chosen variant. */
export function CharacterChip({ slug, name, rarity, elementSlug, art }: Props) {
  const [variant] = useArtVariant(art);
  return (
    <Link
      href={`/characters/${slug}`}
      style={colorVar(elementSlug)}
      className="group flex items-center gap-3 rounded-full border border-line py-1.5 pr-4 pl-1.5 transition hover:border-[var(--c)]"
    >
      {variant && (
        <Image src={characterIcon(variant.gameId)} alt="" width={40} height={40}
          className="rounded-full border-2 border-[var(--c)] bg-space" />
      )}
      <span className="leading-tight">
        <span className="block font-semibold group-hover:text-[var(--c)]">{name}</span>
        <span className="block text-xs"><Stars rarity={rarity} /></span>
      </span>
    </Link>
  );
}
