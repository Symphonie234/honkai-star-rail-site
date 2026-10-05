import Link from "next/link";
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

export function CharacterCard({ c }: { c: CharacterWithRefs }) {
  return (
    <Link
      href={`/characters/${c.slug}`}
      style={colorVar(c.elementSlug)}
      className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-[var(--c)] hover:shadow-[0_10px_40px_-10px_var(--c)]"
    >
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--c)_35%,transparent),transparent_70%)]">
        <CardArt name={c.name} art={c.art} />
        <span className="absolute top-3 left-3 rounded-full bg-space/60 px-2 py-0.5 text-xs text-muted tabular-nums backdrop-blur-sm">
          v{c.releaseVersion}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-space/60 px-2 py-0.5 text-xs backdrop-blur-sm">
          <Stars rarity={c.rarity} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
        <span className="font-display text-lg font-bold">{c.name}</span>
        <span className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full border border-[var(--c)] px-2 py-0.5 text-[var(--c)]">{c.element.name}</span>
          <span className="rounded-full border border-line px-2 py-0.5 text-muted">{c.path.name}</span>
        </span>
      </div>
    </Link>
  );
}
