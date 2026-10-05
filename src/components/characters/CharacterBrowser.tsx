"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { elementIcon, pathIcon } from "@/lib/images";
import { setPref, usePref } from "@/lib/local-pref";
import type { CharacterWithRefs } from "@/lib/queries";
import { compareVersions, isRevealed } from "@/lib/spoilers";
import { colorVar } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { CompactIcon, GridIcon, ListIcon } from "../icons";
import { useStoryProgress } from "../spoilers/story-progress";
import { CharacterCard } from "./CharacterCard";
import { CharacterTable, CharacterTile } from "./CharacterViews";

type Option = { slug: string; name: string };

type Props = {
  characters: CharacterWithRefs[];
  elements: Option[];
  paths: Option[];
};

const RARITIES: Option[] = [{ slug: "5", name: "5★" }, { slug: "4", name: "4★" }];

type Layout = "grid" | "compact" | "list";
const LAYOUTS: { value: Layout; label: string; icon: ReactNode }[] = [
  { value: "grid", label: "Cards", icon: <GridIcon /> },
  { value: "compact", label: "Compact", icon: <CompactIcon /> },
  { value: "list", label: "List", icon: <ListIcon /> },
];
const LAYOUT_KEY = "hsr:character-layout";

const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-[var(--c,var(--color-gold))] aria-pressed:bg-[color-mix(in_srgb,var(--c,var(--color-gold))_18%,transparent)] aria-pressed:text-ink border-line text-muted hover:text-ink";

export function CharacterBrowser({ characters, elements, paths }: Props) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [sort, setSort] = useState<"name" | "newest">("name");
  const reduceMotion = usePrefersReducedMotion();
  const progress = useStoryProgress();
  // Remembered per browser, like story progress.
  const saved = usePref(LAYOUT_KEY);
  const layout: Layout = LAYOUTS.some((l) => l.value === saved) ? (saved as Layout) : "grid";

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // A spoiler-tagged character's faction is the reveal (Firefly), so it only counts
    // toward search once the reader's progress covers it.
    const factionMatches = (c: CharacterWithRefs) =>
      isRevealed(c.spoilerVersion, progress) && !!c.faction?.name.toLowerCase().includes(q);
    const list = characters.filter(
      (c) =>
        (!element || c.elementSlug === element) &&
        (!path || c.pathSlug === path) &&
        (!rarity || String(c.rarity) === rarity) &&
        (!q || c.name.toLowerCase().includes(q) || factionMatches(c)),
    );
    return sort === "newest"
      ? [...list].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || compareVersions(b.releaseVersion, a.releaseVersion))
      : list;
  }, [characters, query, element, path, rarity, sort, progress]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <label className="block max-w-md">
            <span className="sr-only">Search characters</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or faction…"
              autoComplete="off"
              className="glass w-full rounded-full px-5 py-3 placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </label>

          <FilterRow label="Combat type" options={elements} value={element} onChange={setElement} colored icon={elementIcon} />
          <FilterRow label="Path" options={paths} value={path} onChange={setPath} icon={pathIcon} />
          <FilterRow label="Rarity" options={RARITIES} value={rarity} onChange={setRarity} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {shown.length} {shown.length === 1 ? "traveler" : "travelers"}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div role="group" aria-label="Sort" className="flex items-center gap-2">
              <span className="text-muted">Sort</span>
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
          shown.length > 0 && <CharacterTable characters={shown} />
        ) : (
          <motion.ul
            key={layout}
            layout={!reduceMotion}
            className={
              layout === "compact"
                ? "grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8"
                : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            }
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((c) => (
                <motion.li
                  key={c.slug}
                  layout={!reduceMotion}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {layout === "compact" ? <CharacterTile c={c} /> : <CharacterCard c={c} />}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}

        {shown.length === 0 && <p className="py-12 text-center text-muted">No travelers match those filters.</p>}
      </div>
    </MotionConfig>
  );
}

function FilterRow({
  label, options, value, onChange, colored = false, icon,
}: {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
  colored?: boolean;
  /** Icon image for an option's slug (element and Path filters). */
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
          style={colored ? colorVar(o.slug) : undefined}
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
