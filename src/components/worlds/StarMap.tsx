"use client";

import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { colorVar } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export type MapWorld = {
  slug: string;
  name: string;
  tagline: string;
  color: string;
  releaseVersion: string;
  arcOrder: number;
  mapX: number;
  mapY: number;
};

// The map is 16:9; world positions are percentages of width and height.
const VIEW_W = 100;
const VIEW_H = 56.25;

type Point = { x: number; y: number };

/** Smooth curve through every stop (Catmull-Rom converted to cubic Béziers). */
function railPath(pts: Point[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const stopLabel = (n: number) => `Stop ${String(n).padStart(2, "0")}`;

export function StarMap({ worlds }: { worlds: MapWorld[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const rail = railPath(worlds.map((w) => ({ x: (w.mapX / 100) * VIEW_W, y: (w.mapY / 100) * VIEW_H })));

  return (
    <MotionConfig reducedMotion="user">
      {/* Wide screens: the map. */}
      <div className="glass relative hidden aspect-video overflow-hidden rounded-3xl md:block">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path id="rail" d={rail} fill="none" stroke="var(--color-line)" strokeWidth="0.35" strokeDasharray="0.8 0.8" />
          <motion.path
            d={rail}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="0.2"
            strokeOpacity="0.7"
            filter="url(#glow)"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* The Express, riding the rail. */}
          {!reduceMotion && (
            <circle r="0.7" fill="var(--color-gold-strong)" filter="url(#glow)">
              <animateMotion dur="16s" repeatCount="indefinite" rotate="auto">
                <mpath href="#rail" />
              </animateMotion>
            </circle>
          )}
        </svg>

        <ol>
          {worlds.map((w, i) => (
            <motion.li
              key={w.slug}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${w.mapX}%`, top: `${w.mapY}%` }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/worlds/${w.slug}`} style={colorVar(w.color)} className="group flex flex-col items-center text-center">
                <Planet />
                {/* Backed so the rail never runs through the text. */}
                <span className="mt-3 flex flex-col items-center rounded-lg bg-surface-solid/85 px-2.5 py-1 backdrop-blur-sm">
                  <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-[var(--c)] uppercase">
                    {stopLabel(w.arcOrder)}
                  </span>
                  <span className="font-display text-sm font-bold whitespace-nowrap lg:text-base">{w.name}</span>
                  <span className="hidden max-w-40 text-xs text-muted group-hover:block group-focus-visible:block">
                    {w.tagline}
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Narrow screens: the same journey as a vertical line. */}
      <ol className="relative flex flex-col gap-6 border-l border-dashed border-line pl-8 md:hidden">
        {worlds.map((w) => (
          <li key={w.slug} style={colorVar(w.color)} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-1.5 -left-[calc(2.5rem+0.5px)] size-4 rounded-full bg-[var(--c)] shadow-[0_0_14px_var(--c)]"
            />
            <Link href={`/worlds/${w.slug}`} className="block">
              <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-[var(--c)] uppercase">
                {stopLabel(w.arcOrder)} · v{w.releaseVersion}
              </span>
              <span className="block font-display text-lg font-bold">{w.name}</span>
              <span className="block text-sm text-muted">{w.tagline}</span>
            </Link>
          </li>
        ))}
      </ol>
    </MotionConfig>
  );
}

/** A glowing planet in the world's color, with an orbit ring that spins on hover. */
export function Planet({ size = "size-12 lg:size-14" }: { size?: string }) {
  return (
    <span aria-hidden="true" className={`relative grid place-items-center ${size}`}>
      <span className="absolute inset-[-35%] rounded-full border border-[color-mix(in_srgb,var(--c)_40%,transparent)] transition-transform duration-700 ease-out-expo [transform:rotateX(70deg)] group-hover:[transform:rotateX(70deg)_rotateZ(180deg)_scale(1.1)]" />
      <span className="size-full rounded-full bg-[radial-gradient(circle_at_30%_30%,white,var(--c)_35%,color-mix(in_srgb,var(--c)_30%,black)_100%)] shadow-[0_0_24px_var(--c)] transition-transform duration-500 ease-out-expo group-hover:scale-110" />
    </span>
  );
}
