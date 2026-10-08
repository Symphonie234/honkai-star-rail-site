import { Fragment, type ReactNode } from "react";

/** "<i>…</i>" segments in a line → <em>; everything else stays text. */
function inline(line: string): ReactNode[] {
  return line.split(/(<i>[\s\S]*?<\/i>)/g).map((part, i) =>
    part.startsWith("<i>") ? <em key={i}>{part.slice(3, -4)}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

/**
 * Text as the game lays it out: stanzas separated by blank lines, line breaks within
 * them, and italics for quoted or spoken lines ("<i>…</i>" in the imported text).
 */
export function GameText({ text, className = "", paragraphClassName = "" }: { text: string; className?: string; paragraphClassName?: string }) {
  const stanzas = text.split(/\n\s*\n/).filter((s) => s.trim());
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {stanzas.map((stanza, i) => (
        <p key={i} className={paragraphClassName}>
          {stanza.split("\n").map((line, k) => (
            <Fragment key={k}>
              {k > 0 && <br />}
              {inline(line)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
