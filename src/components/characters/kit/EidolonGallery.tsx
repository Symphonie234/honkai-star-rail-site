"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../../icons";
import { FillImage, ZoomControls, ZoomStage, type StageHandle } from "../../viewer/ZoomStage";
import { KitDescription } from "./KitDescription";

export type GalleryEidolon = {
  rank: number;
  name: string;
  desc: string;
  /** Small round icon. */
  icon: string;
  /** Card art, if the game has it. */
  art: string | null;
};

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];

/**
 * A character's Eidolons as cards, each opening the Eidolon gallery: a window (not
 * full screen) showing the card art — zoomable inside the frame — beside the
 * Eidolon's name and effect, with ←/→ (arrows, keys or swipe) between Eidolons and
 * a strip of all six. Reading effects while browsing the art is the point, which a
 * full-screen image viewer would hide.
 */
export function EidolonGallery({ name, eidolons }: { name: string; eidolons: GalleryEidolon[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eidolons.map((e, i) => (
          <li key={e.rank} className="glass flex flex-col overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open Eidolon ${e.rank}, ${e.name}, in the gallery`}
              className="group relative block aspect-[4/3] cursor-zoom-in bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--c)_28%,transparent),transparent_70%)]"
            >
              {e.art ? (
                <Image
                  src={e.art}
                  alt={`${name}'s Eidolon ${e.rank}: ${e.name}`}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                  className="object-contain p-3 drop-shadow-[0_10px_24px_rgb(0_0_0/0.5)] transition duration-300 ease-out-expo group-hover:scale-[1.03]"
                />
              ) : (
                <Image src={e.icon} alt="" width={96} height={96} className="absolute inset-0 m-auto opacity-80" />
              )}
              <span className="glass pointer-events-none absolute right-3 bottom-3 rounded-full px-3 py-1 text-xs font-semibold opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                View
              </span>
            </button>
            <div className="flex flex-1 gap-4 p-5">
              <EidolonBadge e={e} />
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-widest text-violet uppercase">Eidolon {ROMAN[e.rank]}</p>
                <h4 className="font-display text-lg leading-tight font-bold">{e.name}</h4>
                <KitDescription desc={e.desc} className="mt-2 text-sm" />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {open !== null && <GalleryWindow name={name} eidolons={eidolons} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

function EidolonBadge({ e, size = 48 }: { e: GalleryEidolon; size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center rounded-full border border-violet/50 bg-space" style={{ width: size, height: size }}>
      <Image src={e.icon} alt="" width={Math.round(size * 0.7)} height={Math.round(size * 0.7)} className="rounded-full" />
      <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-violet text-[0.65rem] font-bold text-space">
        E{e.rank}
      </span>
    </span>
  );
}

function GalleryWindow({
  name, eidolons, index, onIndex, onClose,
}: {
  name: string;
  eidolons: GalleryEidolon[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<StageHandle>(null);
  const [zoom, setZoom] = useState({ index, scale: 1 });
  const scale = zoom.index === index ? zoom.scale : 1;
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const e = eidolons[index];
  const go = (delta: number) => onIndex((index + delta + eidolons.length) % eidolons.length);

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
      if (dialog.open) dialog.close();
    };
  }, []);

  // See ArtViewer: in Strict Mode the dialog's close event also follows our own cleanup,
  // so only a close that leaves it shut (Esc) means the reader closed it.
  const handleClose = () => {
    if (!dialogRef.current?.open) onClose();
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => go(-1),
      ArrowRight: () => go(1),
      "+": () => stageRef.current?.zoomBy(1.5),
      "=": () => stageRef.current?.zoomBy(1.5),
      "-": () => stageRef.current?.zoomBy(1 / 1.5),
      "0": () => stageRef.current?.reset(),
    };
    const action = actions[ev.key];
    if (action && !(ev.target as HTMLElement).closest("input, select, textarea")) {
      ev.preventDefault();
      action();
    }
  };

  // A horizontal swipe on the art (when not zoomed in) moves between Eidolons.
  const onPointerDown = (ev: PointerEvent) => { swipe.current = { x: ev.clientX, y: ev.clientY }; };
  const onPointerUp = (ev: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || scale > 1) return;
    const dx = ev.clientX - start.x;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(ev.clientY - start.y) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const arrow = "glass absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full transition hover:border-gold hover:text-gold";

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onKeyDown={onKeyDown}
      onClick={(ev) => ev.target === dialogRef.current && onClose()}
      aria-label={`${name}'s Eidolons`}
      className="m-auto max-h-[min(92dvh,760px)] w-[min(100%-1.5rem,1040px)] overflow-hidden rounded-3xl border border-line bg-surface-solid p-0 text-ink shadow-[0_30px_80px_rgb(0_0_0/0.6)] backdrop:bg-space/80 backdrop:backdrop-blur-sm"
    >
      <MotionConfig reducedMotion="user">
        <div className="grid max-h-[min(92dvh,760px)] grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:grid-rows-1">
          {/* Art */}
          <div
            className="relative min-h-[46dvh] bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--c,var(--color-violet))_26%,transparent),var(--color-space)_75%)] md:min-h-[560px]"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                <ZoomStage ref={stageRef} onScaleChange={(s) => setZoom({ index, scale: s })}>
                  {() => (
                    <div className="absolute inset-4">
                      {e.art ? <FillImage src={e.art} alt={`${name}'s Eidolon ${e.rank}: ${e.name}`} sizes="(min-width: 768px) 620px, 100vw" /> : (
                        <Image src={e.icon} alt="" width={160} height={160} className="absolute inset-0 m-auto" />
                      )}
                    </div>
                  )}
                </ZoomStage>
              </motion.div>
            </AnimatePresence>
            <button type="button" onClick={() => go(-1)} aria-label="Previous Eidolon" title="Previous (←)" className={`${arrow} left-3`}>
              <ChevronLeftIcon />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next Eidolon" title="Next (→)" className={`${arrow} right-3`}>
              <ChevronRightIcon />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              <ZoomControls stageRef={stageRef} compact />
              <span className="glass rounded-full px-2.5 py-1 text-xs tabular-nums text-muted">{Math.round(scale * 100)}%</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex min-h-0 flex-col border-t border-line md:border-t-0 md:border-l">
            <div className="flex items-start justify-between gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
              <div className="flex items-center gap-3">
                <EidolonBadge e={e} size={52} />
                <div>
                  <p className="text-xs font-semibold tracking-widest text-violet uppercase">
                    {name} · Eidolon {ROMAN[e.rank]}
                  </p>
                  <h2 className="font-display text-2xl leading-tight font-bold" aria-live="polite">{e.name}</h2>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" title="Close (Esc)" className="glass grid size-10 shrink-0 place-items-center rounded-full transition hover:border-gold hover:text-gold">
                <CloseIcon />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <KitDescription desc={e.desc} />
            </div>
            <ol className="flex gap-2 overflow-x-auto border-t border-line p-4" aria-label="All Eidolons">
              {eidolons.map((x, i) => (
                <li key={x.rank}>
                  <button
                    type="button"
                    onClick={() => onIndex(i)}
                    aria-label={`Eidolon ${x.rank}: ${x.name}`}
                    aria-current={i === index ? "true" : undefined}
                    className="relative block size-14 overflow-hidden rounded-xl border border-line bg-space transition hover:border-violet aria-[current=true]:border-violet aria-[current=true]:ring-2 aria-[current=true]:ring-violet/50"
                  >
                    {x.art ? (
                      <Image src={x.art} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <Image src={x.icon} alt="" width={40} height={40} className="absolute inset-0 m-auto" />
                    )}
                    <span className="absolute right-0.5 bottom-0.5 rounded bg-space/80 px-1 text-[0.6rem] font-bold text-violet">E{x.rank}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="hidden px-4 pb-3 text-xs text-muted sm:block">← → to browse · scroll or double-click to zoom · Esc to close</p>
          </div>
        </div>
      </MotionConfig>
    </dialog>
  );
}
