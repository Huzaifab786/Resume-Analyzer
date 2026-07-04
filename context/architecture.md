# Architecture

## Stack

| Layer              | Tool                     | Purpose                                      |
| ------------------ | ------------------------ | -------------------------------------------- |
| Framework          | Next.js 16 (App Router)  | Full stack framework                         |
| Auth + DB + Storage| Supabase                 | Auth, PostgreSQL, file storage, RLS          |
| AI model           | Google Gemini (free tier) | Analysis + resume tailoring, structured JSON |
| PDF text extraction| pdf-parse                | Extract text from uploaded resume PDF        |
| PDF generation     | @react-pdf/renderer      | Render tailored resume PDFs                  |
| Styling            | Tailwind CSS v4 + shadcn/ui | UI components and design tokens           |
| Language           | TypeScript strict        | Throughout                                   |

### Intentionally Excluded

| Tool        | Why excluded                                              |
| ----------- | --------------------------------------------------------- |
| Browserbase | No web browsing needed — analysis is text-in, text-out    |
| Stagehand   | Same — no browser automation in this product              |
| PostHog     | Dashboard stats computed from Supabase — no event pipeline needed for MVP |
| Adzuna      | No job discovery — user provides their own job description |

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   ├── progress-tracker.md
│   └── designs/                    → Google Stitch exports (reference only)
├── app/
│   ├── layout.tsx                  → Root layout, fonts, providers
│   ├── page.tsx                    → Homepage
│   ├── (auth)/
│   │   ├── login/page.tsx          → Email sign up / sign in
│   │   └── callback/route.ts       → Email confirmation callback
│   ├── dashboard/page.tsx          → Dashboard
│   ├── analyze/
│   │   ├── page.tsx                → New analysis form
│   │   └── [id]/page.tsx           → Analysis result detail
│   ├── history/page.tsx            → Past analyses list
│   └── api/
│       ├── analyze/route.ts        → Trigger AI analysis
│       └── resume/
│           ├── upload/route.ts     → Resume PDF upload + storage
│           ├── regenerate/route.ts → AI tailor + PDF (to be split: tailor + render)
│           ├── tailor/route.ts     → (planned) AI tailor only → stores content jsonb
│           └── render/route.ts     → (planned) PDF from edited content + templateId
├── agent/
│   ├── analyzer.ts                 → Core AI analysis logic
│   ├── tailor.ts                   → AI resume rewrite from suggestions
│   ├── resume-pdf.tsx              → PDF render entry (delegates to templates)
│   ├── resume-templates/           → (planned) classic, modern, minimal layouts
│   │   ├── index.ts
│   │   ├── classic.tsx
│   │   ├── modern.tsx
│   │   └── minimal.tsx
│   ├── extractor.ts                → PDF text extraction wrapper
│   └── types.ts                    → Agent-specific TypeScript types
├── actions/
│   ├── profile.ts                  → Profile / resume metadata updates
│   └── analyses.ts                 → Delete analysis, etc.
├── components/
│   ├── ui/                         → shadcn/ui components only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── homepage/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Features.tsx
│   ├── dashboard/
│   │   ├── StatsBar.tsx
│   │   ├── RecentAnalyses.tsx
│   │   └── ScoreTrendChart.tsx
│   ├── analyze/
│   │   ├── ResumeUpload.tsx
│   │   ├── JobDescriptionForm.tsx
│   │   └── AnalyzeButton.tsx
│   ├── analysis-result/
│   │   ├── MatchScoreHeader.tsx
│   │   ├── SkillsBreakdown.tsx
│   │   ├── AtsKeywords.tsx
│   │   ├── ExperienceAlignment.tsx
│   │   ├── ImprovementSuggestions.tsx
│   │   ├── TailoredResumeCard.tsx
│   │   ├── ResumeTemplatePicker.tsx  → (planned) template thumbnails + selection
│   │   └── TailoredResumeEditor.tsx  → (planned) section-based edit form
│   └── history/
│       ├── AnalysesTable.tsx
│       ├── AnalysesFilters.tsx
│       └── AnalysesPagination.tsx
├── lib/
│   ├── supabase-client.ts          → Browser Supabase client
│   ├── supabase-server.ts          → Server Supabase client
│   ├── ai.ts                       → Gemini client (lib/ai.ts)
│   └── utils.ts                    → Shared utilities, MATCH_THRESHOLD
├── middleware.ts                   → Auth guard for protected routes
└── types/
    └── index.ts                    → Global TypeScript types
```

---

## System Boundaries

| Folder        | Owns                                                                 |
| ------------- | -------------------------------------------------------------------- |
| `app/`        | Pages and API routes only. No business logic.                          |
| `agent/`      | AI analysis and PDF extraction. No React, no direct HTTP responses.  |
| `actions/`    | Server Actions for UI-triggered mutations only.                        |
| `components/` | UI only. No data fetching logic. No direct DB calls.                   |
| `lib/`        | Third-party client initialization and shared utilities only.         |
| `types/`      | TypeScript types shared across the project.                           |

---

## Data Flow

### UI Mutations (Server Actions)

```
User interaction in component
        ↓
Server Action in actions/
        ↓
Supabase DB write
        ↓
revalidatePath or redirect
```

### Resume Upload (API Route)

```
User drops PDF on /analyze
        ↓
POST /api/resume/upload
        ↓
Validate file type + size
        ↓
Upload buffer to Supabase Storage (resumes/{user_id}/resume.pdf)
        ↓
Update profiles.resume_pdf_url + resume_filename
        ↓
Return { success, url, filename }
```

### Analysis (API Route)

```
User clicks Analyze on /analyze
        ↓
POST /api/analyze { jobDescription, jobTitle?, company? }
        ↓
Load resume from Supabase Storage (or use uploaded file in request)
        ↓
pdf-parse extracts resume text
        ↓
agent/analyzer.ts calls AI API with resume text + job description
        ↓
Structured JSON result validated with Zod
        ↓
Insert row into analyses table
        ↓
Return { success, analysisId }
        ↓
Client redirects to /analyze/[id]
```

### Resume Regeneration (API Route) — current + planned

**Current (Feature 11):** single-step AI tailor + PDF render in one request.

**Planned (Features 14–15):** two-step flow with template selection and user editing.

```
User clicks Regenerate Resume on /analyze/[id]
        ↓
POST /api/resume/tailor { analysisId }
        ↓
Load analysis row + original resume text from Storage
        ↓
agent/tailor.ts — AI rewrites resume content
        ↓
Structured TailoredResume JSON validated with Zod
        ↓
Save to analyses.tailored_resume_content
Set tailored_resume_status = content_ready (or keep pending until PDF)
        ↓
UI shows Resume Editor + Template Picker
        ↓
User edits fields (optional) and selects templateId
        ↓
POST /api/resume/render { analysisId, templateId, content? }
        ↓
agent/resume-templates/[templateId] — renderToBuffer() → PDF
        ↓
Upload to resumes/{user_id}/tailored/{analysis_id}.pdf
        ↓
Update analyses: tailored_resume_status, tailored_resume_path,
                resume_template_id, changes_applied, tailored_at
        ↓
Return signed download URL
```

**Backward compatibility:** `POST /api/resume/regenerate` may remain as convenience wrapper (tailor + default template render) until UI fully migrates.

### Dashboard Stats (Server Component)

```
/dashboard page loads
        ↓
createSupabaseServer() + getUser()
        ↓
SQL aggregations on analyses table for current user_id
        ↓
Render stats cards + recent list — no external analytics service
```

---

## Supabase Database Schema

### `profiles`

| Column           | Type        | Notes                              |
| ---------------- | ----------- | ---------------------------------- |
| id               | uuid        | References auth.users (PK)         |
| email            | text        | From auth                          |
| full_name        | text        | From sign-up form or email prefix   |
| resume_pdf_url   | text        | Supabase Storage public/signed URL |
| resume_filename  | text        | Original upload filename           |
| created_at       | timestamptz |                                    |
| updated_at       | timestamptz |                                    |

### `analyses`

| Column           | Type        | Notes                                    |
| ---------------- | ----------- | ---------------------------------------- |
| id               | uuid        | PK, default gen_random_uuid()            |
| user_id          | uuid        | References profiles, RLS scoped          |
| job_title        | text        | Optional — user-provided                 |
| company          | text        | Optional — user-provided                 |
| job_description  | text        | Full pasted JD text                      |
| match_score      | integer     | 0–100 overall fit score                  |
| result           | jsonb       | Full structured AI output (see below)    |
| status               | text        | pending / completed / failed             |
| error_message        | text        | Set when status = failed                 |
| tailored_resume_status | text      | null / pending / content_ready / completed / failed |
| tailored_resume_path | text        | Storage path when PDF generated            |
| tailored_resume_content | jsonb     | Structured TailoredResume — AI output + user edits |
| resume_template_id   | text        | classic / modern / minimal — last render choice |
| changes_applied      | jsonb       | Summary of edits made during AI tailoring    |
| tailored_at          | timestamptz | When tailored PDF was last generated       |
| tailored_content_updated_at | timestamptz | (planned) When user last saved editor changes |
| created_at           | timestamptz |                                          |

### `result` jsonb shape

```json
{
  "matchSummary": "string",
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "niceToHaveSkills": ["string"],
  "atsKeywords": {
    "found": ["string"],
    "missing": ["string"],
    "matchPercentage": 0
  },
  "experienceAlignment": {
    "summary": "string",
    "strengths": ["string"],
    "gaps": ["string"]
  },
  "improvementSuggestions": ["string"]
}
```

---

## Supabase Storage

| Bucket   | Path                                           | Contents                    |
| -------- | ---------------------------------------------- | --------------------------- |
| resumes  | resumes/{user_id}/resume.pdf                   | Original uploaded resume    |
| resumes  | resumes/{user_id}/tailored/{analysis_id}.pdf   | Job-specific tailored PDF   |

- Bucket is **private** — use signed URLs or server-side download only
- RLS: users can read/write only their own path
- Max file size: 5 MB
- Accepted type: `application/pdf` only

---

## Authentication

- Provider: Supabase Auth
- Method: **Email + password only** (no OAuth providers)
- Email delivery: **Resend** configured as custom SMTP in Supabase Dashboard
- Email confirmation required before first analysis
- Login page includes **Resend verification email** for unverified accounts
- Protected routes: `/dashboard`, `/analyze`, `/analyze/[id]`, `/history`
- Public routes: `/`, `/login`
- Middleware checks session on every protected route — unauthenticated users redirect to `/login`
- On login → redirect to `/dashboard`
- **No guest mode** — analysis API routes return `401` without valid session

---

## Daily Analysis Limit

```typescript
// lib/utils.ts
export const DAILY_ANALYSIS_LIMIT = 5;
```

Enforced in `POST /api/analyze` before creating analysis row:

```typescript
const startOfDay = new Date();
startOfDay.setUTCHours(0, 0, 0, 0);

const { count } = await supabase
  .from("analyses")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .gte("created_at", startOfDay.toISOString());

if (count >= DAILY_ANALYSIS_LIMIT) {
  return NextResponse.json(
    { success: false, error: "Daily limit reached. You can run 5 analyses per day." },
    { status: 429 },
  );
}
```

- `POST /api/resume/regenerate` is **not** subject to this limit
- UI shows remaining count on `/analyze`

---

## Supabase Client Pattern

Two separate clients — never mix them:

```typescript
// lib/supabase-client.ts — browser only
import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

```typescript
// lib/supabase-server.ts — server only
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

---

## AI Analysis Pattern

```typescript
// agent/analyzer.ts — text in, structured JSON out
export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
  company?: string,
): Promise<AnalysisResult> {
  const response = await ai.chat({
    system: ANALYSIS_SYSTEM_PROMPT,
    user: buildAnalysisPrompt(resumeText, jobDescription, jobTitle, company),
    responseFormat: "json",
    temperature: 0.3,
  });
  return analysisResultSchema.parse(JSON.parse(response));
}
```

No browser, no external job APIs — the AI receives only resume text and job description text.

---

## Dashboard Analytics (No PostHog)

All dashboard metrics are SQL queries against `analyses`:

```sql
-- Total analyses
SELECT COUNT(*) FROM analyses WHERE user_id = $1 AND status = 'completed';

-- Average match score
SELECT AVG(match_score) FROM analyses WHERE user_id = $1 AND status = 'completed';

-- Analyses this week
SELECT COUNT(*) FROM analyses
WHERE user_id = $1 AND status = 'completed'
  AND created_at >= NOW() - INTERVAL '7 days';

-- Score trend (last 30 days, grouped by day)
SELECT DATE(created_at) AS day, AVG(match_score) AS avg_score
FROM analyses
WHERE user_id = $1 AND status = 'completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY day ORDER BY day;
```

If product analytics are needed later, consider **Vercel Analytics** (page views, zero config on Vercel) or **Umami** (self-hosted, privacy-friendly). Not required for MVP.

---

## Invariants

- API routes contain no UI logic. Components contain no DB logic.
- Agent code in `/agent` never imports from `/components` or `/actions`.
- Server Actions never call agent functions directly — agent runs only from API routes.
- All server-side Supabase writes use `createSupabaseServer()` — never the browser client.
- No hardcoded hex values or raw Tailwind color classes — use CSS variables from ui-tokens.md.
- Every analysis attempt creates an `analyses` row — set `status: failed` with `error_message` on failure, never silent drops.
- Always scope Supabase queries to `user_id` — never query without user filter.
- Resume PDF never processed client-side — extraction, AI, and PDF rendering are server-only.
- AI provider and model configured in one place (`lib/ai.ts`) — never hardcode model strings in components.
- **Resume regeneration never invents experience** — AI may rephrase, reorder, and add ATS keywords only where truthful against the original resume. Never add fake jobs, degrees, employers, or skills.
- Original resume at `resumes/{user_id}/resume.pdf` is never overwritten by regeneration — tailored PDFs always go to the `tailored/{analysis_id}.pdf` path.
- PDF generation only via `@react-pdf/renderer` in API routes — never in client components.
- `DAILY_ANALYSIS_LIMIT` is always imported from `lib/utils.ts` — never hardcode `5`.
- Unauthenticated requests to `/api/analyze` and `/api/resume/*` always return `401`.
