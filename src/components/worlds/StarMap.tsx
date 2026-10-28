"use client";

import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import { colorVar } from "@/lib/theme";
import { isAvailable } from "@/lib/spoilers";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useStoryProgress } from "../spoilers/story-progress";
import { StarMapBackdrop } from "./StarMapBackdrop";
import { WorldArt } from "./WorldArt";

export type MapWorld = {
  slug: string;
  name: string;
  tagline: string;
  color: string;
  releaseVersion: string;
  arcOrder: number;
  mapX: number;
  mapY: number;
  image: string | null;
};

const VIEW_W = 100;
const VIEW_H = 56.25;

type Point = { x: number; y: number };

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

function ExpressTrain() {
  const body = "#1d2350";
  const trim = "var(--color-gold)";
  const lit = "var(--color-gold-strong)";
  return (
    <g transform="translate(0 -0.75) scale(0.62)">
      <defs>
        <linearGradient id="express-beam" x1="0" x2="1">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 3 -0.2 L 7 -1.3 L 7 0.9 Z" fill="url(#express-beam)" />
      <rect x="-7" y="-1.2" width="3.9" height="1.75" rx="0.4" fill={body} stroke={trim} strokeWidth="0.12" />
      {[-6.4, -5.4, -4.4].map((x) => (
        <rect key={x} x={x} y="-0.85" width="0.6" height="0.55" rx="0.1" fill={lit} />
      ))}
      <rect x="-3.15" y="-0.15" width="0.5" height="0.22" fill={trim} />
      <rect x="-2.7" y="-1.65" width="1.9" height="2.2" rx="0.35" fill={body} stroke={trim} strokeWidth="0.12" />
      <rect x="-2.3" y="-1.3" width="0.9" height="0.6" rx="0.1" fill={lit} />
      <rect x="-0.95" y="-1" width="3.4" height="1.55" rx="0.75" fill={body} stroke={trim} strokeWidth="0.12" />
      <rect x="0.5" y="-1.85" width="0.55" height="0.95" rx="0.12" fill={body} stroke={trim} strokeWidth="0.1" />
      <circle cx="2.45" cy="-0.22" r="0.82" fill="#0b0f24" stroke={trim} strokeWidth="0.2" />
      <circle cx="2.45" cy="-0.22" r="0.34" fill="#fff6d6" />
      {[-6.2, -3.9, -2.1, -0.2, 1.6].map((x) => (
        <circle key={x} cx={x} cy="0.72" r="0.36" fill="#0b0f24" stroke={trim} strokeWidth="0.1" />
      ))}
    </g>
  );
}

export function StarMap({ worlds: allWorlds }: { worlds: MapWorld[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const progress = useStoryProgress();
  const worlds = allWorlds.filter((w) => isAvailable(w.releaseVersion, progress));
  const rail = railPath(worlds.map((w) => ({ x: (w.mapX / 100) * VIEW_W, y: (w.mapY / 100) * VIEW_H })));

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative hidden aspect-video overflow-hidden rounded-3xl border border-line shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] md:block">
        <StarMapBackdrop worlds={worlds} />
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
          {!reduceMotion && (
            <g>
              <ExpressTrain />
              <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
                <mpath href="#rail" />
              </animateMotion>
            </g>
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
                <WorldArt image={w.image} size="h-20 w-28 lg:h-24 lg:w-36" sizes="144px" priority />
                <span className="mt-2 flex flex-col items-center rounded-lg bg-surface-solid/85 px-2.5 py-1 backdrop-blur-sm">
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

      <ol className="relative ml-6 flex flex-col gap-8 border-l border-dashed border-line pl-12 md:hidden">
        {worlds.map((w) => (
          <li key={w.slug} style={colorVar(w.color)} className="relative">
            <span className="absolute top-0 -left-[calc(4.5rem+0.5px)]">
              <WorldArt image={w.image} size="size-12" sizes="48px" />
            </span>
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

