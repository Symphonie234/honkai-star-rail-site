# Astral Express — Honkai: Star Rail Fan Archive

A fan-made, lore-first, spoiler-aware archive of Honkai: Star Rail through Version 4.6 (Planarcadia and Astropolis):
every playable character with full kits and Eidolons, every Light Cone, relic set, upgrade material and enemy, every
area of every world with its in-game map, the Aeons and their lore, and a version-by-version timeline — all searchable.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion · PostgreSQL + Drizzle ORM

## Getting started

Requires Node 20+ and Docker Desktop (for the local database).

```bash
npm install
cp .env.example .env     # local database + site URL
npm run db:up            # start Postgres on localhost:5433
npm run db:push          # create tables from src/db/schema.ts
npm run art:fetch        # download game art into public/art (~1 minute the first time)
npm run db:seed          # load content (after art:fetch, so Aeon art is linked)
npm run dev              # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build. Runs `art:fetch` first; needs the database (pages are pre-rendered from it) |
| `npm run db:up` | Start the local Postgres container |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | Upsert content and prune removed entries (safe to re-run) |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run art:fetch` | Download missing art and icons into `public/art` (`-- --force` re-fetches) |
| `npm run data:import` | Re-import character kits, Light Cones, relics and materials from game data into `src/db/data/game/` |
| `npm run data:extras` | Re-import achievements and Simulated / Divergent Universe content |
| `npm run data:cw` | Re-import the current Currency Wars period (units, Bonds, equipment, investments, opponents) |
| `npm run data:wiki` | Re-import world areas (with maps and their labelled points) and enemies from the HSR Wiki |
| `npm run typecheck` / `npm run lint` | Checks |

## What's in it

| Route | |
| --- | --- |
| `/` | Hero + animated star map (the Astral Express rides the rail) |
| `/characters`, `/characters/[slug]` | 93 characters: search, filter by type / Path / rarity, sort by release; full splash art viewer; full kits — skills with per-level values (including Elation and Assist Skills), Traces, Eidolons with their in-game card art, signature Light Cone, stats and upgrade materials |
| `/relics`, `/relics/[slug]` | 62 Cavern Relic and Planar Ornament sets: bonuses, every piece with its story; main-stat and sub-stat roll reference |
| `/materials`, `/materials/[slug]` | 207 upgrade materials: description and story, where to get them, synthesis recipe, and every character and Light Cone that needs them (with totals) |
| `/enemies`, `/enemies/[slug]` | 263 enemies: weaknesses, Toughness, resistances, skills, lore, zoomable art and the areas they appear in; story bosses stay spoiler-hidden |
| `/achievements`, `/achievements/[series]` | 1,950 achievements in 9 series with Stellar Jade rewards; hidden ones reveal on request |
| `/simulated-universe` (+ `/blessings`, `/curios`, `/occurrences`) | 682 Blessings by mode, Path and rarity; 238 Curios with lore; 403 Occurrences with art; domain types |
| `/currency-wars` (+ `/planner`, `/units`, `/bonds`, `/equipment`, `/investments`, `/opponents`) | Currency Wars: 72 units, 34 Bonds, equipment recipe chart, 334 Strategies and 83 Environments, 20 opponents, store odds, and a team planner with Bond tracking, unit recommendations and equipment plans. `/currency-wars/data.json` serves all of it as JSON |
| `/search`, Ctrl+K | Site-wide search across every section, filtered by story progress so spoilers never show up in results |
| `/light-cones`, `/light-cones/[slug]` | All 170 Light Cones: search by name or character, filter by Path / rarity; card art, passive at every Superimposition (S1–S5), stats by level, ascension materials, story text, signature characters and who can use it |
| `/worlds`, `/worlds/[slug]` | Seven world hubs with in-game art, every area, the main story arc by arc (42 chapters, 1.0–4.6), and their people |
| `/worlds/[slug]/[area]` | 90 areas: in-game art, description, unlock, connections, enemies, activities, collectibles, and the in-game map per floor — zoomable, with ~6,800 labelled points by category, many with an in-game view of the spot |
| `/aeons`, `/aeons/[slug]` | Interactive web of Aeons, factions and characters; a lore page per Aeon with official art |
| `/versions` | Every version 1.0–4.6: official title, release date, its story chapters and characters released |
| `/glossary` | Lore terms; underlined terms anywhere on the site show their definition |

**Story progress / time travel:** the header's picker (saved per browser) has three kinds of setting:

| Setting | Effect |
| --- | --- |
| Everything · spoilers hidden (default) | Everything is listed; spoiler-tagged facts, chapters, lore, splash art and faction ties are blurred |
| **View as of vX.Y** | The archive as it stood at that version: later characters, worlds (map stops), Aeons, factions, chapters, lore, versions and glossary terms disappear; spoilers up to it are revealed. A banner shows the version, with a way back |
| Everything · spoilers shown | Nothing hidden |

Every piece of content therefore carries the version it entered the game (`releaseVersion`, `introducedVersion`
or `version`) and, separately, a `spoilerVersion` for what it gives away. Pages wrap version-gated content in
`<AsOf>`; pages whose subject doesn't exist yet show a "not on the rails yet" notice.

## Project layout

```
src/
  app/                 routes (see above), plus sitemap.ts and robots.ts
  components/          UI (StarMap, WorldArt, AeonWeb, character cards & art viewer, Spoiler, glossary, JsonLd)
  db/
    schema.ts          tables: versions, paths, aeons, aeon_lore, elements, worlds, world_chapters, factions,
                       characters, character_kits, light_cones, materials, glossary_terms
    data/              the big content sets: characters.ts, story.ts (chapters), aeons.ts (with lore), versions.ts
      game/            generated: kits.json, light-cones.json, relics.json, materials.json (data:import);
                       areas.json, enemies.json (data:wiki)
    seed-data.ts       everything else (Paths, elements, worlds + chapters, factions, glossary)
    seed.ts            upserts the data and prunes rows that were removed or renamed
  lib/
    queries.ts         data access used by pages
    site.ts            site URL + structured-data helpers (SEO)
    spoilers.ts        version comparison + isRevealed()
    glossary.ts        finds glossary terms in lore text
    images.ts          art paths
    aeon-web.ts        radial layout for the Aeons web
    local-pref.ts      per-browser reader preferences (story progress, Trailblazer look)
scripts/fetch-art.ts   downloads and converts game art
scripts/import-game-data.ts  imports kits, Light Cones, relics and materials
scripts/import-wiki-data.ts  imports areas (maps, points) and enemies from the HSR Wiki
legacy/                the original static site, kept for reference
```

## Adding content

**A character** — add an entry to `src/db/data/characters.ts`, then `npm run art:fetch` and `npm run db:seed`.
- `art` is the in-game character ID; look it up in StarRailRes's
  [`index_new/en/characters.json`](https://github.com/Mar-7th/StarRailRes/blob/master/index_new/en/characters.json).
  For several looks, give labeled variants instead (see the Trailblazer — one Stelle/Caelus choice covers every form
  sharing those labels).
- `releaseVersion` must exist in `data/versions.ts` (add new versions there).
- Pick a spoiler-safe `factionSlug`. If the card itself reveals story, set `spoilerVersion` to the version of the reveal.
- Facts (rarity, element, Path, dates, Light Cone, voice actor) are checked against the
  [Honkai: Star Rail Wiki](https://honkai-star-rail.fandom.com/); bios are our own writing.

**Character kits and Light Cones** — generated, not hand-written. `npm run data:import` (scripts/import-game-data.ts)
reads StarRailRes's game data index and writes `data/game/kits.json` (every character in `data/characters.ts`),
`data/game/light-cones.json` and `data/game/materials.json` — committed, so builds don't need the network and each
patch's changes show up as a diff. From the HSR Wiki it adds what the game data lacks: each Light Cone's release
version (from the wiki's version pages) and each Eidolon's card art file (checked to exist). A character's signature
Light Cone is matched by the `lightCone` name in `data/characters.ts`; the import warns about any it can't find.

After a game update: add the version to `data/versions.ts` and new characters to `data/characters.ts`, then
`data:import`, review the diff, `art:fetch` for new art, `db:seed`. Characters that later received "Enhanced"
versions keep their original kit; the Enhanced variants are excluded on import.

**Areas, maps and enemies** — `npm run data:wiki` (scripts/import-wiki-data.ts) reads the HSR Wiki: each world's
area pages (description, region, connections, enemies, activities, collectibles) and its interactive maps (the map
image per floor and every marker, with category, label, description, rewards and in-game screenshot), plus every
enemy page (infobox, lore, resistances, skills). Areas that open later in a world's story, and story bosses, carry a
`spoilerVersion`. Text from the wiki is CC BY-SA.

In-game text (Light Cone and relic stories, material descriptions) comes from [Yatta](https://sr.yatta.moe), which keeps
the game's own stanza breaks and italics; the site renders it with `<GameText>`.

**Aeon lore** — `src/db/data/aeons.ts`: sections per Aeon, each with its own `spoilerVersion`. `artFile` names the
official art on the wiki for `art:fetch`.

**Story chapters** — `src/db/data/story.ts`, one per story arc with the `version` it released in. Written in our own
words from the Trailblaze Mission summaries.

**Factions, glossary** — `src/db/seed-data.ts` (each with the version it enters the story). Any text rendered through `<LoreText>` links the first
mention of each glossary term to a hover definition.

> Schema changes: `db:push` can't add required columns to tables that already have rows. Locally, since everything
> comes from the seed, reset with `docker compose down -v`, then `db:up`, `db:push`, `db:seed`. Before there's real
> production data, switch to `drizzle-kit generate` + `migrate`.

## Images

All game art is © HoYoverse and is **not committed**: `npm run art:fetch` downloads it into `public/art` (also run
automatically by `prebuild`), converting to WebP. Converted files are cached in `.next/cache/hsr-art`, which Vercel keeps
between builds, so deploys only download what's new.

- **Characters:** bust shots, 2048px splash art and round avatars from [StarRailRes](https://github.com/Mar-7th/StarRailRes).
  Spoiler-tagged characters show their bust shot until the reader's progress covers them.
- **Light Cones and game icons:** card art (framed and unframed), icons for skills, Traces, Eidolons, stats and
  materials from StarRailRes.
- **Eidolons:** each Eidolon's in-game card art from the HSR Wiki, trimmed and resized; browsed in the Eidolon gallery.
- **Areas and maps:** area art, each floor's in-game map (up to 3200px) and ~2,200 in-game screenshots of map points, from
  the HSR Wiki. Wiki images are fetched by their MediaWiki hash path, with no API call per file.
- **Enemies:** enemy art from the HSR Wiki.
- **Zoom:** character art, Light Cones, enemies, areas and map screenshots open in the full-screen viewer; maps and the
  Eidolon gallery zoom in place.
- **Worlds and Aeons:** in-game star chart renders and official Aeon art from the HSR Wiki (`WORLD_ART_SOURCES`,
  `artFile`). Missing art falls back to a drawn planet or the Aeon's glyph.
- **Full-screen viewer:** click a character's art. Zoom with the wheel, pinch, double-click, the toolbar or
  `+`/`-`/`0`; drag or arrow keys to pan; `F` toggles browser fullscreen; `Esc` closes.

## SEO

- `NEXT_PUBLIC_SITE_URL` sets the canonical domain used for canonical links, the sitemap and social cards.
- Every page has its own title, description and canonical URL; detail pages add Open Graph / Twitter images from their
  art and `BreadcrumbList` structured data; the home page declares the `WebSite`.
- `/sitemap.xml` lists every page (generated from the database) and `/robots.txt` points to it.

## Deploying

Create a Postgres database on Neon (or Supabase). In Vercel, set `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL`. Run
`db:push` and `db:seed` against the database once, then deploy. Content is static, so rebuild after each content update.

## Roadmap

- [x] Phase 1 — Character Archive
- [x] Phase 2 — Star map home + world hubs
- [x] Phase 3 — Reader story-progress spoiler system + glossary tooltips
- [x] Phase 4 — Aeons & Paths relationship web
- [x] Full roster through 3.8, Aeon lore pages, version timeline, SEO
- [x] Character kits: skills, Traces, Eidolons, stats, materials
- [x] Light Cones; Eidolon art; Version 4.0–4.6 (Planarcadia, Astropolis, Elation, Oroboros)
- [x] Areas with in-game maps; enemies; relics and Planar Ornaments; materials; site-wide search
- [x] Simulated Universe, achievements
- [ ] Team builder
- [ ] Phase 5 — Team builder / tier list

---

Fan-made and non-commercial. Honkai: Star Rail and all related names and art are © HoYoverse.
