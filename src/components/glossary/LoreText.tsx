import { splitLore } from "@/lib/glossary";
import { getGlossary } from "@/lib/queries";
import { Term } from "./Term";

/** Renders lore text with glossary terms turned into hover definitions. */
export async function LoreText({ text, exclude }: { text: string; exclude?: string }) {
  const parts = splitLore(text, await getGlossary(), exclude);
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <Term key={i} term={part.term.term} definition={part.term.definition} spoilerVersion={part.term.spoilerVersion}>
            {part.text}
          </Term>
        ),
      )}
    </>
  );
}
