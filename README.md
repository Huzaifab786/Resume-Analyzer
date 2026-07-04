# Resume Analyzer

AI-powered web app that compares your resume to a job description and helps you improve the fit before you apply.

Upload a PDF resume, paste a job posting, and get a structured match report — score, skills gaps, ATS keywords, and improvement suggestions. Then regenerate a **job-specific resume** (PDF or editable Word) using professional templates you can edit before download.

**Repo:** [Huzaifab786/Resume-Analyzer](https://github.com/Huzaifab786/Resume-Analyzer)

---

## Features

- **Email auth** — Sign up / sign in with Supabase (verification + password reset)
- **Resume upload** — Save one PDF per user and reuse it across analyses
- **AI match analysis** — Google Gemini scores fit, skills, ATS keywords, and experience alignment
- **Daily limit** — 5 analyses per user per day (UTC)
- **Analysis history** — Filter, sort, and paginate past runs
- **Dashboard** — Stats, recent analyses, and match score trend
- **Tailored resume** — AI rewrite grounded in your real experience (no invented jobs)
- **Templates** — Classic, Modern, and Minimal layouts
- **Resume editor** — Fix AI output before export
- **Downloads** — PDF and editable Word (`.docx`)

---

## Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Auth / DB / Storage | Supabase |
| AI | Google Gemini (`gemini-2.5-flash`) |
| PDF text | `pdf-parse` |
| PDF export | `@react-pdf/renderer` |
| Word export | `docx` |
| UI | Tailwind CSS v4, shadcn/ui |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/Huzaifab786/Resume-Analyzer.git
cd Resume-Analyzer
git checkout dev
npm install
```

### 2. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `GEMINI_API_KEY` | Google AI Studio API key |

### 3. Database & storage

Run the SQL migrations in `supabase/migrations/` in order (Supabase SQL Editor or CLI):

1. `20260701183000_initial_schema.sql` — profiles, analyses, RLS, resumes bucket
2. `20260704120000_resume_templates.sql` — tailored content + template id
3. `20260704130000_tailored_resume_editor.sql` — content updated timestamp
4. `20260704140000_allow_docx_mime.sql` — allow Word uploads in storage (optional if downloads stream only)

Configure **Resend** (or another SMTP provider) in Supabase Auth for verification and password-reset emails.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # run production server
```

---

## App routes

| Route | Description |
| ----- | ----------- |
| `/` | Marketing homepage |
| `/login` | Sign in / sign up |
| `/dashboard` | Stats and recent activity |
| `/analyze` | New analysis (resume + job description) |
| `/analyze/[id]` | Match report, tailored resume editor & downloads |
| `/history` | Past analyses |

Protected routes require authentication (`/dashboard`, `/analyze`, `/history`).

---

## Branches

| Branch | Purpose |
| ------ | ------- |
| `main` | Production / deployment |
| `dev` | Active development (push day-to-day work here) |

```bash
# Daily work
git checkout dev
# ... commit changes ...
git push origin dev

# Release to production
git checkout main
git merge dev
git push origin main
```

---

## Project layout (high level)

```
app/                 # Pages and API routes
agent/               # AI analysis, PDF/Word generation, templates
components/          # UI (analyze, results, dashboard, history, layout)
lib/                 # Supabase clients, AI helper, dashboard/history queries
supabase/migrations/ # SQL schema and policies
types/               # Shared TypeScript types
```

---

## Notes

- Resume regeneration does **not** invent employers, titles, or degrees not supported by the original resume.
- Original uploaded resume is never overwritten; tailored files are stored per analysis.
- Do not commit `.env.local` or other secrets (see `.gitignore`).

---

## License

Private project — all rights reserved unless otherwise stated.
