"use client";

import Image from "next/image";
import Link from "next/link";
import { characterIcon, elementIcon, pathIcon } from "@/lib/images";
import type { CharacterWithRefs } from "@/lib/queries";
import { colorVar } from "@/lib/theme";
import { Spoiler } from "../Spoiler";
import { useArtVariant } from "./art-variant";
import { CardArt } from "./CardArt";
import { ElementBadge, Stars } from "./CharacterCard";

const rarityColor = (rarity: number) => (rarity === 5 ? "var(--color-gold)" : "var(--color-violet)");

export function CharacterTile({ c }: { c: CharacterWithRefs }) {
  return (
    <Link
      href={`/characters/${c.slug}`}
      style={colorVar(c.elementSlug)}
      title={`${c.name} · ${c.rarity}★ ${c.element.name} · ${c.path.name}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-xl border border-line bg-[radial-gradient(circle_at_50%_35%,color-mix(in_srgb,var(--c)_35%,transparent),var(--color-surface-solid)_75%)] transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-[var(--c)]"
    >
      <CardArt name={c.name} art={c.art} sizes="(min-width: 1280px) 150px, (min-width: 640px) 18vw, 30vw" />
      <span className="absolute top-1.5 left-1.5">
        <ElementBadge slug={c.elementSlug} name={c.element.name} size="sm" />
      </span>
      <span title={c.path.name} className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-space/75 backdrop-blur-sm">
        <Image src={pathIcon(c.pathSlug)} alt={c.path.name} width={18} height={18} />
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-space via-space/85 to-transparent px-2 pt-6 pb-2 text-center">
        <span className="block truncate text-sm leading-tight font-semibold">{c.name}</span>
      </span>
      <span className="sr-only">{c.rarity}-star</span>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: rarityColor(c.rarity) }} />
    </Link>
  );
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export function CharacterTable({ characters }: { characters: CharacterWithRefs[] }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs tracking-widest text-muted uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Character</th>
            <th scope="col" className="px-4 py-3 font-semibold">Type</th>
            <th scope="col" className="px-4 py-3 font-semibold">Path</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Rarity</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Faction</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Released</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((c) => <CharacterRow key={c.slug} c={c} />)}
        </tbody>
      </table>
    </div>
  );
}

function CharacterRow({ c }: { c: CharacterWithRefs }) {
  const [variant] = useArtVariant(c.art);
  const faction = c.faction?.name ?? "—";
  return (
    <tr style={colorVar(c.elementSlug)} className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface/60">
      <th scope="row" className="px-4 py-2.5 font-normal">
        <Link href={`/characters/${c.slug}`} className="group flex items-center gap-3">
          {variant && (
            <Image src={characterIcon(variant.gameId)} alt="" width={40} height={40}
              className="shrink-0 rounded-full border-2 border-[var(--c)] bg-space" />
          )}
          <span className="font-semibold group-hover:text-[var(--c)]">{c.name}</span>
        </Link>
      </th>
      <td className="px-4 py-2.5">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Image src={elementIcon(c.elementSlug)} alt="" width={20} height={20} />
          <span className="text-[var(--c)]">{c.element.name}</span>
        </span>
      </td>
      <td className="px-4 py-2.5">
        <span className="flex items-center gap-2 whitespace-nowrap text-muted">
          <Image src={pathIcon(c.pathSlug)} alt="" width={18} height={18} className="opacity-80" />
          {c.path.name}
        </span>
      </td>
      <td className="hidden px-4 py-2.5 whitespace-nowrap sm:table-cell"><Stars rarity={c.rarity} /></td>
      <td className="hidden px-4 py-2.5 text-muted lg:table-cell">
        {c.spoilerVersion && c.faction ? <Spoiler version={c.spoilerVersion}>{faction}</Spoiler> : faction}
      </td>
      <td className="hidden px-4 py-2.5 whitespace-nowrap text-muted md:table-cell">
        <span className="text-ink tabular-nums">v{c.releaseVersion}</span> · <time dateTime={c.releaseDate}>{formatDate(c.releaseDate)}</time>
      </td>
    </tr>
  );
}
