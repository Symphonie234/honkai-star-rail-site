import Link from "next/link";
import type { ReactNode } from "react";
import { CURRENCY_WARS } from "@/db/seed-data";

const TABS = [
  { href: "/currency-wars", label: "Overview" },
  { href: "/currency-wars/planner", label: "Team planner" },
  { href: "/currency-wars/units", label: "Units" },
  { href: "/currency-wars/bonds", label: "Bonds" },
  { href: "/currency-wars/equipment", label: "Equipment" },
  { href: "/currency-wars/investments", label: "Investments" },
  { href: "/currency-wars/opponents", label: "Opponents" },
];

export default function CurrencyWarsLayout({ children }: { children: ReactNode }) {
  const p = CURRENCY_WARS.period;
  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-8">
        <p className="eyebrow">Cosmic Strife · Period: {p.name} ({p.versions})</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Currency Wars</h1>
        <nav aria-label="Currency Wars" className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-sm whitespace-nowrap">
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
