import Link from "next/link";
import type { ReactNode } from "react";

const TABS = [
  { href: "/simulated-universe", label: "Overview" },
  { href: "/simulated-universe/blessings", label: "Blessings" },
  { href: "/simulated-universe/curios", label: "Curios" },
  { href: "/simulated-universe/occurrences", label: "Occurrences" },
];

export default function SimulatedUniverseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-8">
        <p className="eyebrow">Herta&apos;s simulation</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Simulated Universe</h1>
        <nav aria-label="Simulated Universe" className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 text-sm whitespace-nowrap">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full border border-line px-4 py-1.5 text-muted transition hover:border-gold hover:text-ink">
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
