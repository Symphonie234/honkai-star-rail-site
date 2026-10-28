"use client";

import Image from "next/image";
import {
  useEffect, useImperativeHandle, useRef, useState,
  type MouseEvent, type PointerEvent, type ReactNode, type Ref, type RefObject,
} from "react";
import { FitIcon, ZoomInIcon, ZoomOutIcon } from "../icons";

type View = { scale: number; x: number; y: number };
export type StageHandle = { zoomBy: (factor: number) => void; reset: () => void; panBy: (dx: number, dy: number) => void };

const FIT: View = { scale: 1, x: 0, y: 0 };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function ZoomStage({
  children, ref, maxScale = 5, onScaleChange, className = "", onBackgroundClick,
}: {
  children: (scale: number) => ReactNode;
  ref?: Ref<StageHandle>;
  maxScale?: number;
  onScaleChange?: (scale: number) => void;
  className?: string;
  onBackgroundClick?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(FIT);
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ kind: "pan"; x: number; y: number; view: View; moved: boolean } | { kind: "pinch"; dist: number; view: View } | null>(null);

  const onScaleRef = useRef(onScaleChange);
  useEffect(() => { onScaleRef.current = onScaleChange; });
  useEffect(() => { onScaleRef.current?.(view.scale); }, [view.scale]);

  const bound = (v: View): View => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return v;
    const maxX = (box.width * (v.scale - 1)) / 2;
    const maxY = (box.height * (v.scale - 1)) / 2;
    return { scale: v.scale, x: clamp(v.x, -maxX, maxX), y: clamp(v.y, -maxY, maxY) };
  };

  const zoomTo = (from: View, scale: number, cx = 0, cy = 0): View => {
    const s = clamp(scale, 1, maxScale);
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

  const wheelRef = useRef<(e: globalThis.WheelEvent) => void>(null);
  useEffect(() => {
    wheelRef.current = (e) => {
      e.preventDefault();
      const [cx, cy] = fromCenter(e.clientX, e.clientY);
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      setView((v) => zoomTo(v, v.scale * Math.exp(-dy * 0.0015), cx, cy));
    };
  });
  useEffect(() => {
    const box = boxRef.current!;
    const onWheel = (e: globalThis.WheelEvent) => wheelRef.current?.(e);
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      gesture.current = { kind: "pinch", dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), view };
    } else if (pts.length === 1) {
      gesture.current = { kind: "pan", x: e.clientX, y: e.clientY, view, moved: false };
      if (view.scale > 1) setDragging(true);
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
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 4) g.moved = true;
      if (g.view.scale > 1) setView(bound({ ...g.view, x: g.view.x + e.clientX - g.x, y: g.view.y + e.clientY - g.y }));
    }
  };

  const endPointer = (e: PointerEvent) => {
    const g = gesture.current;
    const wasClick = g?.kind === "pan" && !g.moved && pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    gesture.current = null;
    setDragging(false);
    if (wasClick && e.type === "pointerup") onBackgroundClick?.();
  };

  const onDoubleClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    const [cx, cy] = fromCenter(e.clientX, e.clientY);
    setView((v) => (v.scale > 1 ? FIT : zoomTo(v, 2.5, cx, cy)));
  };

  return (
    <div
      ref={boxRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={onDoubleClick}
      className={`absolute inset-0 touch-none overflow-hidden select-none ${
        view.scale > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
      } ${className}`}
    >
      <div
        className={`absolute inset-0 will-change-transform ${dragging ? "" : "transition-transform duration-200 ease-out"}`}
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        {children(view.scale)}
      </div>
    </div>
  );
}

export function FillImage({ src, alt, sizes = "100vw", quality = 90 }: { src: string; alt: string; sizes?: string; quality?: number }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center" role="status">
          <span className="size-10 animate-spin rounded-full border-2 border-line border-t-gold" />
          <span className="sr-only">Loading art…</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

export function ZoomControls({ stageRef, compact = false }: { stageRef: RefObject<StageHandle | null>; compact?: boolean }) {
  const button = `grid ${compact ? "size-8" : "size-10"} place-items-center rounded-full transition hover:bg-gold/15 hover:text-gold`;
  return (
    <div className="glass flex items-center gap-1 rounded-full p-1">
      <button type="button" className={button} aria-label="Zoom out" title="Zoom out (−)" onClick={() => stageRef.current?.zoomBy(1 / 1.5)}>
        <ZoomOutIcon />
      </button>
      <button type="button" className={button} aria-label="Zoom in" title="Zoom in (+)" onClick={() => stageRef.current?.zoomBy(1.5)}>
        <ZoomInIcon />
      </button>
      <button type="button" className={button} aria-label="Fit to screen" title="Fit (0)" onClick={() => stageRef.current?.reset()}>
        <FitIcon />
      </button>
    </div>
  );
}
