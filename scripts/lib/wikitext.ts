export function findTemplate(text: string, name: string): string | null {
  const re = new RegExp(`\\{\\{\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[|}\\n]`, "i");
  const m = re.exec(text);
  if (!m) return null;
  let depth = 0;
  for (let i = m.index; i < text.length - 1; i++) {
    if (text[i] === "{" && text[i + 1] === "{") { depth++; i++; }
    else if (text[i] === "}" && text[i + 1] === "}") {
      depth--; i++;
      if (depth === 0) return text.slice(m.index, i + 1);
    }
  }
  return null;
}

function splitTop(body: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === "{{" || two === "[[") { depth++; i++; continue; }
    if (two === "}}" || two === "]]") { depth--; i++; continue; }
    if (body[i] === "|" && depth === 0) { parts.push(body.slice(start, i)); start = i + 1; }
  }
  parts.push(body.slice(start));
  return parts;
}

export function templateParams(template: string): Record<string, string> {
  const body = template.slice(2, -2);
  const [, ...parts] = splitTop(body);
  const params: Record<string, string> = {};
  let n = 0;
  for (const part of parts) {
    const eq = part.indexOf("=");
    const brace = part.search(/\{\{|\[\[/);
    if (eq > 0 && (brace < 0 || eq < brace)) params[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
    else params[String(++n)] = part.trim();
  }
  return params;
}

export const description = (text: string) => {
  const t = findTemplate(text, "Description");
  return t ? cleanWiki(templateParams(t)["1"] ?? "") : "";
};

export function changeHistoryVersion(text: string): string | null {
  const t = findTemplate(text, "Change History");
  if (!t) return null;
  const p = templateParams(t);
  const v = p.introduced ?? p["1"];
  return v && /^\d+\.\d+$/.test(v.trim()) ? v.trim() : null;
}

export const links = (text: string) =>
  [...text.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g)].map((m) => ({ target: m[1].trim(), label: (m[2] ?? m[1]).trim() }));

const TEXT_TEMPLATES = /\{\{\s*(?:Mission|Domain|Item|Character|Color|Enemy|Term|Icon Text|tx|Rubi|w|zh|ja|Lang|Extra Effect|Keyword|Status|Effect|sic)\s*\|/i;

export function cleanWiki(input: string): string {
  let s = input
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    // Stat icons: dropped when the stat's name follows, otherwise they stand in for it.
    .replace(/((?:\{\{Icon\|[^{}|]+(?:\|[^{}]*)?\}\})+)(?=\s*([^{]{0,12}))/g, (run: string, _a: string, after: string) => {
      const names = [...run.matchAll(/\{\{Icon\|([^{}|]+)/g)].map((m) => m[1].trim().replace(/^CW /, ""));
      const repeated = names.some((n) => after.toLowerCase().startsWith(n.split(/[\s-]/)[0].toLowerCase()));
      return repeated ? "" : names.join("/");
    });
  for (let guard = 0; guard < 20 && /\{\{/.test(s); guard++) {
    s = s.replace(/\{\{([^{}]*)\}\}/g, (whole, inner: string) => {
      const parts = inner.split("|").map((p) => p.trim());
      const name = parts[0].toLowerCase();
      if (TEXT_TEMPLATES.test(whole)) {
        const args = parts.slice(name === "color" ? 2 : 1).filter((p) => !p.includes("="));
        return args[0] ?? "";
      }
      if (name === "!") return "|";
      return "";
    });
  }
  s = s
    .replace(/\[\[(?:File|Image):[^\]]*\]\]/gi, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[https?:\/\/\S+\s([^\]]+)\]/g, "$1")
    .replace(/'''(.+?)'''/g, "$1")
    .replace(/''(.+?)''/g, "<i>$1</i>")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/<(?!\/?i>)[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

export const cleanGameText = (text: string) =>
  text
    .replace(/\\n/g, "\n")
    .replace(/<\/?(?:color|unbreak|u|b|align|size)[^>]*>/g, "")
    .replace(/\{NICKNAME\}/g, "Trailblazer")
    .replace(/\{M#([^}]*)\}\{F#([^}]*)\}/g, "$1/$2")
    .replace(/\{F#([^}]*)\}\{M#([^}]*)\}/g, "$2/$1")
    .replace(/\{RUBY_B#[^}]*\}([^{]*)\{RUBY_E#\}/g, "$1")
    .replace(/\{LAYOUT_(?:MOBILE|CONTROLLER)#[^}]*\}/g, "")
    .replace(/\{LAYOUT_KEYBOARD#([^}]*)\}/g, "$1")
    .trim();
