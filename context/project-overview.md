# Project Overview

## About the Project

**Resume Analyzer** is a full-stack web app that helps job seekers understand how well their resume fits a specific job description. The user uploads a resume (PDF), pastes or types a job description, and the app uses **Google Gemini** (free tier) to produce a structured match report — overall score, matched skills, gaps, ATS keyword coverage, and actionable improvement suggestions.

Results are saved to the user's history so they can compare analyses over time and track progress from the dashboard. Users must **sign in with email** before analyzing — there is no guest mode.

---

## The Problem It Solves

Applying to jobs without knowing how your resume reads against a specific posting wastes time. Candidates guess whether they're qualified, miss keywords ATS systems filter on, and don't know what to improve before submitting.

Resume Analyzer gives instant, specific feedback for one resume and one job description at a time. The user walks away knowing their match score, what's strong, what's missing, and what to change — then can **regenerate a tailored resume PDF** that applies those suggestions for that specific role, without replacing their original upload.

---

## Pages

```
/                  → Homepage (marketing)
/login             → Email sign up / sign in + resend verification
/dashboard         → Stats, recent analyses, quick actions
/analyze           → New analysis — resume + job description (auth required)
/analyze/[id]      → Full analysis result for one run
/history           → Paginated list of all past analyses
```

---

## Navigation

Top navbar. Clean and minimal. Three navigation items when logged in:

```
Dashboard    Analyze    History
```

Full-width layout on all pages. No sidebar.

---

## Core User Flow

### Homepage

- Hero section explaining resume vs job description matching
- How it works — 4 steps: Upload resume → Paste job description → Get AI report → **Pick a template, edit, and download tailored resume**
- Features section
- Footer
- Logged-in users clicking CTA → `/dashboard`
- Logged-out users clicking CTA → `/login`

### Onboarding

- User signs up with **email + password** via Supabase Auth
- Verification email sent via **Resend** (configured as Supabase SMTP)
- User can click **Resend verification email** on login page if needed
- On verified login → redirect to `/dashboard`
- Dashboard shows a getting-started card if user has zero analyses
- **No guest access** — `/analyze` and all app routes require authentication

### New Analysis (`/analyze`)

- **Daily limit banner** — "X of 5 analyses remaining today" (resets midnight UTC)
- If limit reached — Analyze button disabled with message to return tomorrow
- **Resume section**
  - If user has a **saved resume** on profile:
    - Show saved state: "Using your saved resume: `filename.pdf`"
    - Toggle or buttons: **Keep saved resume** | **Upload new**
  - If no saved resume — drag-and-drop upload required
  - Drag-and-drop PDF upload (max 5 MB), PDF only
  - Uploading new resume saves it to profile (replaces previous saved file)
  - Show filename + replace option after upload
- **Job description section**
  - Large textarea — paste full job posting
  - Optional fields: Job title, Company name (helps AI context, not required)
  - Character count indicator
- **Analyze button** — disabled until resume is ready and job description has minimum length (e.g. 100 chars)
- Loading state with progress message while AI runs
- On success → redirect to `/analyze/[id]`

### Analysis Result (`/analyze/[id]`)

- **Header** — job title, company (if provided), date analyzed, overall match score (large, color-coded)
- **Match summary** — AI paragraph explaining the overall fit
- **Skills breakdown**
  - Matched skills — green badges
  - Missing / weak skills — orange badges
  - Nice-to-have skills mentioned in JD but not required — gray badges
- **ATS keyword analysis**
  - Keywords found in resume — green list
  - Keywords missing from resume — red/orange list
  - Keyword match percentage
- **Experience alignment** — how years, titles, and industries line up with JD requirements
- **Improvement suggestions** — numbered, actionable bullets
- **Tailored resume section**
  - Empty state with **Regenerate Resume** button
  - Loading state: "Applying suggestions…" → "Building your resume…"
  - **Template picker** — user chooses a resume layout before final PDF (Classic, Modern, Minimal)
  - **Resume editor** — after AI generates tailored content, user can review and edit all fields (name, summary, skills, experience bullets, education) before downloading
  - After user confirms template + edits: generate PDF, download button, summary of changes applied
  - Regeneration does **not** count toward the daily analysis limit
  - Original saved resume is never overwritten — tailored PDF stored per analysis
- **Actions**
  - Regenerate Resume (primary when suggestions exist)
  - Analyze another job → `/analyze`
  - Delete this analysis

### History (`/history`)

- Table or card list of all past analyses
- Columns: Job title, Company, Match score, Resume tailored (badge yes/no), Date, Actions (View / Delete)
- Filter: All / Strong match (≥70) / Needs work (<70)
- Sort: Newest / Oldest / Highest score
- Pagination — 20 per page
- Empty state with CTA to `/analyze`

### Dashboard

- **Stats bar** — 5 cards (computed from Supabase):
  - Total Analyses
  - Average Match Score
  - Best Match Score
  - Resumes Regenerated
  - Analyses This Week
- **Recent activity** — last 5–10 analyses with score badge and time ago
- **Quick action** — prominent "New Analysis" button
- **Score trend** — average match score over last 30 days from DB data

---

## Data Architecture

### Resume Storage

- One **saved resume** per user in Supabase Storage: `resumes/{user_id}/resume.pdf`
- `profiles.resume_pdf_url` and `profiles.resume_filename` track the current saved file
- Persists across sessions — user does not re-upload every visit unless they choose to
- Uploading a new PDF on `/analyze` updates the saved resume (upsert)
- Resume text extracted server-side per analysis — not stored long-term as raw text

### Analysis Results

- Each run creates one row in `analyses` table
- Full structured AI output in `analyses.result` jsonb
- Job description in `analyses.job_description`
- Report immutable after creation — user can delete but not edit

### Tailored Resume Storage

- Saved resume: `resumes/{user_id}/resume.pdf` — never overwritten by regeneration
- Tailored per analysis: `resumes/{user_id}/tailored/{analysis_id}.pdf`
- `analyses.tailored_resume_path`, `tailored_resume_status`, `changes_applied`
- `analyses.tailored_resume_content` jsonb — editable structured resume (AI output + user edits)
- `analyses.resume_template_id` text — selected template when PDF was last rendered (e.g. `classic`, `modern`, `minimal`)

### Daily Analysis Limit

- **5 new analyses per user per day** (UTC midnight reset)
- Count rows in `analyses` where `user_id = current user` and `created_at >= start of UTC day`
- Pending + completed analyses both count toward limit
- Failed analyses count toward limit (prevents abuse)
- Resume regeneration does **not** count toward the 5/day cap
- Enforced server-side in `POST /api/analyze` — returns `429` when exceeded

---

## Features In Scope

- Homepage with hero, how it works, features, footer
- Top navbar — Dashboard, Analyze, History
- **Email + password authentication** via Supabase (no OAuth)
- **Resend** for auth emails (verification, password reset)
- **Resend verification email** action on login page
- **Sign-in required** for all analysis features — no guest mode
- Saved resume on profile — reuse or upload new on each analysis
- Resume PDF upload to Supabase Storage
- Job description textarea with optional title/company fields
- **Google Gemini** for AI analysis and resume tailoring
- **Daily limit: 5 analyses per user per day**
- PDF text extraction via `pdf-parse`
- Structured match report on analysis result page
- Resume regeneration — tailored PDF via `@react-pdf/renderer`
- **Resume templates** — user-selectable PDF layouts (Classic, Modern, Minimal)
- **Tailored resume editor** — review and edit AI-generated resume content before PDF export
- Analysis history with filter, sort, pagination
- Dashboard with stats and recent activity
- Delete analysis
- Row Level Security on all tables
- Protected routes via middleware
- **Dark mode** — system preference + manual toggle, implemented via CSS tokens (not in Stitch designs)

---

## Features Out of Scope

- Google / GitHub / social OAuth
- Guest or anonymous analysis without sign-in
- Job board / job discovery APIs
- Browser automation (Browserbase, Stagehand)
- Cover letter generation
- Replacing saved resume with tailored PDF automatically
- Full drag-and-drop WYSIWYG resume builder (scoped editor for tailored content only — see Features In Scope)
- Auto re-scoring after regeneration
- Team or multi-user accounts
- Marketing email campaigns (Resend is auth emails only for MVP)
- Payment or subscription
- Mobile app
- Browser extension
- External analytics (PostHog, etc.)
- Resume parsing into editable profile form (global profile — tailored resume editing per analysis is in scope)

---

## Target User

A job seeker who:

- Has a resume PDF ready to upload
- Finds a specific job posting they want to apply to
- Wants fast, honest feedback on fit before applying
- Wants to track how different roles score against the same resume
- Is comfortable signing up with email

---

## Success Criteria

- User can sign up with email, verify, upload resume, analyze a JD, and see results in under 2 minutes
- Saved resume persists and can be reused without re-uploading
- Daily limit enforced correctly at 5 analyses per day
- Unauthenticated users cannot access `/analyze` or API routes
- Match scores and reasoning feel accurate and specific to the pasted JD
- Regenerated resume honestly applies suggestions — no invented experience
- App works on free-tier Supabase + Gemini free tier + Resend free tier
