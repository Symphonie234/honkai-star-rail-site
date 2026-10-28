import Image from "next/image";
import Link from "next/link";
import { elementIcon, pathIcon } from "@/lib/images";
import type { CharacterWithRefs } from "@/lib/queries";
import { colorVar } from "@/lib/theme";
import { CardArt } from "./CardArt";

export function Stars({ rarity }: { rarity: number }) {
  return (
    <span className="text-gold" aria-label={`${rarity}-star`}>
      {"★".repeat(rarity)}
    </span>
  );
}

export function ElementBadge({ slug, name, size = "md" }: { slug: string; name: string; size?: "sm" | "md" }) {
  const px = size === "sm" ? 18 : 24;
  return (
    <span
      title={name}
      className={`grid place-items-center rounded-full border border-[color-mix(in_srgb,var(--c)_55%,transparent)] bg-space/75 backdrop-blur-sm ${
        size === "sm" ? "size-7" : "size-9"
      }`}
    >
      <Image src={elementIcon(slug)} alt={name} width={px} height={px} />
    </span>
  );
}

export function CharacterCard({ c }: { c: CharacterWithRefs }) {
  return (
    <Link
      href={`/characters/${c.slug}`}
      style={colorVar(c.elementSlug)}
      className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-[var(--c)] hover:shadow-[0_10px_40px_-10px_var(--c)]"
    >
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--c)_35%,transparent),transparent_70%)]">
        <CardArt name={c.name} art={c.art} />
        <span className="absolute top-2.5 left-2.5">
          <ElementBadge slug={c.elementSlug} name={c.element.name} />
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-space/60 px-2 py-0.5 text-xs backdrop-blur-sm">
          <Stars rarity={c.rarity} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 pt-0">
        <span className="font-display text-lg leading-tight font-bold">{c.name}</span>
        <span className="flex items-center justify-between gap-2 text-xs text-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <Image src={pathIcon(c.pathSlug)} alt="" width={16} height={16} className="shrink-0 opacity-80" />
            <span className="truncate">{c.path.name}</span>
          </span>
          <span className="shrink-0 tabular-nums" title={`Released in Version ${c.releaseVersion}`}>v{c.releaseVersion}</span>
        </span>
      </div>
    </Link>
  );
}
