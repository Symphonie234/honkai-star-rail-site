"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { CharacterWithRefs } from "@/lib/queries";
import { compareVersions, isRevealed } from "@/lib/spoilers";
import { colorVar } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useStoryProgress } from "../spoilers/story-progress";
import { CharacterCard } from "./CharacterCard";

type Option = { slug: string; name: string };

type Props = {
  characters: CharacterWithRefs[];
  elements: Option[];
  paths: Option[];
};

const RARITIES: Option[] = [{ slug: "5", name: "5★" }, { slug: "4", name: "4★" }];

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

          <FilterRow label="Combat type" options={elements} value={element} onChange={setElement} colored />
          <FilterRow label="Path" options={paths} value={path} onChange={setPath} />
          <FilterRow label="Rarity" options={RARITIES} value={rarity} onChange={setRarity} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {shown.length} {shown.length === 1 ? "traveler" : "travelers"}
          </p>
          <div role="group" aria-label="Sort" className="flex items-center gap-2 text-sm">
            <span className="text-muted">Sort</span>
            <button type="button" className={chip} aria-pressed={sort === "name"} onClick={() => setSort("name")}>A–Z</button>
            <button type="button" className={chip} aria-pressed={sort === "newest"} onClick={() => setSort("newest")}>Newest</button>
          </div>
        </div>

        <motion.ul layout={!reduceMotion} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
                <CharacterCard c={c} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {shown.length === 0 && <p className="py-12 text-center text-muted">No travelers match those filters.</p>}
      </div>
    </MotionConfig>
  );
}

function FilterRow({
  label, options, value, onChange, colored = false,
}: {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
  colored?: boolean;
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
          className={chip}
          style={colored ? colorVar(o.slug) : undefined}
          aria-pressed={value === o.slug}
          onClick={() => onChange(value === o.slug ? null : o.slug)}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}
