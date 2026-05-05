# EntreSkill Hub — technical notes

## Repository layout

| Path | Role |
|------|------|
| `src/app/` | Next.js App Router — routes, layouts, **server pages** that compose UI + data |
| `src/client/` | **Client-oriented** code: interactive components (`"use client"`), shared presentational pieces used from `app/` |
| `src/server/` | **Server-only** code: auth (`auth.ts`, `auth.config.ts`), Prisma + domain helpers (`lib/`), Server Actions (`actions/`), NextAuth type augmentations (`types/`) |

Imports use aliases: `@/client/...` and `@/server/...`. This is still **one Next.js app** (one Vercel project); the split is for clarity, not a separate API server.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- Auth: NextAuth.js (Auth.js v5) credentials + JWT sessions (`src/server/auth.ts`, `middleware.ts`)
- Data: PostgreSQL + Prisma ORM 5 (`prisma/schema.prisma`)

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — long random string (e.g. `openssl rand -base64 32`)
- `NEXTAUTH_URL` — canonical app URL (`http://localhost:3000` in dev)

## Local database

Docker (optional):

```bash
docker compose up -d
```

Then:

```bash
npx prisma migrate deploy
npm run db:seed
```

## Scripts

| Script            | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Dev server                                   |
| `npm run build`   | Production build                             |
| `npm run start`   | Start production server                      |
| `npm run db:deploy` | Apply migrations (`migrate deploy`)       |
| `npm run db:seed` | Seed demo users + catalog + ideas           |

## Roles and access

- **LEARNER**: dashboard, profiling, ideas/roadmaps/bookmarks, resources, mentor directory, bookings, Q&A
- **MENTOR**: same public read + `/mentor/*` (profile, uploads, inbox, sessions); directory listing requires **admin verification**
- **ADMIN**: `/admin/*` (users, mentor verification, resource approval, KPIs, seed new ideas)

Middleware (`middleware.ts`) restricts `/dashboard`, `/mentor`, and `/admin`; always re-check role in server actions (`src/app/actions/_auth.ts`).

## Deployment (Vercel + managed Postgres)

**Same repo / same Vercel project:** Next.js bundles the UI and server logic together. Only one Git integration and one Production URL.

1. Create a Postgres instance (Neon, Supabase, etc.). Prefer a **connection string compatible with serverless** (pooler / `?pgbouncer=true` or provider-specific pool URL when using many short-lived connections).
2. In Vercel: set `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (must match the live site origin, e.g. `https://….vercel.app`).
3. **Build command:** `npm run build:vercel` (runs `prisma migrate deploy` then `next build`). Plain `npm run build` skips migrations (fine for CI that doesn’t have a DB).
4. Seed in production is optional; use admin tooling for ongoing content where possible.

`AUTH_SECRET` must be present in Production (and Preview if you log in there); for Preview deployments you may also set `NEXTAUTH_URL` to each preview URL or use a stable auth configuration — simplest path is testing auth on Production first.

## Performance / low bandwidth

- Prefer server components; minimize client JS (`SessionProvider` + login/register only).
- Static marketing home could be re-cached with `revalidate` if content becomes CMS-driven later.

## Known MVP limitations

- Matching is rule-based (skill/interest overlap scores), not ML.
- Mentor “sessions” are slot requests with statuses, not embedded video.
- Resource view counts increment on each page load of `/resources/[id]`.
