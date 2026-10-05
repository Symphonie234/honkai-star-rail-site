import type { Metadata } from "next";
import Image from "next/image";
import { AeonWeb } from "@/components/aeons/AeonWeb";
import { LoreText } from "@/components/glossary/LoreText";
import { pathIcon } from "@/lib/images";
import { getAeonWeb } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Aeons & Paths",
  description: "How the Aeons, their Paths, the factions that serve them and the travelers who walk them connect.",
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
        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.aeons.map((a) => {
            const devoted = data.factions.filter((f) => f.aeonSlug === a.slug);
            return (
              <li key={a.slug} id={a.slug} className="glass scroll-mt-24 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/50 bg-surface-solid">
                    {a.pathSlug ? (
                      <Image src={pathIcon(a.pathSlug)} alt="" width={30} height={30} />
                    ) : (
                      <span aria-hidden="true" className="text-xl text-gold">{a.glyph}</span>
                    )}
                  </span>
                  <span>
                    <span className="block font-display text-xl font-bold">{a.name}</span>
                    <span className="block text-xs tracking-widest text-gold uppercase">Aeon of {a.concept}</span>
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted"><LoreText text={a.description} /></p>
                {devoted.length > 0 && (
                  <p className="mt-3 text-xs text-muted">
                    Devoted: <span className="text-cyan">{devoted.map((f) => f.name).join(", ")}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
