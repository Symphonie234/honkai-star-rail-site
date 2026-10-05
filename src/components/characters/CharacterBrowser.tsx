"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { CharacterWithRefs } from "@/lib/queries";
import { colorVar } from "@/lib/theme";
import { CharacterCard } from "./CharacterCard";

type Option = { slug: string; name: string };

type Props = {
  characters: CharacterWithRefs[];
  elements: Option[];
  paths: Option[];
};

const chip =
  "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-[var(--c,var(--color-gold))] aria-pressed:bg-[color-mix(in_srgb,var(--c,var(--color-gold))_18%,transparent)] aria-pressed:text-ink border-line text-muted hover:text-ink";

export function CharacterBrowser({ characters, elements, paths }: Props) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters.filter(
      (c) =>
        (!element || c.elementSlug === element) &&
        (!path || c.pathSlug === path) &&
        (!q || c.name.toLowerCase().includes(q) || c.faction?.name.toLowerCase().includes(q)),
    );
  }, [characters, query, element, path]);

  return (
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
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        {shown.length} {shown.length === 1 ? "traveler" : "travelers"}
      </p>

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
