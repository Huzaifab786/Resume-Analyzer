# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is wired step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 1 — Foundation

### 01 Homepage

Build the complete homepage UI.

**UI:**

- Navbar — logo, Dashboard / Analyze / History links (hidden or login CTA when logged out), Sign in button
- Hero — headline, subheadline, "Analyze My Resume" CTA
- How it works — 4 steps with icons
- Features section — match score, ATS keywords, improvement tips
- Bottom CTA
- Footer

**Logic:**

- CTA → `/login` if not authenticated, `/analyze` if authenticated

---

### 02 Auth

Supabase email authentication + Resend for transactional emails.

**UI:**

- Login page — email + password fields
- Tabs: **Sign In** | **Sign Up**
- Sign up: email, password, confirm password
- "Resend verification email" link
- "Forgot password?" link
- Brief product tagline

**Logic:**

- Email sign up via `supabase.auth.signUp()`
- Email sign in via `supabase.auth.signInWithPassword()`
- Resend verification via `supabase.auth.resend({ type: 'signup', email })`
- Password reset via `supabase.auth.resetPasswordForEmail()`
- Resend configured as Supabase custom SMTP
- Auth callback at `/auth/callback`
- Session via `@supabase/ssr`
- Middleware protecting `/dashboard`, `/analyze`, `/analyze/[id]`, `/history`
- Unauthenticated `/analyze` → redirect `/login`
- After login → redirect to `/dashboard`

---

### 03 Database Schema

All Supabase tables, storage bucket, and RLS policies before any data writes.

**Logic:**

- Create `profiles` table (see architecture.md)
- Create `analyses` table with `result` jsonb
- Create `resumes` storage bucket (private)
- RLS on `profiles` — users read/update own row only
- RLS on `analyses` — users CRUD own rows only
- Storage policy — users upload/read own `resumes/{user_id}/` path only
- Trigger: on `auth.users` insert → create matching `profiles` row

---

### 04 Supabase Clients + Middleware

**Logic:**

- Create `lib/supabase-client.ts`
- Create `lib/supabase-server.ts`
- Create `middleware.ts` with session refresh + route protection
- Verify auth flow end-to-end before building features

---

## Phase 2 — Analyze Flow

### 05 Analyze Page — Full UI

Build `/analyze` page UI with mock state. No API logic yet.

**UI:**

- Daily limit banner — "X of 5 analyses remaining today"
- If limit reached — disabled Analyze button + message
- Resume card with two modes:
  - **Saved resume exists:** show filename, "Keep saved resume" selected by default, option to upload new
  - **No saved resume:** drag-and-drop upload required
- Job description card — optional Job Title + Company, large textarea, character count
- Analyze button (primary)
- Loading overlay mock state

---

### 06 Resume Upload

Wire resume upload to Supabase Storage.

**Logic:**

- POST `/api/resume/upload` accepts multipart PDF
- Validate: `application/pdf`, max 5 MB
- Upload to `resumes/{user_id}/resume.pdf` with upsert
- Update `profiles.resume_pdf_url` and `resume_filename`
- Return filename + success to client
- Pre-fill upload area on return visits if resume exists

---

### 07 AI Client Setup

Configure Google Gemini before analysis feature.

**Logic:**

- Create `lib/ai.ts` — Gemini client using `@google/generative-ai`
- Model: `gemini-2.0-flash`
- Create `agent/types.ts` — `AnalysisResult` type + Zod schema
- Add `DAILY_ANALYSIS_LIMIT = 5` to `lib/utils.ts`
- Environment: `GEMINI_API_KEY`
- Smoke test: simple JSON response from Gemini

---

### 08 Analysis API + Agent

Core product feature — resume vs job description AI analysis.

**UI:**

- Wire Analyze button to call API
- Loading state: "Reading your resume…" → "Analyzing match…"
- On success → redirect to `/analyze/[id]`
- On error → show human-readable message, keep form data

**Logic:**

- POST `/api/analyze` — body: `{ jobDescription, jobTitle?, company?, useSavedResume?: boolean }`
- Auth required — `401` if no session
- **Check daily limit** — `429` if user already has 5 analyses today (UTC)
- If `useSavedResume` (default true when saved resume exists): download from Storage
- If new file uploaded in same session: use uploaded file (already saved via upload route)
- If text empty → return error: "Could not read text from this PDF. Try a text-based PDF."
- If job description < 100 chars → return validation error
- Insert `analyses` row with `status: pending`
- Call `agent/analyzer.ts` with resume text + JD
- On success: update row with `match_score`, `result`, `status: completed`
- On failure: update row with `status: failed`, `error_message`
- Return `{ success: true, analysisId }`

---

## Phase 3 — Results + History

### 09 Analysis Result Page — Full UI

Build `/analyze/[id]` with mock result data first, then wire real DB data.

**UI:**

- Back link → History
- Header — job title, company, date, large match score with color ring
- Match summary card — AI paragraph
- Skills breakdown — matched (green), missing (orange), nice-to-have (gray) badge groups
- ATS keywords card — found vs missing lists, percentage bar
- Experience alignment card — summary + strengths/gaps bullets
- Improvement suggestions — numbered list
- **Tailored Resume card** — empty state with "Regenerate Resume" button; generated state with download + changes-applied list (mock both states)
- Footer actions — "Analyze Another", Delete (with confirm dialog)

**Logic:**

- Server Component loads analysis by id, scoped to current user
- 404 if not found or wrong user
- Delete via Server Action in `actions/analyses.ts`

---

### 10 History Page — Full UI + Logic

**UI:**

- Page title: "Analysis History"
- Filter dropdown: All / Strong Match (≥70) / Needs Work (<70)
- Sort dropdown: Newest / Oldest / Highest Score
- Table: Job Title, Company, Match Score (bar + %), Date, View link
- Pagination — 20 per page
- Empty state → CTA to Analyze

**Logic:**

- Query `analyses` for current user with filter/sort/pagination
- Row click → `/analyze/[id]`

---

### 11 Resume Regeneration

AI rewrites the resume using analysis suggestions and renders a job-specific PDF. This is the core "action" feature — turning feedback into a downloadable artifact.

**UI:**

- Wire **Regenerate Resume** button on analysis result page
- Loading state with staged messages: "Applying suggestions…" → "Building PDF…"
- Success state in Tailored Resume card:
  - Download PDF button (signed URL)
  - "Regenerate again" ghost button
  - Changes applied list — bullets from `changes_applied` jsonb (e.g. "Added ATS keywords: GraphQL, CI/CD", "Rewrote summary for frontend focus")
- Error state — human-readable message, retry button
- History table — "Tailored" badge when `tailored_resume_status = completed`

**Logic:**

- POST `/api/resume/regenerate` — body: `{ analysisId }`
- Auth required — verify analysis belongs to current user and `status = completed`
- Download original resume PDF → extract text (or use cached extraction if stored — optional)
- Call `agent/tailor.ts` with:
  - original resume text
  - `job_description`, `job_title`, `company`
  - full `result` jsonb (suggestions, missing skills, ATS keywords)
- AI returns structured resume JSON (see library-docs.md)
- Validate with Zod — reject if AI added employers/roles not in original
- `agent/resume-pdf.tsx` renders PDF with `renderToBuffer()`
- Upload to `resumes/{user_id}/tailored/{analysis_id}.pdf` with upsert
- Update `analyses`: `tailored_resume_status: completed`, `tailored_resume_path`, `changes_applied`, `tailored_at`
- On failure: set `tailored_resume_status: failed`, return error
- Return signed download URL (short expiry) + `changes_applied`
- `revalidatePath('/analyze/[id]')` after success

**AI rules (enforced in system prompt + validation):**

- Never invent jobs, companies, degrees, or skills not supported by original resume
- May rephrase bullets, reorder sections, strengthen summary, weave in missing ATS keywords where honestly applicable
- Frame skill gaps using adjacent experience — do not claim expertise user lacks

---

## Phase 4 — Dashboard

### 12 Dashboard Page — Full UI

Build dashboard with mock data first.

**UI:**

- Getting started card (if zero analyses) — 3 steps + "Start First Analysis" CTA
- Stats bar — 5 cards: Total Analyses, Avg Match Score, Best Match, Resumes Regenerated, This Week
- Recent analyses list — last 5 with score badge and relative time
- Score trend chart — line chart, last 30 days (mock then real)
- "New Analysis" primary button in header area

---

### 13 Dashboard — Real Data

Wire all dashboard sections to Supabase.

**Logic:**

- Stats from SQL aggregations on `analyses` (see architecture.md)
- Add **Resumes Regenerated** stat — COUNT where `tailored_resume_status = completed`
- Recent list — last 5 completed analyses ordered by `created_at DESC`
- Score trend — daily `AVG(match_score)` last 30 days, render with recharts
- Empty states when no data
- Hide getting-started card after first completed analysis

---

## Phase 5 — Resume Customization

User-requested enhancement: stop relying on a single hard-coded PDF layout. Let users pick a template and edit AI output before export so the final resume matches their expectations.

### 14 Resume Templates

Multiple PDF layouts the user can choose when generating a tailored resume.

**UI:**

- Template picker on analysis result page — shown after AI tailoring completes (before or alongside editor)
- 3 templates at launch:
  - **Classic** — serif, centered header, two-column employment/education dates (matches traditional CV style)
  - **Modern** — sans-serif, left-aligned, compact single-column sections
  - **Minimal** — clean sans-serif, generous whitespace, simplified sections
- Each option shows a small preview thumbnail + short label
- Selected template highlighted; persists per analysis (`resume_template_id`)
- Default template: **Classic**

**Logic:**

- Refactor `agent/resume-pdf.tsx` into template registry pattern:
  - `agent/resume-templates/classic.tsx`
  - `agent/resume-templates/modern.tsx`
  - `agent/resume-templates/minimal.tsx`
  - `agent/resume-templates/index.ts` — `getResumeTemplate(id)` + `RESUME_TEMPLATE_IDS`
- All templates consume the same `TailoredResume` JSON shape from `agent/types.ts`
- PDF render route accepts `templateId` — validate against allowed IDs
- Re-render PDF when user changes template (no new AI call — same content, different layout)

---

### 15 Tailored Resume Editor

Structured editor so users can fix or tweak AI output before downloading the PDF.

**UI:**

- **Editor panel** on `/analyze/[id]` inside Tailored Resume card (or expandable section below it)
- Opens after first successful AI tailor (or when returning to an analysis that already has `tailored_resume_content`)
- Section-based form matching `TailoredResume` schema:
  - Header: full name, headline, email, phone, address
  - Personal details + links (add/remove rows)
  - Profile / summary (textarea)
  - Skills (name + optional level, add/remove)
  - Experience (company, title, dates, location, company description, bullets — add/remove)
  - Education (degree, institution, dates, location — add/remove)
- **Live preview** optional for v1 — at minimum show "last saved" state + Download
- Actions:
  - **Save edits** — persists `tailored_resume_content` to DB (no PDF yet)
  - **Generate PDF** / **Update PDF** — renders with selected template, uploads PDF, enables download
  - **Regenerate with AI** — re-runs tailor agent (warns that manual edits may be overwritten unless user confirms)
- Validation messages inline (required fields, empty bullets allowed but warned)

**Logic:**

- Split resume flow into two steps:
  1. **Tailor (AI)** — `POST /api/resume/tailor` or extend regenerate: returns + stores `tailored_resume_content`, sets status `draft` or `content_ready`
  2. **Render (PDF)** — `POST /api/resume/render` — body: `{ analysisId, templateId, content? }` — uses saved or submitted content, renders PDF, sets `tailored_resume_status: completed`
- Store edited content in `analyses.tailored_resume_content` jsonb (full `TailoredResume` minus internal-only fields if any)
- Store `analyses.resume_template_id` on each render
- User edits never sent back to AI unless user explicitly clicks Regenerate with AI
- Zod validate content on save and render — same rules as AI output (no inventing employers server-side beyond what user types)
- `changes_applied` still populated from AI on tailor step; optional `user_edited: true` flag or separate timestamp `tailored_content_updated_at`

**Why this solves the design mismatch:**

- AI only rewrites **content** (JSON), not pixel-perfect layout cloning from uploaded PDF
- User picks the **visual template** they want
- User **corrects** anything the AI got wrong before export

---

## Feature Count

| Phase                       | Features |
| --------------------------- | -------- |
| Phase 1 — Foundation        | 4        |
| Phase 2 — Analyze Flow      | 4        |
| Phase 3 — Results+History   | 3        |
| Phase 4 — Dashboard         | 2        |
| Phase 5 — Resume Customization | 2     |
| **Total**                   | **15**   |
