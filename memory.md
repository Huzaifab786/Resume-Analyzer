# Memory — Phase 1 Foundation complete

Last updated: 2026-07-01

## What was built

**Feature 02 — Auth (complete):**
- `app/login/page.tsx` — login page shell with Navbar + footer
- `components/auth/AuthForm.tsx` — Sign In / Sign Up tabs, forgot password, resend verification, **full name on sign-up**
- `lib/supabase-client.ts`, `lib/supabase-server.ts` — typed with `Database`
- `middleware.ts` — session refresh + route protection (`/dashboard`, `/analyze`, `/history`)
- `app/auth/callback/route.ts` — email confirmation + password reset callback
- `app/dashboard/page.tsx` — placeholder post-login redirect target

**Feature 03 — Database Schema (complete, applied):**
- `supabase/migrations/20260701183000_initial_schema.sql` — `profiles`, `analyses`, RLS, `resumes` bucket + storage policies, `handle_new_user` trigger + backfill
- `types/database.ts`, `types/index.ts` — Supabase + domain types (`AnalysisResult`, etc.)
- `lib/utils.ts` — `MATCH_THRESHOLD` (70), `DAILY_ANALYSIS_LIMIT` (5)

**Feature 04 — Supabase Clients + Middleware:** completed with Feature 02.

**Context updated:** `progress-tracker.md`, `ui-registry.md` (AuthForm + Login), `library-docs.md` (sign-up with `full_name` metadata).

## Decisions made

- Auth callback URL is `/auth/callback` (matches `library-docs.md` and build plan, not `(auth)` route group)
- Sign-up stores `full_name` in `options.data` → `profiles` trigger reads `raw_user_meta_data->>'full_name'`
- Unverified users blocked from dashboard redirect on sign-in (`email_confirmed_at` check)
- Typed Supabase clients use `Database` from `types/database.ts`
- Migration applied manually via Supabase SQL Editor — MCP `apply_migration` is read-only

## Problems solved

- Supabase MCP cannot apply DDL (`read-only mode`) — migration run by user in Dashboard SQL Editor; verified via MCP: 1 profile backfilled, `resumes` bucket private 5MB PDF-only
- Sign-up full name requirement added mid-session — flows through auth metadata to future `profiles.full_name`

## Current state

**Works:**
- Homepage (Feature 01), auth end-to-end (sign up, verify, sign in, forgot password, resend)
- Database schema live: `profiles` (1 row), `analyses` (empty), storage bucket + RLS
- `npm run build` passes, dev server runs

**Not started:**
- Features 05–13 (Analyze page UI through Dashboard real data)
- No API routes or agent code yet

**Phase 1 (Features 01–04): complete.**

## Next session starts with

**Feature 05 — Analyze Page UI:**
1. Read `context/build-plan.md` Feature 05 + `context/designs/` if analyze mock exists
2. Build `app/analyze/page.tsx` with mock state (no API yet)
3. Components: `ResumeUpload.tsx`, `JobDescriptionForm.tsx`, daily limit banner, Analyze button, loading overlay mock
4. Update `ui-registry.md` and `progress-tracker.md`

User instruction when ready: **"start Feature 05"**

## Open questions

- Next.js 16 warns `middleware` → `proxy` deprecation — still works; migrate when project adopts new pattern
- Regenerate `types/database.ts` from Supabase MCP after future schema changes (`generate_typescript_types`)
