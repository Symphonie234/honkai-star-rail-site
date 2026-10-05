import Link from "next/link";
import type { CharacterWithRefs } from "@/lib/queries";
import { colorVar } from "@/lib/theme";

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
      <div className="relative grid aspect-[4/3] place-items-center bg-[radial-gradient(circle_at_50%_60%,color-mix(in_srgb,var(--c)_35%,transparent),transparent_70%)]">
        <span
          aria-hidden="true"
          className="font-display text-6xl font-bold text-[var(--c)] drop-shadow-[0_0_20px_var(--c)] transition-transform duration-500 ease-out-expo group-hover:scale-110"
        >
          {c.name.charAt(0)}
        </span>
        <span className="absolute top-3 right-3 text-xs">
          <Stars rarity={c.rarity} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="font-display text-lg font-bold">{c.name}</span>
        <span className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full border border-[var(--c)] px-2 py-0.5 text-[var(--c)]">{c.element.name}</span>
          <span className="rounded-full border border-line px-2 py-0.5 text-muted">{c.path.name}</span>
        </span>
      </div>
    </Link>
  );
}
