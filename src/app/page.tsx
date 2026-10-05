import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { StarMap } from "@/components/worlds/StarMap";
import { getWorlds } from "@/lib/queries";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const worlds = await getWorlds();

  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          alternateName: SITE_TAGLINE,
          url: SITE_URL,
          inLanguage: "en",
          about: { "@type": "VideoGame", name: "Honkai: Star Rail", publisher: { "@type": "Organization", name: "HoYoverse" } },
        }}
      />
      <section className="pt-20 pb-14 sm:pt-28">
        <p className="eyebrow">May this journey lead us starward</p>
        <h1 className="mt-4 font-display text-5xl leading-tight font-bold sm:text-7xl">
          Honkai <span className="text-gold">Star Rail</span>
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
          <Link
            href="/worlds"
            className="rounded-full border border-line px-6 py-3 font-semibold transition hover:border-gold hover:text-gold"
          >
            Explore the Worlds
          </Link>
        </div>
      </section>

      <section aria-labelledby="map-title" className="pb-24">
        <p className="eyebrow">Next stop</p>
        <h2 id="map-title" className="mt-3 mb-8 font-display text-3xl font-bold sm:text-4xl">The Trailblaze so far</h2>
        <StarMap worlds={worlds} />
      </section>
    </div>
  );
}
