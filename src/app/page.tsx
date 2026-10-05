import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-4rem)] w-[min(100%-2rem,1200px)] flex-col justify-center py-24">
      <p className="eyebrow">May this journey lead us starward</p>
      <h1 className="mt-4 font-display text-5xl leading-tight font-bold sm:text-7xl">
        Honkai <span className="block text-gold">Star Rail</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Board the Astral Express and follow the Trailblaze across the cosmos — the travelers, the Paths
        they walk, and the worlds between the stars.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/characters"
          className="rounded-full bg-gold px-6 py-3 font-semibold text-gold-ink shadow-[0_0_24px_rgb(232_196_106/0.35)] transition hover:bg-gold-strong"
        >
          Open the Character Archive
        </Link>
      </div>
    </section>
  );
}
