# EntreSkill Hub - Detailed Project Report

## 1) Executive Summary

EntreSkill Hub is a full-stack web platform designed to help users convert practical skills into sustainable micro-businesses.  
The project delivers structured idea discovery, roadmap-based guidance, mentor support, and admin-led content governance in one unified Next.js application.

The platform targets common gaps for early-stage entrepreneurs:

- no clear business direction from existing skills,
- unclear legal/cost/marketing steps,
- fragmented learning resources,
- limited access to verified mentors.

This implementation ships as a deployable MVP with:

- learner-facing discovery and progress flows,
- mentor onboarding, profile, Q&A, and session management,
- admin dashboards for approvals, verification, and KPI monitoring,
- production-ready deployment path on Vercel with PostgreSQL (Neon-compatible).

---

## 2) Problem Statement

Many skilled individuals (tailoring, food prep, crafts, repair, digital support, etc.) do not launch businesses because they lack:

- idea clarity aligned to personal skill sets,
- end-to-end startup roadmaps,
- trusted, beginner-friendly resources,
- ongoing mentorship and structured validation.

EntreSkill Hub addresses these barriers through curated, role-based workflows and centralized support.

---

## 3) Objectives

### Primary Objectives

- match users to business ideas based on skills and interests,
- provide step-by-step practical roadmaps,
- offer training resources in accessible formats,
- connect users with verified mentors.

### Secondary Objectives

- increase self-employment opportunities,
- improve startup preparedness and reduce failure risk,
- support women/youth/rural entrepreneurship,
- create a scalable enablement model.

---

## 4) Scope Coverage

### In-Scope Implemented

- responsive web application,
- role-based auth (`LEARNER`, `MENTOR`, `ADMIN`),
- skill/interest profiling,
- recommendation scoring for business ideas,
- roadmaps with completion tracking,
- bookmark and dashboard features,
- mentor directory, profile, Q&A, session requests,
- mentor resource submission + admin approval,
- admin moderation and KPI overview.

### Out-of-Scope (as planned)

- native mobile apps,
- live loan/funding processing,
- advanced AI coaching,
- direct government-subsidy integration.

---

## 5) System Architecture

### 5.1 High-Level Architecture

- **Frontend + App shell:** Next.js App Router
- **Backend APIs:** Next Route Handlers + Server Actions
- **Auth:** NextAuth (credentials) with JWT sessions
- **Database:** PostgreSQL via Prisma ORM
- **Deployment:** Vercel (single project, full stack)

This is a **single unified application** (not separate frontend/backend repos).

### 5.2 Codebase Structure

- `src/app/` - routes, pages, layouts, API handlers
- `src/client/` - client-oriented reusable components
- `src/server/` - server-only auth, actions, Prisma, helpers
- `prisma/` - schema, migrations, seed script
- `docs/` - technical and report documentation

---

## 6) Technology Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

### Backend / Platform

- Next.js Route Handlers
- Next.js Server Actions
- NextAuth (v5 beta)
- Zod validation

### Database / Data Access

- PostgreSQL
- Prisma 5.22

### Tooling

- ESLint
- TSX (seed runner)
- Docker Compose (optional local Postgres)

---

## 7) Data Model (Core Entities)

Implemented Prisma model groups include:

- **Identity & Access:** `User`, role enum
- **Profiling:** `Skill`, `Interest`, `UserSkill`, `UserInterest`
- **Discovery:** `BusinessIdea`, `IdeaSkill`, `IdeaInterest`
- **Roadmaps:** `RoadmapStep`, `UserProgress`
- **User Utility:** `Bookmark`
- **Mentorship:** `MentorProfile`, `MentorSession`, `MentorQuestion`, `MentorAnswer`
- **Learning Content:** `LearningResource`, `ResourceIdeaLink`
- **Governance/Signals:** `Feedback`, `Report`

This supports many-to-many linkage and role-driven moderation workflows.

---

## 8) Functional Implementation Details

### 8.1 Learner Module

- registration + login,
- profile capture (skills/interests),
- ranked business idea recommendations,
- detailed roadmap page with step completion toggles,
- bookmarks,
- dashboard summaries,
- question posting and session tracking.

### 8.2 Mentor Module

- mentor account onboarding,
- mentor profile management,
- expertise tagging,
- training resource submission (pending review),
- question inbox and response flow,
- session request management (confirm/decline/complete).

### 8.3 Admin Module

- users listing and moderation context,
- mentor verification/revocation,
- pending resource approval/rejection,
- business idea creation,
- KPI dashboard (registrations, session counts, feedback metrics, etc.),
- feedback visibility.

---

## 9) Authentication and Authorization

### Auth Flow

- credentials provider validates email/password,
- passwords hashed with `bcryptjs`,
- JWT session strategy used for runtime portability.

### Access Control

- middleware guards `/dashboard`, `/mentor/*`, `/admin/*`,
- additional server-side role checks in server actions,
- mentor/admin separation maintained across workflows.

---

## 10) Recommendation Logic

Current matching is deterministic and rules-based:

- skill overlap weighted higher than interest overlap,
- score-based sorting determines recommendation order.

This aligns with MVP constraints and keeps behavior transparent.

---

## 11) Non-Functional Requirements Status

### Performance

- successful production builds across all routes,
- server-rendered dynamic routes with App Router optimization.

### Security

- role-based authorization checks,
- hashed passwords,
- environment variable driven secrets.

### Usability

- clean learner-first navigation,
- dedicated dashboards by role,
- simplified language and action-centric UI.

### Scalability

- modular server/client separation,
- normalized relational schema,
- admin-managed content allows growth without code changes.

---

## 12) Deployment Readiness

### Current Deployment Strategy

- Vercel single-project deployment,
- Neon PostgreSQL target,
- build command currently uses:

```bash
prisma db push && next build
```

> Note: `db push` is currently used to avoid environment-specific migration BOM/encoding issues experienced during early deployment attempts.

### Required Environment Variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`

---

## 13) Testing and Validation Performed

- project-wide production build (`npm run build`) completed successfully,
- Vercel-equivalent build path (`npm run build:vercel`) validated successfully after DB sync,
- seed execution validated with demo account generation,
- lint run completed.

---

## 14) Seed Data / Demo Credentials

After running `npm run db:seed`:

- `admin@entreskill.demo`
- `mentor@entreskill.demo`
- `learner@entreskill.demo`

Password for all: `demo123456`

---

## 15) Challenges and Resolutions

### Challenge

Prisma migration execution failed repeatedly on hosted DB due to hidden BOM/encoding artifacts in SQL migration input (`\u{feff}` at position 1).

### Resolution

- moved production build flow to schema sync (`prisma db push`) for reliable provisioning,
- retained migration files for historical structure,
- validated DB sync + build completion against Neon.

---

## 16) Project Outcomes

The MVP is complete and deployable with:

- end-to-end role flows,
- structured entrepreneurship guidance,
- mentor + admin governance loop,
- hosted database compatibility,
- documentation and operational scripts.

The project is suitable for:

- portfolio demonstration,
- pilot launch for local entrepreneurship programs,
- further productization in phased releases.

---

## 17) Recommended Next Steps

1. Add automated E2E tests (Playwright) for auth, learner roadmap flow, mentor approvals.
2. Move from `db push` to hardened migration workflow once migration encoding is normalized.
3. Add i18n scaffolding for multilingual user groups.
4. Introduce analytics events for deeper KPI quality (retention, completion funnel).
5. Add richer mentor scheduling (time-zone aware availability slots, reminders).
6. Implement content versioning and editorial audit trail.

---

## 18) Conclusion

EntreSkill Hub successfully operationalizes the Skill-to-Startup concept into a practical full-stack product.  
It balances simplicity for first-time entrepreneurs with enough structure for scalable governance and deployment.  
The system is now in a strong state for pilot usage and iterative enhancement.
