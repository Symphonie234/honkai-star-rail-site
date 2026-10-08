"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SEARCH_KINDS } from "@/lib/search";
import { SearchIcon } from "../icons";
import { SearchResults, useSearch } from "./SearchPalette";

/** Full-page search: the same index as the header's search window, with kind filters and a shareable ?q=. */
export function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [kind, setKind] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const { results, loading } = useSearch(query);
  const shown = kind ? results.filter((r) => r.t === kind) : results;
  const counts = new Map<string, number>();
  for (const r of results) counts.set(r.t, (counts.get(r.t) ?? 0) + 1);

  const update = (q: string) => {
    setQuery(q);
    setActive(0);
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
  };

  const chip = "rounded-full border px-3 py-1.5 text-sm transition-colors aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink border-line text-muted hover:text-ink";
  return (
    <div className="flex flex-col gap-5">
      <label className="glass flex items-center gap-3 rounded-full px-5">
        <SearchIcon />
        <input autoFocus type="search" value={query} onChange={(e) => update(e.target.value)} aria-label="Search the archive"
          placeholder="Characters, Light Cones, relics, materials, enemies, areas, lore…"
          className="w-full bg-transparent py-3.5 text-lg placeholder:text-muted focus:outline-none" />
      </label>
      {results.length > 0 && (
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          <button type="button" className={chip} aria-pressed={kind === null} onClick={() => setKind(null)}>All {results.length}</button>
          {SEARCH_KINDS.filter((k) => counts.has(k)).map((k) => (
            <button key={k} type="button" className={chip} aria-pressed={kind === k} onClick={() => setKind(kind === k ? null : k)}>
              {k} {counts.get(k)}
            </button>
          ))}
        </div>
      )}
      <div className="glass rounded-2xl">
        <SearchResults id="page-results" query={query} results={shown} loading={loading} active={active} onHover={setActive}
          onPick={(r) => router.push(r.u)} tall />
      </div>
      <p className="text-xs text-muted">Results follow your story progress (header), so spoilers stay out of them.</p>
    </div>
  );
}
