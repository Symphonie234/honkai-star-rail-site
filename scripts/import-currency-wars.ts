/*
 * Imports the current Currency Wars period from the Honkai: Star Rail Wiki into
 * src/db/data/game/currency-wars.json: units, Bonds, equipment, Investment
 * Environments and Strategies, opponents, affixes and shop odds.
 *
 *   npm run data:cw
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  cwSlug, type CwBond, type CwData, type CwEquipment, type CwInvestment, type CwOpponent, type CwUnit,
} from "../src/lib/currency-wars";
import { cleanWiki, findTemplate, templateParams } from "./lib/wikitext";

const PERIOD = { name: "Zero-Sum Game", start: "2025-11-05", end: "2026-11-11", versions: "3.7 – 4.6" };
const BASE = `Currency Wars: ${PERIOD.name}`;
const API = "https://honkai-star-rail.fandom.com/api.php";
const HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36" };

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function wiki(params: Record<string, string>): Promise<Raw> {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(90_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i >= 5) throw err;
      await new Promise((r) => setTimeout(r, 10_000 * i));
    }
  }
}

async function pages(titles: string[]) {
  const out = new Map<string, string>();
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const data = await wiki({ action: "query", titles: batch.join("|"), prop: "revisions", rvprop: "content", rvslots: "main", redirects: "1" });
    const alias = new Map<string, string>();
    for (const n of [...(data.query.normalized ?? []), ...(data.query.redirects ?? [])]) alias.set(n.from, n.to);
    const byTitle = new Map<string, Raw>((Object.values(data.query.pages) as Raw[]).map((p) => [p.title, p]));
    for (const t of batch) {
      let k = t;
      for (let j = 0; j < 3 && alias.has(k); j++) k = alias.get(k)!;
      const text = byTitle.get(k)?.revisions?.[0]?.slots?.main?.["*"];
      if (text) out.set(t, text);
    }
  }
  return out;
}

function section(text: string, heading: string) {
  const m = new RegExp(`^(=+)\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\1\\s*$`, "m").exec(text);
  if (!m) return "";
  const rest = text.slice(m.index + m[0].length);
  const next = new RegExp(`^={1,${m[1].length}}[^=]`, "m").exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

/** Rows of every wikitable in `text`, as cell text (header rows skipped). */
function tableRows(text: string): string[][] {
  const rows: string[][] = [];
  for (const table of text.match(/\{\|[\s\S]*?\n\|\}/g) ?? []) {
    for (const chunk of table.split(/\n\|-[^\n]*/).slice(1)) {
      const cells: string[] = [];
      let header = false;
      for (const line of chunk.split("\n")) {
        if (line.startsWith("|}")) break;
        if (line.startsWith("!")) { header = true; continue; }
        if (line.startsWith("|")) cells.push(...splitCells(line.slice(1)));
        else if (cells.length) cells[cells.length - 1] += `\n${line}`;
      }
      if (!header && cells.length) rows.push(cells.map((c) => c.trim()));
    }
  }
  return rows;
}

/** "a || b" on one line → cells, ignoring "||" inside templates and links. */
function splitCells(line: string) {
  const cells: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < line.length; i++) {
    const two = line.slice(i, i + 2);
    if (two === "{{" || two === "[[") { depth++; i++; } else if (two === "}}" || two === "]]") { depth--; i++; } else if (two === "||" && depth === 0) {
      cells.push(line.slice(start, i));
      start = i + 2;
      i++;
    }
  }
  cells.push(line.slice(start));
  return cells;
}

const afterBreak = (cell: string) => cleanWiki(cell.split(/<br\s*\/?>/i).at(-1) ?? cell).trim();
const fileIn = (cell: string) => /File:([^|\]]+\.(?:png|webp|jpg))/i.exec(cell)?.[1] ?? /Icon\/Dark\|([^|}]+\.png)/i.exec(cell)?.[1] ?? null;
const cardList = (cell: string) => {
  const t = findTemplate(cell, "Card List") ?? findTemplate(cell, "Card");
  if (!t) return [];
  const p = templateParams(t);
  return (p["1"] ?? "").split(p.delim ? p.delim : /[;,]/).map((s) => cleanWiki(s).trim()).filter(Boolean);
};
const text = (s: string) => cleanWiki(s).replace(/\n{2,}/g, "\n").trim();

async function main() {
  const top = await pages([BASE, `${BASE}/Characters`, `${BASE}/Bonds`, `${BASE}/Equipment`, `${BASE}/Investment Environment`, `${BASE}/Investment Strategy`, `${BASE}/Opponent`]);
  const page = (sub: string) => top.get(sub ? `${BASE}/${sub}` : BASE) ?? "";

  const oddsTable = /\{\|[^\n]*\n\|\+ Shop Odds[\s\S]*?\n\|\}/.exec(page(""))?.[0] ?? "";
  const shopOdds = tableRows(oddsTable).map((r) => ({ level: Number(r[0]), odds: r.slice(1, 6).map((c) => Number(c.replace(/[^\d.]/g, "")) || 0) }))
    .filter((r) => r.level);

  const roster = new Map<string, { costs: number[]; advisor: boolean }>();
  const chars = page("Characters");
  for (const [heading, cost] of [["5-Cost", 5], ["4-Cost", 4], ["3-Cost", 3], ["2-Cost", 2], ["1-Cost", 1], ["Expert Advisor", 0]] as const) {
    for (const name of cardList(section(chars, heading))) {
      const r = roster.get(name) ?? { costs: [], advisor: false };
      if (cost) r.costs.push(cost); else r.advisor = true;
      roster.set(name, r);
    }
  }
  const unitPages = await pages([...roster.keys()].map((n) => `${n} (Currency Wars)`));
  const units: CwUnit[] = [];
  for (const [name, r] of roster) {
    const t = unitPages.get(`${name} (Currency Wars)`);
    if (!t) { console.warn(`  no page for ${name}`); continue; }
    const info = templateParams(findTemplate(t, "Currency Wars Character Infobox") ?? "{{x}}");
    const details = templateParams(findTemplate(t, "Currency Wars Character Details") ?? "{{x}}");
    const eid = templateParams(findTemplate(t, "Currency Wars Character Eidolons") ?? "{{x}}");
    const lc = templateParams(findTemplate(t, "Currency Wars Character Light Cone") ?? "{{x}}");
    const equip = templateParams(findTemplate(t, "Currency Wars Character Equipment") ?? "{{x}}");
    const list = (prefix: string) => Object.entries(info).filter(([k]) => new RegExp(`^${prefix}\\d+$`).test(k)).map(([, v]) => cleanWiki(v)).filter(Boolean);
    const field = cleanWiki(info.field ?? "").replace(/\s+/g, " ");
    units.push({
      slug: cwSlug(name), name, costs: r.costs.length ? [...new Set(r.costs)].sort() : [Number(info.cost) || 0], advisor: r.advisor && !r.costs.length,
      field: /on.*off|off.*on/i.test(field) ? "On/Off Field" : /off/i.test(field) ? "Off Field" : "On Field",
      roles: list("role"), bonds: list("bond"),
      // Some pages repeat the table with values left blank; the first one is complete.
      abilities: tableRows(section(t, "Abilities").match(/\{\|[\s\S]*?\n\|\}/)?.[0] ?? "")
        .filter((c) => c.length >= 3)
        .map((c) => ({ name: afterBreak(c[0]), type: text(c[1]), desc: text(c[2]) })),
      stars: [1, 2, 3, 4].filter((n) => details[`hp${n}`] !== undefined).map((n) => ({
        hp: cleanWiki(details[`hp${n}`] ?? ""), onField: cleanWiki(details[`on_field${n}`] ?? ""), offField: cleanWiki(details[`off_field${n}`] ?? ""), spd: cleanWiki(details[`spd${n}`] ?? ""),
      })),
      eidolons: [1, 2, 3, 4, 5, 6].filter((n) => eid[`eidolon${n}`]).map((n) => ({ name: cleanWiki(eid[`eidolon${n}`]), desc: text(eid[`eidolon${n}_desc`] ?? "") })),
      lightCone: lc.name ? { name: cleanWiki(lc.name), desc: text(lc.desc ?? "") } : null,
      equipment: Object.entries(equip).filter(([k]) => /^equipment ?\d+$/.test(k)).map(([, v]) => cleanWiki(v)).filter(Boolean),
      notes: section(t, "Gameplay Notes").split("\n").filter((l) => l.startsWith("*")).map((l) => text(l.replace(/^\*+\s*/, ""))).filter(Boolean),
      image: info.image ? cleanWiki(info.image).trim() : null,
    });
  }

  const bondsText = page("Bonds");
  const kindAt = (pos: number): CwBond["kind"] => {
    const school = bondsText.indexOf("==School Bonds==");
    const unique = bondsText.indexOf("==Unique Bonds==");
    return unique >= 0 && pos > unique ? "Unique" : school >= 0 && pos > school ? "School" : "Faction";
  };
  const bonds: CwBond[] = [];
  for (const m of bondsText.matchAll(/\{\{Bond Information/g)) {
    const tpl = findTemplate(bondsText.slice(m.index), "Bond Information");
    if (!tpl) continue;
    const p = templateParams(tpl);
    const name = cleanWiki(p.name ?? "");
    if (!name || bonds.some((b) => b.name === name)) continue;
    bonds.push({
      slug: cwSlug(name), name, kind: kindAt(m.index),
      members: (p.members ?? "").split(",").map((s) => cleanWiki(s).trim()).filter(Boolean),
      effect: text(p.effect ?? ""),
      tiers: Object.entries(p).filter(([k]) => /^effect\d+$/.test(k)).map(([k, v]) => ({ count: Number(k.slice(6)), effect: text(v) })).sort((a, b) => a.count - b.count),
      notes: text(p.notes ?? ""),
    });
  }

  const eq = page("Equipment");
  const equipment: CwEquipment[] = [];
  const addEquipment = (category: string, sectionText: string) => {
    for (const c of tableRows(sectionText)) {
      const name = afterBreak(c[0]);
      if (!name || equipment.some((e) => e.name === name)) continue;
      const advanced = c.length >= 6;
      equipment.push({
        slug: cwSlug(name), name, category,
        tags: (c[1] ?? "").split(/<br\s*\/?>/i).map((s) => cleanWiki(s).trim()).filter(Boolean),
        stats: text(advanced || c.length === 3 ? c[2] ?? "" : ""),
        effect: text(advanced ? c[3] ?? "" : c.length === 4 ? c[2] ?? "" : ""),
        users: advanced ? cardList(c[4] ?? "") : [],
        recipe: [...(c[advanced ? 5 : 3] ?? "").matchAll(/File:Equipment ([^|\]]+)\.png/g)].map((x) => x[1]).slice(0, 2),
        image: fileIn(c[0]),
      });
    }
  };
  addEquipment("Basic", section(eq, "Basic Equipment"));
  addEquipment("Advanced", section(eq, "Advanced/Privilege Equipment"));
  for (const sub of ["Diamond & Treasure Gem", "Trash Bag", "Emblem", "Bond Equipment", "Hacking Component", "Destiny Component", "Other", "Privileged Equipment"]) {
    addEquipment(sub === "Privileged Equipment" ? "Privileged" : sub, section(eq, sub));
  }

  const investments = (sub: string, withRarity: boolean): CwInvestment[] => {
    const t = page(sub);
    const out: CwInvestment[] = [];
    const sections = withRarity ? ["Prismatic", "Golden", "Silver"] : [""];
    for (const rarity of sections) {
      for (const c of tableRows(rarity ? section(t, rarity) : t)) {
        const name = afterBreak(c[0]);
        if (!name || out.some((o) => o.name === name)) continue;
        out.push({ name, effect: text(c[1] ?? ""), rarity: rarity || null, planes: c[2] ? text(c[2]) : null, image: fileIn(c[0]) });
      }
    }
    return out;
  };

  const opp = page("Opponent");
  const opponents: CwOpponent[] = tableRows(section(opp, "Bosses"))
    .filter((c) => c.length >= 4)
    .map((c) => ({ name: text(c[0]), boss: cardList(c[1])[0] ?? text(c[1]), elites: cardList(c[2]), normals: cardList(c[3]) }))
    .filter((o) => o.name && o.boss);
  const affixes = tableRows(section(opp, "Affixes")).filter((c) => c.length >= 2).map((c) => ({ name: text(c[0]), effect: text(c[1]) }));

  const data: CwData = {
    period: PERIOD, shopOdds, units, bonds, equipment,
    environments: investments("Investment Environment", false), strategies: investments("Investment Strategy", true), opponents, affixes,
  };
  const OUT = path.join("src", "db", "data", "game");
  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, "currency-wars.json"), JSON.stringify({ source: "https://honkai-star-rail.fandom.com/ (CC BY-SA)", importedAt: new Date().toISOString().slice(0, 10), ...data }, null, 1) + "\n");
  console.log(
    `Imported ${units.length} units, ${bonds.length} Bonds, ${equipment.length} equipment, ${data.environments.length} environments, ` +
      `${data.strategies.length} strategies, ${opponents.length} opponents, ${affixes.length} affixes, ${shopOdds.length} shop-odds levels.`,
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
