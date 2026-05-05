# EntreSkill Hub

Web platform to help people turn practical skills into micro-businesses: skill/interest profiling, curated business ideas with roadmaps, learning resources, bookmarks and progress, mentor directory, Q&A, and simple session booking — plus admin tooling for verification and content approval.

## Project layout

- `src/app/` — routes, pages, API route handlers (`app/api/...`).
- `src/client/` — React components (including client-only forms and providers); import as `@/client/...`.
- `src/server/` — auth, Prisma, Server Actions, scoring helpers; import as `@/server/...`.

Still a **single Next.js + Vercel** deployment; folders separate concerns only.

## Quick start

1. **Environment**

   ```bash
   cp .env.example .env
   ```

   Set `DATABASE_URL`, `AUTH_SECRET`, and `NEXTAUTH_URL`.

2. **Database**

   ```bash
   docker compose up -d   # optional local Postgres
   npx prisma migrate deploy
   npm run db:seed
   ```

3. **Run**

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts (after `db:seed`)

All use password `demo123456`:

- `admin@entreskill.demo` — admin
- `mentor@entreskill.demo` — mentor (verified in seed)
- `learner@entreskill.demo` — learner with sample progress

## Deploy on Vercel (one project — client + server together)

This repo is a **single Next.js app**: pages and client components ship to the browser; API routes, Server Actions, and Prisma run on Vercel’s **Node serverless functions** in the **same deployment**. You do **not** need a separate “frontend” and “backend” repo.

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project in [Vercel](https://vercel.com/new) with the **root directory** as the app (default).
3. Add environment variables (Project → Settings → Environment Variables):

   | Name | Notes |
   |------|--------|
   | `DATABASE_URL` | Hosted Postgres (e.g. [Neon](https://neon.tech), Supabase). Use **pooled** / serverless URL if the provider recommends it. |
   | `AUTH_SECRET` | Long random secret (same idea as `.env.example`). |
   | `NEXTAUTH_URL` | Your production URL, e.g. `https://your-app.vercel.app` |

4. Set **Build Command** to apply migrations before the Next build:

   ```bash
   npm run build:vercel
   ```

   Leave **Output** and **Install Command** as defaults (`npm install` / auto).

5. Deploy. Optionally run `npm run db:seed` **once** from your machine pointing at production `DATABASE_URL` (careful — only if you really want demo data in prod).

`postinstall` already runs `prisma generate`, so the client is available during `next build`.

## Documentation

See [docs/TECH.md](docs/TECH.md) for architecture, deployment, and scripts.

## Scripts

- `npm run dev` — development
- `npm run build` / `npm run start` — production
- `npm run db:deploy` — apply migrations
- `npm run db:seed` — seed sample data
