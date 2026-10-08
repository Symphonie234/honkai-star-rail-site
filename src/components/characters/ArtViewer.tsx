"use client";

import { MotionConfig, motion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import type { ArtVariant } from "@/db/schema";
import { CloseIcon, EnterFullscreenIcon, ExitFullscreenIcon } from "../icons";
import { FillImage, ZoomControls, ZoomStage, type StageHandle } from "../viewer/ZoomStage";
import { VariantToggle } from "./VariantToggle";

type Props = {
  src: string;
  title: string;
  caption: string;
  /** Shown when the full splash art is withheld as a spoiler. */
  notice?: string;
  /** Looks to switch between (the Trailblazer); omit for a single image. */
  variants?: ArtVariant[];
  current?: ArtVariant;
  onSelectVariant?: (v: ArtVariant) => void;
  onClose: () => void;
};

/** Controls fade out after this long without pointer or keyboard activity. */
const IDLE_MS = 2500;

// Browser fullscreen (hides the browser's own UI). Not available everywhere, e.g. iPhone Safari.
const subscribeFullscreen = (onChange: () => void) => {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
};
const noSubscribe = () => () => {};

/**
 * Full-screen art viewer: a modal <dialog> (focus trap, Esc to close) covering the
 * window, with zoom (wheel, pinch, double-click, buttons, +/−/0 keys), drag-to-pan,
 * controls that fade when idle, and optional browser fullscreen (F).
 * Mount it only while open; it opens itself on mount.
 */
export function ArtViewer({ src, title, caption, notice, variants = [], current, onSelectVariant, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Browsers refuse fullscreen on a <dialog> itself, so a wrapper inside it goes fullscreen.
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<StageHandle>(null);
  const [idle, setIdle] = useState(false);
  // Zoom level for the badge; a new image starts at 100%.
  const [zoom, setZoom] = useState({ src, scale: 1 });
  const scale = zoom.src === src ? zoom.scale : 1;
  const idleTimer = useRef(0);
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, () => !!document.fullscreenElement, () => false);
  const canFullscreen = useSyncExternalStore(noSubscribe, () => document.fullscreenEnabled, () => false);

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    // showModal focuses the first button, which would pin the controls visible (they stay
    // up while focused); start with focus on the dialog itself instead.
    dialog.focus();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden"; // the page behind shouldn't scroll
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
    return () => {
      clearTimeout(idleTimer.current);
      root.style.overflow = prevOverflow;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (dialog.open) dialog.close();
    };
  }, []);

  // The dialog's close event also fires after this component's own cleanup closes it:
  // React Strict Mode (development) mounts, unmounts and remounts, and treating that
  // event as "closed" unmounted the viewer the moment it opened. By the time the event
  // arrives the remount has reopened the dialog, so only a close that leaves it shut
  // (Esc) means the reader closed the viewer.
  const handleClose = () => {
    if (!dialogRef.current?.open) onClose();
  };

  const wake = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else fullscreenRef.current?.requestFullscreen().catch(() => {});
  };

  const onKeyDown = (e: KeyboardEvent) => {
    wake();
    const stage = stageRef.current;
    if (!stage) return;
    const pan = 80;
    const actions: Record<string, () => void> = {
      "+": () => stage.zoomBy(1.5),
      "=": () => stage.zoomBy(1.5),
      "-": () => stage.zoomBy(1 / 1.5),
      "0": () => stage.reset(),
      f: () => canFullscreen && toggleFullscreen(),
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

  // Hovering a control, or reaching it by keyboard, keeps it visible while idle.
  const fade = `transition-opacity duration-500 ${idle ? "opacity-0 hover:opacity-100 has-[:focus-visible]:opacity-100" : "opacity-100"}`;
  const roundButton =
    "glass pointer-events-auto grid size-11 shrink-0 place-items-center rounded-full transition hover:border-gold hover:text-gold";

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
      onPointerDown={wake}
      aria-label={`${title} — full art`}
      tabIndex={-1}
      className={`fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-space p-0 text-ink backdrop:bg-space ${
        idle ? "cursor-none" : ""
      } outline-none`}
    >
      <div ref={fullscreenRef} className="h-full w-full bg-space">
        <MotionConfig reducedMotion="user">
          <motion.div
            className="relative h-full w-full bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--c,var(--color-gold))_22%,transparent),transparent_70%)]"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* The art fills the whole window; controls float over it. Keyed by src so
                zoom and loading state reset when the image changes. */}
            <ZoomStage key={src} ref={stageRef} onScaleChange={(scale) => setZoom({ src, scale })}>
              {() => <FillImage src={src} alt={title} />}
            </ZoomStage>
            <span className={`glass pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs tabular-nums text-muted sm:top-7 ${fade}`}>
              {Math.round(scale * 100)}%
            </span>
  
            <div className={`pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-space/90 via-space/40 to-transparent p-4 pb-12 sm:p-6 sm:pb-16 ${fade}`}>
              <div className="pointer-events-auto [text-shadow:0_1px_8px_rgb(11_15_36/0.9)]">
                <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
                <p className="text-sm text-muted">{caption}</p>
                {notice && <p className="mt-1 text-sm text-gold">{notice}</p>}
              </div>
              <div className="flex gap-2">
                {canFullscreen && (
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Exit browser fullscreen" : "Browser fullscreen"}
                    title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
                    className={roundButton}
                  >
                    {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
                  </button>
                )}
                <button type="button" onClick={onClose} aria-label="Close" title="Close (Esc)" className={roundButton}>
                  <CloseIcon />
                </button>
              </div>
            </div>
  
            <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-space/90 via-space/40 to-transparent p-4 pt-12 sm:p-6 sm:pt-16 ${fade}`}>
              <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3">
                <ZoomControls stageRef={stageRef} />
                {variants.length > 1 && current && onSelectVariant && (
                  <VariantToggle variants={variants} current={current} onSelect={onSelectVariant} />
                )}
              </div>
              <p className="hidden text-xs text-muted sm:block">
                Scroll or double-click to zoom · drag to pan{canFullscreen ? " · F for fullscreen" : ""} · Esc to close · Art © HoYoverse
              </p>
            </div>
          </motion.div>
        </MotionConfig>
      </div>
    </dialog>
  );
}
