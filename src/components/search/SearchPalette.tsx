"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { SearchIcon } from "../icons";
import { useStoryProgress } from "../spoilers/story-progress";

let indexPromise: Promise<SearchEntry[]> | null = null;
/** The search index, downloaded once per visit, the first time it's needed. */
export const loadSearchIndex = () => {
  indexPromise ??= fetch("/search-index.json").then((r) => r.json() as Promise<SearchEntry[]>).catch(() => {
    indexPromise = null;
    return [];
  });
  return indexPromise;
};

/** Search results for a query, honouring the reader's story progress. */
export function useSearch(query: string) {
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const progress = useStoryProgress();
  useEffect(() => {
    let live = true;
    loadSearchIndex().then((e) => live && setEntries(e));
    return () => { live = false; };
  }, []);
  const results = useMemo(() => (entries ? searchEntries(entries, query, progress) : []), [entries, query, progress]);
  return { results, loading: entries === null };
}

/** The header's search button; opens the search window (also on Ctrl/⌘ K or "/"). */
export function SearchButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={() => loadSearchIndex()}
        aria-label="Search the archive"
        className="glass flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition hover:border-gold hover:text-ink"
      >
        <SearchIcon />
        <span className="hidden xl:inline">Search</span>
        <kbd className="hidden rounded border border-line px-1.5 text-[0.65rem] xl:inline">Ctrl K</kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const { results, loading } = useSearch(query);
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  // As in ArtViewer: under Strict Mode the close event can follow our own cleanup.
  const handleClose = () => { if (!dialogRef.current?.open) onClose(); };

  const go = (e: SearchEntry | undefined) => {
    if (!e) return;
    onClose();
    router.push(e.u);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-label="Search the archive"
      className="mx-auto mt-[10vh] w-[min(100%-1.5rem,680px)] overflow-hidden rounded-3xl border border-line bg-surface-solid p-0 text-ink shadow-[0_30px_80px_rgb(0_0_0/0.6)] backdrop:bg-space/75 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-line px-5">
        <SearchIcon />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onKeyDown}
          placeholder="Search characters, Light Cones, relics, enemies, areas, lore…"
          aria-label="Search"
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `result-${active}` : undefined}
          className="w-full bg-transparent py-4 text-lg placeholder:text-muted focus:outline-none"
        />
        <kbd className="rounded border border-line px-1.5 text-xs text-muted">Esc</kbd>
      </div>
      <SearchResults id="search-results" query={query} results={results} loading={loading} active={active} onHover={setActive} onPick={go} />
      <p className="border-t border-line px-5 py-2.5 text-xs text-muted">
        ↑ ↓ to move · Enter to open · Results follow your story progress, so spoilers stay hidden.
      </p>
    </dialog>
  );
}

export function SearchResults({
  id, query, results, loading, active, onHover, onPick, tall = false,
}: {
  id: string;
  query: string;
  results: SearchEntry[];
  loading: boolean;
  active: number;
  onHover: (i: number) => void;
  onPick: (e: SearchEntry) => void;
  tall?: boolean;
}) {
  if (!query.trim()) return <p className="px-5 py-8 text-center text-sm text-muted">Type to search everything in the archive.</p>;
  if (loading) return <p className="px-5 py-8 text-center text-sm text-muted" role="status">Loading the index…</p>;
  if (!results.length) return <p className="px-5 py-8 text-center text-sm text-muted">Nothing found for “{query}”.</p>;
  return (
    <ul id={id} role="listbox" className={`${tall ? "" : "max-h-[60vh]"} overflow-y-auto p-2`}>
      {results.map((r, i) => (
        <li key={r.u} id={`result-${i}`} role="option" aria-selected={i === active}>
          <a
            href={r.u}
            onClick={(e) => { e.preventDefault(); onPick(r); }}
            onMouseMove={() => onHover(i)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-gold/15" : ""}`}
          >
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-space">
              {r.i ? <Image src={r.i} alt="" width={40} height={40} className="size-10 object-contain" /> : <span className="text-gold">✦</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{r.n}</span>
              <span className="block truncate text-xs text-muted">{r.s}</span>
            </span>
            <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.65rem] tracking-wider text-muted uppercase">{r.t}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
