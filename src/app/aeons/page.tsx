import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AeonWeb } from "@/components/aeons/AeonWeb";
import { pathIcon } from "@/lib/images";
import { getAeonWeb } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Aeons & Paths",
  description:
    "The Aeons of Honkai: Star Rail — Nanook, Lan, Nous, Xipe, IX, Qlipoth, Yaoshi, Fuli, Aha, Akivili and more: their lore, Paths, followers and the characters who walk them.",
  alternates: { canonical: "/aeons" },
};

export default async function AeonsPage() {
  const data = await getAeonWeb();

  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">The Aeons&apos; footsteps</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Aeons &amp; Paths</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Every Path begins with an Aeon. Trace who walks which Path, which factions serve which god, and how the
          travelers of the Trailblaze are bound together.
        </p>
      </header>

      <AeonWeb data={data} />

      <section className="mt-20" aria-labelledby="aeons-list">
        <h2 id="aeons-list" className="font-display text-3xl font-bold">The Aeons</h2>
        <p className="mt-2 text-muted">Open any Aeon for their full lore, followers and the travelers who walk their Path.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.aeons.map((a) => {
            const devoted = data.factions.filter((f) => f.aeonSlug === a.slug);
            return (
              <li key={a.slug}>
                <Link
                  href={`/aeons/${a.slug}`}
                  className="glass group flex h-full gap-4 rounded-2xl p-5 transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-gold"
                >
                  <span className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-solid">
                    {a.image ? (
                      <Image src={a.image} alt="" fill sizes="96px" className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-110" />
                    ) : a.pathSlug ? (
                      <Image src={pathIcon(a.pathSlug)} alt="" width={40} height={40} />
                    ) : (
                      <span aria-hidden="true" className="text-3xl text-gold">{a.glyph}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-xl font-bold group-hover:text-gold">{a.name}</span>
                    <span className="block text-xs tracking-widest text-gold uppercase">Aeon of {a.concept}</span>
                    <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-muted">{a.description}</span>
                    {devoted.length > 0 && (
                      <span className="mt-2 block text-xs text-cyan">{devoted.map((f) => f.name).join(" · ")}</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
