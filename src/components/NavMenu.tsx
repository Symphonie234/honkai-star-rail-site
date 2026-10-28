"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";

export type NavLink = { href: string; label: string; blurb: string };

export function NavMenu({ label, links }: { label: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const pathname = usePathname();
  const active = links.some((l) => pathname === l.href || pathname.startsWith(`${l.href}/`));
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-full px-3 py-2 transition-colors hover:text-ink ${active ? "text-ink" : ""}`}
      >
        {label}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}><ChevronDownIcon /></span>
      </button>
      {open && (
        <ul id={id} className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-line bg-surface-solid p-2 shadow-[0_20px_50px_rgb(0_0_0/0.5)]">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined}
                className="block rounded-xl px-3 py-2 transition-colors hover:bg-gold/10 aria-[current=page]:bg-gold/15">
                <span className="block font-semibold text-ink">{l.label}</span>
                <span className="block text-xs text-muted">{l.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
