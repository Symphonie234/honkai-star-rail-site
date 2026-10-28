"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { lightConeIcon, lightConePreview, pathIcon } from "@/lib/images";
import { rarityColor } from "@/lib/light-cone";
import { setPref, usePref } from "@/lib/local-pref";
import { compareVersions, isAvailable } from "@/lib/spoilers";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { GridIcon, ListIcon } from "../icons";
import { useStoryProgress } from "../spoilers/story-progress";

export type LightConeSummary = {
  slug: string;
  id: string;
  name: string;
  rarity: number;
  pathSlug: string;
  pathName: string;
  releaseVersion: string | null;
  signature: string[];
};

type Option = { slug: string; name: string };

const RARITIES: Option[] = [{ slug: "5", name: "5★" }, { slug: "4", name: "4★" }, { slug: "3", name: "3★" }];

type Layout = "grid" | "list";
const LAYOUTS: { value: Layout; label: string; icon: ReactNode }[] = [
  { value: "grid", label: "Cards", icon: <GridIcon /> },
  { value: "list", label: "List", icon: <ListIcon /> },
];
const LAYOUT_KEY = "hsr:light-cone-layout";

type Sort = "rarity" | "name" | "newest";

const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";

const released = (lc: LightConeSummary) => lc.releaseVersion ?? "1.0";

export function LightConeBrowser({ lightCones, paths }: { lightCones: LightConeSummary[]; paths: Option[] }) {
  const [query, setQuery] = useState("");
  const [path, setPath] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("rarity");
  const reduceMotion = usePrefersReducedMotion();
  const progress = useStoryProgress();
  const saved = usePref(LAYOUT_KEY);
  const layout: Layout = LAYOUTS.some((l) => l.value === saved) ? (saved as Layout) : "grid";

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = lightCones.filter(
      (lc) =>
        isAvailable(released(lc), progress) &&
        (!path || lc.pathSlug === path) &&
        (!rarity || String(lc.rarity) === rarity) &&
        (!q || lc.name.toLowerCase().includes(q) || lc.signature.some((n) => n.toLowerCase().includes(q))),
    );
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "newest") return [...list].sort((a, b) => compareVersions(released(b), released(a)) || b.rarity - a.rarity);
    return list;
  }, [lightCones, query, path, rarity, sort, progress]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <label className="block max-w-md">
            <span className="sr-only">Search Light Cones</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or character…"
              autoComplete="off"
              className="glass w-full rounded-full px-5 py-3 placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </label>
          <FilterRow label="Path" options={paths} value={path} onChange={setPath} icon={pathIcon} />
          <FilterRow label="Rarity" options={RARITIES} value={rarity} onChange={setRarity} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {shown.length} Light {shown.length === 1 ? "Cone" : "Cones"}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div role="group" aria-label="Sort" className="flex items-center gap-2">
              <span className="text-muted">Sort</span>
              <button type="button" className={chip} aria-pressed={sort === "rarity"} onClick={() => setSort("rarity")}>Rarity</button>
              <button type="button" className={chip} aria-pressed={sort === "name"} onClick={() => setSort("name")}>A–Z</button>
              <button type="button" className={chip} aria-pressed={sort === "newest"} onClick={() => setSort("newest")}>Newest</button>
            </div>
            <div role="group" aria-label="Layout" className="glass flex items-center rounded-full p-1">
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  aria-pressed={layout === l.value}
                  title={l.label}
                  onClick={() => setPref(LAYOUT_KEY, l.value)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted transition-colors hover:text-ink aria-pressed:bg-gold aria-pressed:text-gold-ink"
                >
                  {l.icon}
                  <span className="hidden sm:inline">{l.label}</span>
                  <span className="sr-only sm:hidden">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {layout === "list" ? (
          shown.length > 0 && <LightConeTable lightCones={shown} />
        ) : (
          <motion.ul layout={!reduceMotion} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((lc) => (
                <motion.li
                  key={lc.slug}
                  layout={!reduceMotion}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <LightConeCard lc={lc} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}

        {shown.length === 0 && <p className="py-12 text-center text-muted">No Light Cones match those filters.</p>}
      </div>
    </MotionConfig>
  );
}

export function LightConeCard({ lc }: { lc: LightConeSummary }) {
  return (
    <Link
      href={`/light-cones/${lc.slug}`}
      style={{ "--c": rarityColor(lc.rarity) } as CSSProperties}
      className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-[var(--c)] hover:shadow-[0_10px_40px_-14px_var(--c)]"
    >
      <div className="relative bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--c)_30%,transparent),transparent_72%)] px-4 pt-4">
        <Image
          src={lightConePreview(lc.id)}
          alt=""
          width={348}
          height={408}
          sizes="(min-width: 1024px) 200px, (min-width: 640px) 28vw, 45vw"
          className="w-full drop-shadow-[0_10px_20px_rgb(0_0_0/0.5)] transition duration-300 ease-out-expo group-hover:scale-[1.03]"
        />
        <span title={lc.pathName} className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-space/75 backdrop-blur-sm">
          <Image src={pathIcon(lc.pathSlug)} alt={lc.pathName} width={20} height={20} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4 pt-3">
        <span className="text-xs text-[var(--c)]" aria-label={`${lc.rarity}-star`}>{"★".repeat(lc.rarity)}</span>
        <span className="font-display leading-tight font-bold">{lc.name}</span>
        {lc.signature.length > 0 && (
          <span className="mt-auto pt-1 text-xs text-muted">Signature of {lc.signature.join(" & ")}</span>
        )}
      </div>
    </Link>
  );
}

function LightConeTable({ lightCones }: { lightCones: LightConeSummary[] }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs tracking-widest text-muted uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Light Cone</th>
            <th scope="col" className="px-4 py-3 font-semibold">Path</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Rarity</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Signature of</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Released</th>
          </tr>
        </thead>
        <tbody>
          {lightCones.map((lc) => (
            <tr key={lc.slug} className="border-b border-line/50 transition-colors last:border-0 hover:bg-surface">
              <td className="px-4 py-2">
                <Link href={`/light-cones/${lc.slug}`} className="flex items-center gap-3 font-semibold hover:text-gold">
                  <Image src={lightConeIcon(lc.id)} alt="" width={40} height={40} className="shrink-0" />
                  {lc.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-muted">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Image src={pathIcon(lc.pathSlug)} alt="" width={18} height={18} />
                  {lc.pathName}
                </span>
              </td>
              <td className="hidden px-4 py-2 sm:table-cell" style={{ color: rarityColor(lc.rarity) }}>{"★".repeat(lc.rarity)}</td>
              <td className="hidden px-4 py-2 text-muted md:table-cell">{lc.signature.join(", ") || "—"}</td>
              <td className="hidden px-4 py-2 text-muted tabular-nums sm:table-cell">v{released(lc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterRow({
  label, options, value, onChange, icon,
}: {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
  icon?: (slug: string) => string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-2 w-full sm:w-36">{label}</span>
      <button type="button" className={chip} aria-pressed={value === null} onClick={() => onChange(null)}>
        All
      </button>
      {options.map((o) => (
        <button
          key={o.slug}
          type="button"
          className={`${chip} ${icon ? "inline-flex items-center gap-1.5 pl-2" : ""}`}
          aria-pressed={value === o.slug}
          onClick={() => onChange(value === o.slug ? null : o.slug)}
        >
          {icon && <Image src={icon(o.slug)} alt="" width={18} height={18} />}
          {o.name}
        </button>
      ))}
    </div>
  );
}
