# Astral Express — Honkai: Star Rail Fan Archive

A fan-made, lore-first archive of Honkai: Star Rail: characters, Paths, worlds and story.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion · PostgreSQL + Drizzle ORM

## Getting started

Requires Node 20+ and Docker Desktop (for the local database).

```bash
npm install
cp .env.example .env     # points at the local Docker database
npm run db:up            # start Postgres on localhost:5433
npm run db:push          # create tables from src/db/schema.ts
npm run db:seed          # load content from src/db/seed-data.ts
npm run dev              # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (needs the database — pages are pre-rendered from it) |
| `npm run db:up` | Start the local Postgres container |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | Upsert content from `seed-data.ts` (safe to re-run) |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run typecheck` / `npm run lint` | Checks |

## Project layout

```
src/
  app/                 routes (/, /characters/[slug], /worlds/[slug], /glossary)
  components/          UI (Starfield, StarMap, character cards & browser, Spoiler, glossary Term/LoreText)
  db/
    schema.ts          tables: paths, elements, worlds, world_chapters, factions, characters, glossary_terms
    seed-data.ts       the content — edit this to add characters
    seed.ts            upserts seed-data into the database
  lib/
    queries.ts         data access used by pages
    spoilers.ts        version comparison + isRevealed()
    glossary.ts        finds glossary terms in lore text
    images.ts          character art URLs
legacy/                the original static site, kept for reference
```

## Adding content

1. Add an entry to `src/db/seed-data.ts`.
2. Run `npm run db:seed`.
3. If a detail reveals story, set `spoilerVersion` to the version where it's revealed. It stays hidden until the reader's
   story progress (the header picker, saved per browser) reaches that version, or they click to reveal it.
4. Set `gameId` to the character's in-game ID to show their art — look it up in StarRailRes's
   [`index_new/en/characters.json`](https://github.com/Mar-7th/StarRailRes/blob/master/index_new/en/characters.json).

World story recaps live in `CHAPTERS_BY_WORLD` in the same file, one entry per chapter, each with its own `spoilerVersion`.

Glossary terms live in `GLOSSARY`. Any lore text rendered through `<LoreText>` (bios, Path blurbs, world descriptions,
chapters) automatically links the first mention of each term to a hover definition.

## Images

- **Characters:** art comes from [StarRailRes](https://github.com/Mar-7th/StarRailRes) (community-archived game assets,
  © HoYoverse) via jsDelivr, optimized by `next/image`. Spoiler-tagged characters show their bust shot until the
  reader's progress covers them, since full splash art can give away a reveal.
- **Worlds:** no source is wired up. Drop an image in `public/worlds/` and set that world's `image`
  (e.g. `"/worlds/penacony.webp"`) in `seed-data.ts`; otherwise the hub draws a CSS planet.

> Schema changes: `db:push` can't add required columns to tables that already have rows. Locally, since everything comes from the seed, reset with `docker compose down -v`, then `db:up`, `db:push`, `db:seed`. Before there's real production data, switch to `drizzle-kit generate` + `migrate`.

## Deploying

Create a Postgres database on Neon (or Supabase), set `DATABASE_URL` in Vercel's environment variables,
run `db:push` and `db:seed` against it once, then deploy. Content is static, so rebuild after each patch's update.

## Roadmap

- [x] Phase 1 — Character Archive
- [x] Phase 2 — Star map home + world hubs
- [x] Phase 3 — Reader story-progress spoiler system + glossary tooltips
- [ ] Phase 4 — Aeons & Paths relationship web
- [ ] Phase 5 — Team builder / tier list

---

Fan-made and non-commercial. Honkai: Star Rail and all related names are trademarks of HoYoverse.
