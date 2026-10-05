import Link from "next/link";

const links = [
  { href: "/characters", label: "Characters" },
  { href: "/worlds", label: "Worlds" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-space/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-[min(100%-2rem,1200px)] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-wide">
          <span aria-hidden="true" className="text-gold">✦</span>
          Astral Express
        </Link>
        <nav aria-label="Primary" className="flex gap-6 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
