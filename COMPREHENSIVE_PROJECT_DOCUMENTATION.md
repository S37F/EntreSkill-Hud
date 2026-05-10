# EntreSkill Hub - Comprehensive Project Documentation

> Skill-to-startup enablement platform. A single Next.js 16 App Router application with PostgreSQL/Prisma persistence and NextAuth/Auth.js v5 JWT sessions. Server-rendered pages, Server Actions for mutations, and credential-based role-aware authentication.

---

## 1. Tech Stack

### Runtime and Framework

| Technology | Version | Usage |
|---|---:|---|
| Next.js | 16.2.4 | App Router, React Server Components, API route handlers, Server Actions |
| React | 19.2.4 | UI rendering |
| React DOM | 19.2.4 | Browser rendering |
| TypeScript | ^5 | Static typing |
| Node.js runtime | - | Auth route explicitly uses Node runtime |

### Authentication

| Technology | Version | Usage |
|---|---:|---|
| next-auth / Auth.js | ^5.0.0-beta.31 | Credentials provider, JWT sessions, middleware auth |
| bcryptjs | ^3.0.3 | Password hashing and password verification |
| zod | ^4.4.3 | Runtime validation for login and registration payloads |

### Database and ORM

| Technology | Version | Usage |
|---|---:|---|
| PostgreSQL | 16-alpine locally | Main relational database |
| Prisma ORM | 5.22.0 | Schema, migrations, generated client |
| @prisma/client | 5.22.0 | Runtime database client |

### Frontend and Styling

| Technology | Version | Usage |
|---|---:|---|
| Tailwind CSS | ^4 | Styling |
| @tailwindcss/postcss | ^4 | Tailwind PostCSS integration |
| next/font | bundled | DM Sans and JetBrains Mono font loading |

### Tooling and DevOps

| Technology | Version | Usage |
|---|---:|---|
| ESLint | ^9 | Linting |
| eslint-config-next | 16.2.4 | Next.js lint rules |
| Docker Compose | - | Local PostgreSQL service |
| dotenv | ^17.4.2 | Loads env vars in Prisma seed script |
| tsx | ^4.21.0 | Runs TypeScript seed script |
| date-fns | ^4.1.0 | Session date formatting |
| Vercel | - | Intended deployment target |

No Redis, Socket.io, queue worker, email provider, payment gateway, object storage, or test framework is configured.

---

## 2. Backend Concepts and Key Methods

### Credentials Authentication

- **What it is:** Email and password login using NextAuth's Credentials provider.
- **Why it is used here:** The app has first-party learner, mentor, and admin accounts without OAuth.
- **How it works:**
  1. `LoginForm` calls `signIn("credentials")`.
  2. `Credentials.authorize()` validates credentials with `zod`.
  3. User lookup happens through `prisma.user.findUnique`.
  4. Password verification happens through `bcrypt.compare`.
  5. A NextAuth JWT session is issued.
- **Where in code:** `src/client/components/login-form.tsx`, `src/server/auth.ts`, `src/server/auth.config.ts`.

### JWT Sessions

- **What it is:** Stateless session storage in a signed Auth.js JWT cookie.
- **Why it is used here:** Fits a serverless Vercel deployment without requiring a DB-backed session table.
- **How it works:**
  1. `session.strategy` is set to `jwt`.
  2. `jwt()` callback adds `id` and `role`.
  3. `session()` callback copies those values to `session.user`.
  4. Auth middleware and pages call `auth()` to read the session.
- **Where in code:** `src/server/auth.config.ts`, `src/server/types/next-auth.d.ts`.

### Middleware Authorization

- **What it is:** Request-time authorization before protected pages render.
- **Why it is used here:** Protects dashboard, mentor, and admin route groups.
- **How it works:**
  1. `middleware.ts` exports `auth` as middleware.
  2. `config.matcher` applies it to `/dashboard/:path*`, `/admin/:path*`, and `/mentor/:path*`.
  3. `authorized({ auth, request })` checks the route and user role.
  4. Admin routes require `ADMIN`; mentor routes require `MENTOR` or `ADMIN`; dashboard routes require login.
- **Where in code:** `middleware.ts`, `src/server/auth.config.ts`.

### Server-Side Role Guards

- **What it is:** Helper functions that protect Server Actions.
- **Why it is used here:** Server Actions are mutation endpoints and must re-check auth even if middleware exists.
- **How it works:**
  1. `requireLogin()` calls `auth()`.
  2. If no session exists, it redirects to `/login`.
  3. `requireRoles(...roles)` checks `session.user.role`.
  4. Unauthorized users are redirected to `/dashboard`.
- **Where in code:** `src/server/actions/_auth.ts` (`requireLogin`, `requireRoles`).

### Server Actions

- **What it is:** Next.js server functions used as the mutation layer.
- **Why it is used here:** Avoids creating a large REST API for form mutations.
- **How it works:** Action files use `"use server"`, validate or normalize input, call Prisma, and call `revalidatePath()` to refresh affected pages.
- **Where in code:** `src/server/actions/admin.ts`, `ideas.ts`, `mentor.ts`, `profile.ts`, `resources.ts`, `sign-out.ts`.

### Prisma ORM and Singleton Client

- **What it is:** Type-safe ORM for PostgreSQL.
- **Why it is used here:** Provides schema-driven queries and generated TypeScript types.
- **How it works:** `src/server/lib/prisma.ts` creates a `PrismaClient` and caches it on `globalThis` during development to avoid hot-reload connection churn.
- **Where in code:** `src/server/lib/prisma.ts`, `prisma/schema.prisma`.

### Database Transactions

- **What it is:** Atomic grouping of multiple writes.
- **Why it is used here:** Prevents partial updates for profile saves and mentor answers.
- **How it works:** `prisma.$transaction([...])` is used for replacing user profile tags and for adding an answer while changing question status.
- **Where in code:** `src/server/actions/profile.ts`, `src/server/actions/mentor.ts`, `prisma/seed.ts`.

### Cache Revalidation

- **What it is:** Explicit invalidation of Next.js cached server-rendered data.
- **Why it is used here:** Mutations should immediately update pages like `/ideas`, `/dashboard`, `/mentor/sessions`, and `/admin/resources`.
- **How it works:** Actions call `revalidatePath()` after database writes.
- **Where in code:** All major files under `src/server/actions/`.

### Recommendation Scoring

- **What it is:** Rule-based matching of users to business ideas.
- **Why it is used here:** Provides an MVP recommendation system without ML infrastructure.
- **How it works:** `scoreIdeaForUser()` awards 2 points for matching skills and 1 point for matching interests, then `/ideas` sorts ideas by score.
- **Where in code:** `src/server/lib/recommend.ts`, `src/app/ideas/page.tsx`.

### RBAC

- **What it is:** Role-based access control.
- **Why it is used here:** Learners, mentors, and admins have different capabilities.
- **How it works:** `Role` enum values are persisted in the database, copied into the JWT, checked in middleware, checked in pages, and checked again inside Server Actions.
- **Where in code:** `prisma/schema.prisma`, `src/server/auth.config.ts`, `src/server/actions/_auth.ts`.

### Resource Moderation

- **What it is:** Submitted learning resources require approval before public visibility.
- **Why it is used here:** Keeps mentor-uploaded resources controlled and curated.
- **How it works:** `createLearningResource()` creates resources with `PENDING`; `approveResource()` changes them to `APPROVED` or `REJECTED`; public listings show only approved resources except for admins.
- **Where in code:** `src/server/actions/resources.ts`, `src/app/resources/page.tsx`, `src/app/admin/resources/page.tsx`.

### Mentor Sessions

- **What it is:** Lightweight booking workflow.
- **Why it is used here:** Lets learners request guidance without integrating a calendar or video service.
- **How it works:** Learners create `MentorSession` rows; mentors/admins update status from `REQUESTED` to `CONFIRMED`, `COMPLETED`, or `CANCELLED`.
- **Where in code:** `src/server/actions/mentor.ts`, `src/app/mentors/[userId]/page.tsx`, `src/app/mentor/sessions/page.tsx`.

### Q&A Workflow

- **What it is:** Mentor question and answer system.
- **Why it is used here:** Learners can ask direct or general business questions.
- **How it works:** Questions may be assigned to a mentor or left unassigned; mentor inbox shows assigned and unassigned open questions; answering creates `MentorAnswer` and marks the question `ANSWERED`.
- **Where in code:** `src/server/actions/mentor.ts`, `src/app/dashboard/questions/page.tsx`, `src/app/mentor/questions/page.tsx`.

---

## 3. API Inventory

### REST Route Handlers

| Method | Route | Description | Auth Required | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/api/register` | Creates a learner or mentor account and hashes the password | No | `{ email, password, name?, intent? }` | `{ ok: true }`, `{ error: string }` |
| GET | `/api/auth/[...nextauth]` | NextAuth-managed endpoints such as session, CSRF, providers | No | - | NextAuth-managed |
| POST | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out/callback endpoints | No for login | NextAuth-managed payload | NextAuth-managed |

### Server Action Mutation Inventory

| Module | Function | Description | Auth Required |
|---|---|---|---|
| `profile.ts` | `saveUserProfile(skillIds, interestIds)` | Replace user's selected skills and interests | Logged-in |
| `profile.ts` | `saveProfileFromForm(formData)` | Form wrapper for profile save | Logged-in |
| `ideas.ts` | `toggleBookmark(ideaSlug)` | Toggle bookmark for an idea | Logged-in |
| `ideas.ts` | `toggleStepComplete(stepId, ideaSlug)` | Toggle roadmap progress | Logged-in |
| `mentor.ts` | `upsertMentorProfile(formData)` | Create/update mentor profile and expertise | `MENTOR` or `ADMIN` |
| `mentor.ts` | `requestMentorSession(mentorId, startIso, endIso)` | Request a mentor session | Logged-in |
| `mentor.ts` | `updateSessionStatus(sessionId, status)` | Confirm, cancel, or complete a session | `MENTOR` or `ADMIN` |
| `mentor.ts` | `askMentorQuestion(title, body, mentorUserId?, ideaId?)` | Ask direct or idea-related mentor question | Logged-in |
| `mentor.ts` | `answerMentorQuestion(questionId, body)` | Answer a learner question | `MENTOR` or `ADMIN` |
| `resources.ts` | `bumpResourceView(resourceId)` | Increment resource view count | Server-side |
| `resources.ts` | `createLearningResource(formData)` | Submit a resource for admin approval | `MENTOR` or `ADMIN` |
| `resources.ts` | `approveResource(resourceId, approved)` | Approve or reject submitted resource | `ADMIN` |
| `admin.ts` | `setMentorVerified(userId, verified)` | Verify or revoke mentor profile | `ADMIN` |
| `admin.ts` | `createBusinessIdea(formData)` | Create business idea with starter roadmap step | `ADMIN` |
| `admin.ts` | `submitFeedback(rating, comment?)` | Store user feedback | Logged-in |
| `sign-out.ts` | `signOutAction()` | Sign out and redirect home | Any session |

---

## 4. Architecture Diagram

```text
[Browser / Client]
        |
        v
[Next.js App Router]
        |
        +--> [Middleware: auth()]
        |          |
        |          +--> /dashboard requires login
        |          +--> /mentor requires MENTOR or ADMIN
        |          +--> /admin requires ADMIN
        |
        +--> [Server Components: src/app/**]
        |          |
        |          +--> direct Prisma reads
        |
        +--> [API Route Handlers]
        |          |
        |          +--> /api/register
        |          +--> /api/auth/[...nextauth]
        |
        +--> [Server Actions]
                   |
                   +--> requireLogin / requireRoles
                   +--> Prisma mutations
                   +--> revalidatePath()
                   |
                   v
          [Prisma Client Singleton]
                   |
                   v
             [PostgreSQL]
```

### Auth Flow

```text
[RegisterForm] --POST /api/register--> [zod validation]
                                      -> [bcrypt.hash]
                                      -> [User row in PostgreSQL]

[LoginForm] --signIn("credentials")--> [NextAuth Credentials.authorize]
                                      -> [zod validation]
                                      -> [prisma.user.findUnique]
                                      -> [bcrypt.compare]
                                      -> [JWT cookie with user id and role]
                                      -> [middleware + Server Actions authorize requests]
```

### Main Domain Flow

```text
[Learner]
   -> [Dashboard/Profile]
   -> [saveUserProfile]
   -> [UserSkill + UserInterest]
   -> [Ideas Page]
   -> [scoreIdeaForUser]
   -> [BusinessIdea + RoadmapStep]
   -> [toggleBookmark / toggleStepComplete]

[Learner]
   -> [Mentor Detail]
   -> [requestMentorSession / askMentorQuestion]
   -> [MentorSession / MentorQuestion]
   -> [Mentor Workspace]
   -> [updateSessionStatus / answerMentorQuestion]

[Mentor]
   -> [Upload Resource]
   -> [LearningResource: PENDING]
   -> [Admin Resource Approval]
   -> [LearningResource: APPROVED]
   -> [Public Resources]

[Admin]
   -> [Mentor Verification]
   -> [Resource Approval]
   -> [Idea Creation]
   -> [KPI Dashboard]
```

External services: none currently implemented.

---

## 5. Problem Statement

### Real-world problem

People with practical skills such as tailoring, cooking, repair work, crafts, and basic digital services often struggle to convert those skills into sustainable micro-businesses. The information needed to choose an idea, validate demand, estimate costs, understand tools, and get mentorship is scattered across videos, social media groups, and informal networks.

### Target users

- **Learners:** aspiring micro-entrepreneurs who want to turn an existing skill into income.
- **Mentors:** experienced practitioners or trainers who can guide learners and submit learning resources.
- **Admins:** platform operators, NGO staff, or training program managers who moderate mentors, resources, and catalog content.

### Manual workflow without this software

Users would manually search the web, ask social groups, track progress on paper, find mentors informally, and piece together startup checklists from unrelated resources.

### Core value proposition

EntreSkill Hub matches a user's skills and interests to curated business ideas and gives each idea a practical startup roadmap. It combines progress tracking, approved learning resources, verified mentors, Q&A, and simple booking into one focused platform for micro-business creation.

---

## 6. Authentication and Authorization

### Auth strategy

The project uses **NextAuth/Auth.js v5 Credentials authentication** with **JWT sessions**.

### Token generation, storage, and validation

- Tokens are generated after successful credential login through `Credentials.authorize`.
- Token claims are enriched in `authConfig.callbacks.jwt` with `token.id` and `token.role`.
- Session objects are enriched in `authConfig.callbacks.session`.
- Tokens are stored in Auth.js-managed HTTP-only cookies.
- Tokens are validated through `auth()` in middleware, pages, components, and Server Actions.
- Session lifetime is 30 days via `session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }`.

### Roles

| Role | Purpose |
|---|---|
| `LEARNER` | Default user; can use dashboard, profile, ideas, bookmarks, roadmap progress, Q&A, mentor booking, resources, feedback |
| `MENTOR` | Can maintain mentor profile, upload resources, answer questions, manage sessions |
| `ADMIN` | Can verify mentors, approve resources, create ideas, view KPIs, manage admin pages |

### Auth middleware signatures

```ts
export async function requireLogin()
export async function requireRoles(...roles: Role[])
authorized({ auth, request })
export const { handlers, auth, signIn, signOut } = NextAuth(...)
```

---

## 7. Database Design

### Database

The project uses **PostgreSQL** with Prisma ORM. Local development uses Docker Compose with `postgres:16-alpine`.

### Models and key fields

| Model | Key fields | Purpose |
|---|---|---|
| `User` | `id`, `email`, `passwordHash`, `name`, `image`, `role`, timestamps | Account and role record |
| `Skill` | `id`, `name`, `category` | Skill catalog |
| `Interest` | `id`, `name` | Interest catalog |
| `UserSkill` | `userId`, `skillId` | User-to-skill join table |
| `UserInterest` | `userId`, `interestId` | User-to-interest join table |
| `BusinessIdea` | `id`, `slug`, `title`, `description`, `published`, timestamps | Curated startup idea |
| `IdeaSkill` | `ideaId`, `skillId` | Idea-to-skill join table |
| `IdeaInterest` | `ideaId`, `interestId` | Idea-to-interest join table |
| `RoadmapStep` | `id`, `ideaId`, `order`, `title`, `body`, `stepType` | Ordered startup roadmap step |
| `UserProgress` | `userId`, `stepId`, `doneAt` | Completed roadmap step per user |
| `Bookmark` | `userId`, `ideaId`, `savedAt` | Saved business ideas |
| `MentorProfile` | `userId`, `bio`, `headline`, `verified`, `experience`, timestamps | Mentor profile and verification |
| `MentorSession` | `id`, `mentorId`, `learnerId`, `startAt`, `endAt`, `status`, `notes`, timestamps | Mentor booking workflow |
| `MentorQuestion` | `id`, `authorId`, `mentorId`, `ideaId`, `title`, `body`, `status`, timestamps | Learner question |
| `MentorAnswer` | `id`, `questionId`, `authorId`, `body`, `createdAt` | Mentor answer |
| `LearningResource` | `id`, `title`, `description`, `type`, `url`, `fileKey`, `status`, `authorId`, `viewCount`, timestamps | Learning content |
| `ResourceIdeaLink` | `resourceId`, `ideaId` | Resource-to-idea join table |
| `Feedback` | `id`, `userId`, `rating`, `comment`, `createdAt` | Satisfaction feedback |
| `Report` | `id`, `reporterId`, `targetType`, `targetId`, `reason`, `status`, `createdAt` | Reporting model, currently not surfaced in UI |

### Relationships

- `User` to `MentorProfile`: one-to-one.
- `User` to `Skill`: many-to-many through `UserSkill`.
- `User` to `Interest`: many-to-many through `UserInterest`.
- `BusinessIdea` to `Skill`: many-to-many through `IdeaSkill`.
- `BusinessIdea` to `Interest`: many-to-many through `IdeaInterest`.
- `BusinessIdea` to `RoadmapStep`: one-to-many.
- `User` to `RoadmapStep`: many-to-many through `UserProgress`.
- `User` to `BusinessIdea`: many-to-many through `Bookmark`.
- `MentorProfile` to `Skill`: many-to-many through implicit Prisma relation `MentorExpertise`.
- `LearningResource` to `BusinessIdea`: many-to-many through `ResourceIdeaLink`.
- `MentorQuestion` to `MentorAnswer`: one-to-many.

### Indexes and constraints

- Unique: `User.email`, `Skill.name`, `Interest.name`, `BusinessIdea.slug`.
- Composite primary keys: `UserSkill`, `UserInterest`, `IdeaSkill`, `IdeaInterest`, `UserProgress`, `Bookmark`, `ResourceIdeaLink`.
- Index: `RoadmapStep(ideaId, order)`.
- Unique: `MentorSession(mentorId, startAt)`.
- Indexes: `MentorSession.learnerId`, `MentorQuestion.mentorId`, `MentorQuestion.authorId`, `MentorAnswer.questionId`.

### Migrations and seeding

- Migration path: `prisma/migrations/20260204150000_init/migration.sql`.
- Seed path: `prisma/seed.ts`.
- Seed creates demo admin, mentor, learner, skills, interests, business ideas, roadmap steps, resources, progress, bookmark, and feedback.
- Seed command: `npm run db:seed`.

---

## 8. Error Handling and Logging

### Global error handler

`src/app/error.tsx` is the global app error boundary. It logs errors with `console.error(error)` and renders a friendly retry UI.

### Not-found handling

`src/app/not-found.tsx` defines the 404 page. Route pages call `notFound()` for missing or unauthorized resources, such as private mentor profiles and unapproved resources.

### API error format

`/api/register` returns JSON errors:

```json
{ "error": "This email is already registered." }
```

or:

```json
{ "error": "Could not register. Check your inputs." }
```

### Server Action errors

Server Actions throw normal `Error` objects, for example `"Idea not found"`, `"Invalid time range"`, `"Wrong mentor"`, or `"Title required"`. These bubble to the Next.js error boundary.

### Logging

- No dedicated logging library is installed.
- `console.error` is used in `src/app/error.tsx`.
- `console.log` and `console.error` are used in `prisma/seed.ts`.

### Custom error classes

No custom error classes are implemented.

---

## 9. Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | `bcrypt.hash(password, 12)` |
| Password verification | `bcrypt.compare()` |
| Input validation | `zod` schemas for auth and registration |
| Email normalization | Lowercase email before lookup/create |
| JWT sessions | Auth.js JWT strategy with `AUTH_SECRET` |
| HTTP-only cookies | Managed by Auth.js defaults |
| Middleware route protection | `middleware.ts` with `/dashboard`, `/mentor`, `/admin` matcher |
| Server-side role checks | `requireLogin` and `requireRoles` in Server Actions |
| SQL injection protection | Prisma parameterized queries; no raw SQL in app code |
| XSS protection | React escaping; no `dangerouslySetInnerHTML` found |
| Resource moderation | Non-admin users only see `APPROVED` resources |
| Mentor moderation | Public directory only shows verified mentors |
| Environment secrets | `.env.example` documents required secrets; `.env` is ignored |
| Booking conflict prevention | Unique DB constraint on `(mentorId, startAt)` |

### Security gaps / not implemented

- No rate limiting.
- No CAPTCHA or bot protection.
- No explicit Helmet/security headers configuration.
- No CORS configuration.
- No account lockout after failed login attempts.
- No email verification despite `emailVerified` existing on `User`.
- No audit log.
- No dedicated structured logger.
- No object storage or file upload hardening.

---

## 10. Project Structure

```text
Skill-to-startup/
├── .env.example
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── docker-compose.yml
├── eslint.config.mjs
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── docs/
│   ├── PROJECT_REPORT.md
│   └── TECH.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
└── src/
    ├── app/
    │   ├── api/
    │   ├── admin/
    │   ├── dashboard/
    │   ├── ideas/
    │   ├── login/
    │   ├── mentor/
    │   ├── mentors/
    │   ├── register/
    │   ├── resources/
    │   ├── error.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── not-found.tsx
    │   └── page.tsx
    ├── client/
    │   └── components/
    └── server/
        ├── actions/
        ├── lib/
        ├── types/
        ├── auth.config.ts
        └── auth.ts
```

### Folder purpose

- `src/app/`: Next.js App Router routes, layouts, server pages, error and not-found boundaries.
- `src/app/api/`: Route handlers for registration and NextAuth.
- `src/app/dashboard/`: Logged-in learner dashboard, profile, questions, and sessions.
- `src/app/mentor/`: Mentor workspace for profile management, resource upload, Q&A, and sessions.
- `src/app/admin/`: Admin workspace for KPIs, users, mentors, resource approvals, ideas, and feedback.
- `src/app/ideas/`: Business idea listing and roadmap detail pages.
- `src/app/resources/`: Approved learning resource library and details.
- `src/app/mentors/`: Public verified mentor directory and mentor details.
- `src/client/components/`: Browser-interactive React components such as login and register forms.
- `src/server/actions/`: Server Actions that implement all mutations.
- `src/server/lib/`: Prisma singleton and recommendation helper.
- `src/server/types/`: NextAuth type augmentation.
- `prisma/`: Database schema, migrations, and seed data.
- `docs/`: Existing project documentation.
- `middleware.ts`: Route protection entry point.
- `docker-compose.yml`: Local PostgreSQL setup.

---

## Summary

EntreSkill Hub is a lean, server-rendered MVP for helping learners turn practical skills into micro-businesses. It uses Next.js 16, React 19, TypeScript, NextAuth JWT sessions, Prisma, and PostgreSQL. The backend is implemented through App Router route handlers, Server Components, and Server Actions rather than a traditional controller/service REST API, with Prisma acting as the data access layer and role checks enforced through middleware plus server-side guards.
