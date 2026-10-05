"use client";

import { MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import {
  useEffect, useImperativeHandle, useRef, useState,
  type KeyboardEvent, type MouseEvent, type PointerEvent, type Ref, type RefObject, type WheelEvent,
} from "react";
import type { ArtVariant } from "@/db/schema";
import { CloseIcon, FitIcon, ZoomInIcon, ZoomOutIcon } from "../icons";
import { VariantToggle } from "./VariantToggle";

type Props = {
  src: string;
  title: string;
  caption: string;
  /** Shown when the full splash art is withheld as a spoiler. */
  notice?: string;
  variants: ArtVariant[];
  current?: ArtVariant;
  onSelectVariant: (v: ArtVariant) => void;
  onClose: () => void;
};

/**
 * Full-screen art viewer: a modal <dialog> (focus trap, Esc to close) with
 * zoom (wheel, pinch, double-click, buttons, +/−/0 keys) and drag-to-pan.
 * Mount it only while open; it opens itself on mount.
 */
export function ArtViewer({ src, title, caption, notice, variants, current, onSelectVariant, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<StageHandle>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden"; // the page behind shouldn't scroll
    return () => {
      root.style.overflow = prevOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pan = 80;
    const actions: Record<string, () => void> = {
      "+": () => stage.zoomBy(1.5),
      "=": () => stage.zoomBy(1.5),
      "-": () => stage.zoomBy(1 / 1.5),
      "0": () => stage.reset(),
      ArrowLeft: () => stage.panBy(pan, 0),
      ArrowRight: () => stage.panBy(-pan, 0),
      ArrowUp: () => stage.panBy(0, pan),
      ArrowDown: () => stage.panBy(0, -pan),
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={onKeyDown}
      aria-label={`${title} — full art`}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-ink backdrop:bg-space/90 backdrop:backdrop-blur-md"
    >
      <MotionConfig reducedMotion="user">
        <motion.div
          className="relative h-full w-full bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--c,var(--color-gold))_22%,transparent),transparent_65%)]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Keyed by src so zoom and loading state reset when the image changes. */}
          <Stage key={src} ref={stageRef} src={src} alt={title} />

          {/* Top bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-space/95 via-space/60 to-transparent p-4 pb-10 sm:p-6 sm:pb-12">
            <div className="pointer-events-auto [text-shadow:0_1px_8px_rgb(11_15_36/0.9)]">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
              <p className="text-sm text-muted">{caption}</p>
              {notice && <p className="mt-1 text-sm text-gold">{notice}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close (Esc)"
              className="glass pointer-events-auto grid size-11 shrink-0 place-items-center rounded-full transition hover:border-gold hover:text-gold"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Bottom toolbar */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-space/95 via-space/60 to-transparent p-4 pt-10 sm:p-6 sm:pt-12">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3">
              <ZoomControls stageRef={stageRef} />
              {variants.length > 1 && current && (
                <VariantToggle variants={variants} current={current} onSelect={onSelectVariant} />
              )}
            </div>
            <p className="hidden text-xs text-muted sm:block">
              Scroll or double-click to zoom · drag to pan · Esc to close · Art © HoYoverse
            </p>
          </div>
        </motion.div>
      </MotionConfig>
    </dialog>
  );
}

function ZoomControls({ stageRef }: { stageRef: RefObject<StageHandle | null> }) {
  const button = "grid size-10 place-items-center rounded-full transition hover:bg-gold/15 hover:text-gold";
  return (
    <div className="glass flex items-center gap-1 rounded-full p-1">
      <button type="button" className={button} aria-label="Zoom out" title="Zoom out (−)" onClick={() => stageRef.current?.zoomBy(1 / 1.5)}>
        <ZoomOutIcon />
      </button>
      <button type="button" className={button} aria-label="Zoom in" title="Zoom in (+)" onClick={() => stageRef.current?.zoomBy(1.5)}>
        <ZoomInIcon />
      </button>
      <button type="button" className={button} aria-label="Fit to screen" title="Fit to screen (0)" onClick={() => stageRef.current?.reset()}>
        <FitIcon />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------

type View = { scale: number; x: number; y: number };
type StageHandle = { zoomBy: (factor: number) => void; reset: () => void; panBy: (dx: number, dy: number) => void };

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const FIT: View = { scale: 1, x: 0, y: 0 };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** The zoomable, pannable image. */
function Stage({ src, alt, ref }: { src: string; alt: string; ref: Ref<StageHandle> }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(FIT);
  const [loaded, setLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ kind: "pan"; x: number; y: number; view: View } | { kind: "pinch"; dist: number; view: View } | null>(null);

  // Keep the image from being dragged entirely off-screen.
  const bound = (v: View): View => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return v;
    const maxX = (box.width * (v.scale - 1)) / 2;
    const maxY = (box.height * (v.scale - 1)) / 2;
    return { scale: v.scale, x: clamp(v.x, -maxX, maxX), y: clamp(v.y, -maxY, maxY) };
  };

  /** Zoom to `scale`, keeping the point (cx, cy) — relative to the box center — fixed on screen. */
  const zoomTo = (from: View, scale: number, cx = 0, cy = 0): View => {
    const s = clamp(scale, MIN_SCALE, MAX_SCALE);
    const k = s / from.scale;
    return bound({ scale: s, x: cx - (cx - from.x) * k, y: cy - (cy - from.y) * k });
  };

  const fromCenter = (clientX: number, clientY: number) => {
    const box = boxRef.current!.getBoundingClientRect();
    return [clientX - box.left - box.width / 2, clientY - box.top - box.height / 2] as const;
  };

  useImperativeHandle(ref, () => ({
    zoomBy: (f) => setView((v) => zoomTo(v, v.scale * f)),
    reset: () => setView(FIT),
    panBy: (dx, dy) => setView((v) => bound({ ...v, x: v.x + dx, y: v.y + dy })),
  }));

  const onWheel = (e: WheelEvent) => {
    const [cx, cy] = fromCenter(e.clientX, e.clientY);
    setView((v) => zoomTo(v, v.scale * Math.exp(-e.deltaY * 0.0015), cx, cy));
  };

  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      gesture.current = { kind: "pinch", dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), view };
    } else if (pts.length === 1 && view.scale > 1) {
      gesture.current = { kind: "pan", x: e.clientX, y: e.clientY, view };
      setDragging(true);
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (g?.kind === "pinch") {
      const [a, b] = [...pointers.current.values()];
      const [cx, cy] = fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2);
      setView(zoomTo(g.view, g.view.scale * (Math.hypot(a.x - b.x, a.y - b.y) / g.dist), cx, cy));
    } else if (g?.kind === "pan") {
      setView(bound({ ...g.view, x: g.view.x + e.clientX - g.x, y: g.view.y + e.clientY - g.y }));
    }
  };

  const endPointer = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    gesture.current = null;
    setDragging(false);
  };

  const onDoubleClick = (e: MouseEvent) => {
    const [cx, cy] = fromCenter(e.clientX, e.clientY);
    setView((v) => (v.scale > 1 ? FIT : zoomTo(v, 2.5, cx, cy)));
  };

  return (
    <div
      ref={boxRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={onDoubleClick}
      className={`absolute inset-x-0 top-20 bottom-28 touch-none select-none sm:top-24 sm:bottom-32 ${
        view.scale > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
      }`}
    >
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center" role="status">
          <span className="size-10 animate-spin rounded-full border-2 border-line border-t-gold" />
          <span className="sr-only">Loading art…</span>
        </div>
      )}
      <div
        className={`absolute inset-0 will-change-transform ${dragging ? "" : "transition-transform duration-200 ease-out"}`}
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={90}
          draggable={false}
          onLoad={() => setLoaded(true)}
          className={`object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      <span className="glass pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs tabular-nums text-muted">
        {Math.round(view.scale * 100)}%
      </span>
    </div>
  );
}
