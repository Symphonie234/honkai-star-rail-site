"use client";

import { useState, type ReactNode } from "react";
import { ArtViewer } from "../characters/ArtViewer";
import { ExpandIcon } from "../icons";

export function ZoomableImage({
  src, title, caption, children, className = "",
}: {
  src: string;
  title: string;
  caption: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${title} full screen`}
        className={`group relative block w-full cursor-zoom-in text-left ${className}`}
      >
        {children}
        <span className="glass pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold opacity-80 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExpandIcon /> Zoom
        </span>
      </button>
      {open && <ArtViewer src={src} title={title} caption={caption} onClose={() => setOpen(false)} />}
    </>
  );
}
