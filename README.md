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
  app/                 routes (/, /characters/[slug], /worlds/[slug])
  components/          UI (Starfield, StarMap, character cards & browser, Spoiler)
  db/
    schema.ts          tables: paths, elements, worlds, world_chapters, factions, characters
    seed-data.ts       the content — edit this to add characters
    seed.ts            upserts seed-data into the database
  lib/queries.ts       data access used by pages
legacy/                the original static site, kept for reference
```

## Adding content

1. Add an entry to `src/db/seed-data.ts`.
2. Run `npm run db:seed`.
3. If a detail reveals story, set `spoilerVersion` to the version where it's revealed; it renders blurred until clicked.

World story recaps live in `CHAPTERS_BY_WORLD` in the same file, one entry per chapter, each with its own `spoilerVersion`.

> Schema changes: `db:push` can't add required columns to tables that already have rows. Locally, since everything comes from the seed, reset with `docker compose down -v`, then `db:up`, `db:push`, `db:seed`. Before there's real production data, switch to `drizzle-kit generate` + `migrate`.

## Deploying

Create a Postgres database on Neon (or Supabase), set `DATABASE_URL` in Vercel's environment variables,
run `db:push` and `db:seed` against it once, then deploy. Content is static, so rebuild after each patch's update.

## Roadmap

- [x] Phase 1 — Character Archive
- [x] Phase 2 — Star map home + world hubs
- [ ] Phase 3 — Reader story-progress spoiler system + glossary tooltips
- [ ] Phase 4 — Aeons & Paths relationship web
- [ ] Phase 5 — Team builder / tier list

---

Fan-made and non-commercial. Honkai: Star Rail and all related names are trademarks of HoYoverse.
