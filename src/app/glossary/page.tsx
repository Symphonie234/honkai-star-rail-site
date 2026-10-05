import type { Metadata } from "next";
import { LoreText } from "@/components/glossary/LoreText";
import { Spoiler } from "@/components/Spoiler";
import { getGlossary } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Stellarons, Aeons, Paths and the rest of the cosmos's vocabulary, explained.",
};

export default async function GlossaryPage() {
  const terms = await getGlossary();

  // Group alphabetically, ignoring a leading "the".
  const sortKey = (t: string) => t.replace(/^the\s+/i, "");
  const sorted = [...terms].sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
  const groups = Map.groupBy(sorted, (t) => sortKey(t.term)[0].toUpperCase());

  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-12">
        <p className="eyebrow">Express Archive</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Glossary</h1>
        <p className="mt-4 max-w-2xl text-muted">
          The words the cosmos runs on. Underlined terms anywhere on the site show these definitions on hover or tap.
        </p>
      </header>

      <div className="flex flex-col gap-12">
        {[...groups].map(([letter, group]) => (
          <section key={letter} aria-labelledby={`letter-${letter}`}>
            <h2 id={`letter-${letter}`} className="font-display text-3xl font-bold text-gold">{letter}</h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              {group.map((t) => {
                const entry = (
                  <div id={t.slug} className="glass h-full scroll-mt-24 rounded-2xl p-6">
                    <dt className="font-display text-xl font-bold">{t.term}</dt>
                    {t.aliases.length > 0 && (
                      <dd className="mt-1 text-xs tracking-wide text-muted uppercase">Also: {t.aliases.join(", ")}</dd>
                    )}
                    <dd className="mt-3 leading-relaxed text-muted">
                      <LoreText text={t.definition} exclude={t.slug} />
                    </dd>
                  </div>
                );
                return t.spoilerVersion ? (
                  <Spoiler key={t.slug} version={t.spoilerVersion} block>{entry}</Spoiler>
                ) : (
                  <div key={t.slug}>{entry}</div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
