import Image from "next/image";
import Link from "next/link";
import { gameIcon } from "@/lib/images";
import type { Material } from "@/lib/kit";

export const RARITY_BG = [
  "",
  "from-[#5b5f6b] to-[#2e3140]",
  "from-[#3f7a5c] to-[#1f3b2e]",
  "from-[#3d6fb0] to-[#1d3358]",
  "from-[#7b55c7] to-[#3a2763]",
  "from-[#c99a45] to-[#6b4e1d]",
];

const tileClass = "glass flex h-full flex-col items-center overflow-hidden rounded-xl text-center";

export function MaterialGroup({
  title, items, materials,
}: {
  title: string;
  items: { id: string; num: number }[];
  materials: Map<string, Material>;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest text-muted uppercase">{title}</h4>
      <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(6.75rem,1fr))] gap-2">
        {items.map(({ id, num }) => {
          const m = materials.get(id);
          if (!m) return null;
          const tile = (
            <>
              <span className={`grid w-full place-items-center bg-gradient-to-b py-2 ${RARITY_BG[m.rarity] ?? RARITY_BG[1]}`}>
                <Image src={gameIcon(m.icon)} alt="" width={48} height={48} />
              </span>
              <span className="w-full px-1 pt-1 text-sm font-semibold tabular-nums">{num.toLocaleString("en-US")}</span>
              <span lang="en" className="w-full px-2 pb-2 text-[0.7rem] leading-snug text-balance text-muted hyphens-auto [overflow-wrap:anywhere]">
                {m.name}
              </span>
            </>
          );
          return (
            <li key={id} title={m.sources.length ? `${m.name}\nFrom: ${m.sources.join(", ")}` : m.name}>
              {m.slug ? (
                <Link href={`/materials/${m.slug}`} className={`${tileClass} transition hover:-translate-y-0.5 hover:border-gold`}>{tile}</Link>
              ) : (
                <div className={tileClass}>{tile}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
