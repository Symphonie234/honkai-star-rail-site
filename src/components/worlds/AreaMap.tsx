"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { AreaFloor, MapCategory, MapMarker } from "@/lib/area";
import { mapIcon, mapImage, mapPinImage } from "@/lib/images";
import { GameText } from "../GameText";
import { CloseIcon, EnterFullscreenIcon, ExitFullscreenIcon, ImageIcon, LayersIcon } from "../icons";
import { ArtViewer } from "../characters/ArtViewer";
import { FillImage, ZoomControls, ZoomStage, type StageHandle } from "../viewer/ZoomStage";

const subscribeFullscreen = (onChange: () => void) => {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
};
const noSubscribe = () => () => {};

const hue = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

const floorLevel = (label: string) => (label.startsWith("B") ? -Number(label.slice(1)) : label.startsWith("F") ? Number(label.slice(1)) : 0);

export function AreaMap({ areaSlug, areaName, floors: givenFloors, categories }: {
  areaSlug: string;
  areaName: string;
  floors: AreaFloor[];
  categories: MapCategory[];
}) {
  const floors = useMemo(() => [...givenFloors].sort((a, b) => floorLevel(b.label) - floorLevel(a.label)), [givenFloors]);
  const [floorIndex, setFloorIndex] = useState(() => Math.max(0, floors.findIndex((fl) => fl.label === "F1" || fl.label === "Map")));
  const [enabled, setEnabled] = useState(() => new Set(categories.filter((c) => c.defaultOn).map((c) => c.id)));
  const [onlyWithView, setOnlyWithView] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [viewing, setViewing] = useState<MapMarker | null>(null);
  const stageRef = useRef<StageHandle>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenElement === frameRef.current && !!frameRef.current, () => false);
  const canFullscreen = useSyncExternalStore(noSubscribe, () => document.fullscreenEnabled, () => false);

  const floor = floors[floorIndex];
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const floorCats = useMemo(() => {
    const counts = new Map<string, { total: number; views: number }>();
    for (const m of floor.markers) {
      const c = counts.get(m.cat) ?? { total: 0, views: 0 };
      c.total++;
      if (m.image) c.views++;
      counts.set(m.cat, c);
    }
    return [...counts].map(([id, n]) => ({ cat: catById.get(id)!, ...n })).filter((c) => c.cat).sort((a, b) => Number(b.cat.defaultOn) - Number(a.cat.defaultOn) || b.total - a.total);
  }, [floor, catById]);
  const shown = floor.markers.filter((m) => enabled.has(m.cat) && (!onlyWithView || m.image));
  const selected = floor.markers.find((m) => m.id === selectedId) ?? null;
  const ratio = floor.width / floor.height;

  const toggle = (id: string) =>
    setEnabled((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const switchFloor = (i: number) => {
    setFloorIndex(i);
    setSelectedId(null);
    stageRef.current?.reset();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else frameRef.current?.requestFullscreen().catch(() => {});
  };

  const chip = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors border-line text-muted hover:text-ink aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-ink";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {floors.length > 1 ? (
          <div role="tablist" aria-label="Floor" className="glass flex items-center rounded-full p-1 text-sm">
            {floors.map((f, i) => (
              <button
                key={f.label}
                type="button"
                role="tab"
                aria-selected={i === floorIndex}
                onClick={() => switchFloor(i)}
                className="rounded-full px-3.5 py-1.5 font-semibold text-muted tabular-nums transition-colors hover:text-ink aria-selected:bg-gold aria-selected:text-gold-ink"
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : <span />}
        <p className="text-sm text-muted" aria-live="polite">
          {shown.length} of {floor.markers.length} points shown
        </p>
      </div>

      <details className="glass rounded-2xl p-4" open>
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <LayersIcon /> Map layers
          <span className="font-normal text-muted">— choose what the map marks</span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={chip} onClick={() => setEnabled(new Set(floorCats.map((c) => c.cat.id)))}>Show all</button>
          <button type="button" className={chip} onClick={() => setEnabled(new Set())}>Hide all</button>
          <button type="button" className={chip} aria-pressed={onlyWithView} onClick={() => setOnlyWithView((v) => !v)}>
            <ImageIcon /> Only points with an in-game view
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Categories">
          {floorCats.map(({ cat, total, views }) => (
            <button key={cat.id} type="button" className={chip} aria-pressed={enabled.has(cat.id)} onClick={() => toggle(cat.id)}
              title={views ? `${views} with an in-game view` : undefined}>
              <CategoryIcon cat={cat} size={18} />
              {cat.name}
              <span className="tabular-nums opacity-70">{total}</span>
            </button>
          ))}
        </div>
      </details>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div ref={frameRef} className={`relative overflow-hidden rounded-2xl border border-line bg-[#d3d3d3] ${isFullscreen ? "h-screen" : "h-[min(78vh,760px)] min-h-[420px]"}`}>
          <ZoomStage ref={stageRef} maxScale={8} onScaleChange={setScale} onBackgroundClick={() => setSelectedId(null)}>
            {(s) => (
              <div className="absolute inset-0 grid place-items-center [container-type:size]">
                <div className="relative" style={{ width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: String(ratio) }}>
                  <FillImage key={floor.label} src={mapImage(areaSlug, floor.label)} alt={`Map of ${areaName}${floors.length > 1 ? `, ${floor.label}` : ""}`} sizes="(min-width: 1024px) 860px, 100vw" quality={90} />
                  {shown.map((m) => (
                    <Pin key={m.id} marker={m} cat={catById.get(m.cat)} scale={s} selected={m.id === selectedId}
                      onSelect={() => setSelectedId(m.id === selectedId ? null : m.id)} />
                  ))}
                </div>
              </div>
            )}
          </ZoomStage>
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <span className="glass rounded-full px-2.5 py-1 text-xs tabular-nums text-muted">{Math.round(scale * 100)}%</span>
            <ZoomControls stageRef={stageRef} compact />
            {canFullscreen && (
              <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen map"}
                className="glass grid size-10 place-items-center rounded-full transition hover:border-gold hover:text-gold">
                {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
              </button>
            )}
          </div>
          {isFullscreen && selected && (
            <div className="absolute top-3 left-3 w-[min(340px,calc(100%-1.5rem))]">
              <MarkerPanel marker={selected} cat={catById.get(selected.cat)} onClose={() => setSelectedId(null)} onView={() => setViewing(selected)} />
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-[calc(var(--header-h,4rem)+1rem)] lg:self-start">
          {selected ? (
            <MarkerPanel marker={selected} cat={catById.get(selected.cat)} onClose={() => setSelectedId(null)} onView={() => setViewing(selected)} />
          ) : (
            <div className="glass rounded-2xl p-5 text-sm text-muted">
              <p className="font-semibold text-ink">Select a point on the map</p>
              <p className="mt-2">
                Pins with a <span className="inline-flex translate-y-0.5 text-gold"><ImageIcon /></span> badge have an in-game view of the spot.
                Scroll or pinch to zoom, drag to pan.
              </p>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted">Map and points from the Honkai: Star Rail Wiki&apos;s interactive maps. Map art © HoYoverse.</p>

      {viewing?.image && (
        <ArtViewer src={mapPinImage(viewing.image)} title={viewing.title} caption={`In-game view · ${areaName}`} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

function CategoryIcon({ cat, size }: { cat: MapCategory | undefined; size: number }) {
  if (cat?.icon) return <Image src={mapIcon(cat.icon)} alt="" width={size} height={size} className="shrink-0" />;
  return (
    <span aria-hidden="true" className="inline-block shrink-0 rounded-full border border-white/60"
      style={{ width: size * 0.7, height: size * 0.7, background: `hsl(${hue(cat?.id ?? "")} 70% 55%)` }} />
  );
}

function Pin({ marker: m, cat, scale, selected, onSelect }: {
  marker: MapMarker; cat: MapCategory | undefined; scale: number; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${m.title}${cat ? ` (${cat.name})` : ""}${m.image ? ", has an in-game view" : ""}`}
      aria-pressed={selected}
      title={m.title}
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, zIndex: selected ? 20 : 1 } as CSSProperties}
    >
      <span className="block origin-center transition-transform" style={{ transform: `scale(${1 / scale})` }}>
        <span className={`relative grid size-7 place-items-center rounded-full border-2 bg-space/85 shadow-[0_2px_8px_rgb(0_0_0/0.6)] transition group-hover:scale-125 ${
          selected ? "scale-125 border-gold ring-4 ring-gold/40" : "border-white/70"
        }`}>
          <CategoryIcon cat={cat} size={18} />
          {m.image && (
            <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-gold text-gold-ink [&_svg]:size-2.5">
              <ImageIcon />
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function MarkerPanel({ marker: m, cat, onClose, onView }: { marker: MapMarker; cat: MapCategory | undefined; onClose: () => void; onView: () => void }) {
  return (
    <article aria-label={`Selected point: ${m.title}`} className="glass overflow-hidden rounded-2xl bg-surface-solid/95">
      {m.image && (
        <button type="button" onClick={onView} className="group relative block aspect-video w-full cursor-zoom-in bg-space" aria-label={`Enlarge the in-game view of ${m.title}`}>
          <Image src={mapPinImage(m.image)} alt={`In-game view: ${m.title}`} fill sizes="340px" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-space/80 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wider text-gold uppercase backdrop-blur-sm">
            <ImageIcon /> In-game view
          </span>
        </button>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted uppercase">
              <CategoryIcon cat={cat} size={16} /> {cat?.name ?? "Point"}
            </p>
            <h3 className="mt-1 font-display text-lg leading-tight font-bold">{m.title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Clear selection" className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-gold/15 hover:text-gold">
            <CloseIcon />
          </button>
        </div>
        {m.desc && <GameText text={m.desc} className="mt-2 gap-2 text-sm leading-relaxed text-muted" />}
        {m.rewards.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {m.rewards.map((r) => (
              <li key={r.name} className="rounded-full border border-line px-2 py-0.5">
                {r.name} <span className="font-semibold text-gold-strong tabular-nums">×{r.count.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
