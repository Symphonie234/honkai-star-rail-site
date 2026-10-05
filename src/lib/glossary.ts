import type { GlossaryTerm } from "./queries";

export type LorePart = string | { term: GlossaryTerm; text: string };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Splits `text` into plain strings and glossary-term matches. Each term is linked
 * only on its first appearance, so a paragraph doesn't fill up with underlines.
 * `exclude` skips a term (e.g. on that term's own glossary entry).
 */
export function splitLore(text: string, terms: GlossaryTerm[], exclude?: string): LorePart[] {
  const byName = new Map<string, GlossaryTerm>();
  for (const t of terms) {
    if (t.slug === exclude) continue;
    for (const name of [t.term, ...t.aliases]) byName.set(name.toLowerCase(), t);
  }
  if (byName.size === 0) return [text];

  // Longest names first, so "Stellaron Hunters" wins over "Stellaron". Allows a plural "s".
  const names = [...byName.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const pattern = new RegExp(`\\b(${names.join("|")})(s?)\\b`, "gi");

  const parts: LorePart[] = [];
  const linked = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const term = byName.get(m[1].toLowerCase())!;
    if (linked.has(term.slug)) continue;
    linked.add(term.slug);
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ term, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
