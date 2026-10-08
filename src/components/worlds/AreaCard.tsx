import Image from "next/image";
import Link from "next/link";
import { areaImage } from "@/lib/images";
import type { AreaSummary } from "@/lib/queries";

/** An area of a world: its in-game art, name and region, and how much of it is mapped. */
export function AreaCard({ a }: { a: AreaSummary }) {
  return (
    <Link
      href={`/worlds/${a.worldSlug}/${a.slug}`}
      className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-[var(--c)]"
    >
      <div className="relative aspect-video overflow-hidden bg-space">
        {a.image ? (
          <Image src={areaImage(a.slug)} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-500 ease-out-expo group-hover:scale-105" />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-display text-4xl text-[var(--c)] opacity-40">✦</span>
        )}
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-space/90 to-transparent" />
        {a.floors > 0 && (
          <span className="absolute right-2.5 bottom-2.5 rounded-full bg-space/80 px-2.5 py-0.5 text-xs text-muted backdrop-blur-sm">
            {a.floors > 1 ? `${a.floors} floors` : "Map"} · {a.markers} points
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs tracking-widest text-[var(--c)] uppercase">
          {a.region ?? "Area"} · v{a.releaseVersion}
        </span>
        <span className="font-display text-lg leading-tight font-bold">{a.name}</span>
        {a.description && <span className="line-clamp-2 text-sm text-muted">{a.description.replace(/<\/?i>/g, "")}</span>}
      </div>
    </Link>
  );
}
