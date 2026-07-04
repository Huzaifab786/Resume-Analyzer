# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 4 — Dashboard
**Last completed:** 13 Dashboard — Real Data
**Next:** (all planned features complete — polish / review as needed)

_Dashboard uses live Supabase aggregations via `lib/dashboard.ts`. Stat cards include icons._

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 Database Schema
- [x] 04 Supabase Clients + Middleware

### Phase 2 — Analyze Flow

- [x] 05 Analyze Page — Full UI
- [x] 06 Resume Upload
- [x] 07 AI Client Setup
- [x] 08 Analysis API + Agent

### Phase 3 — Results + History

- [x] 09 Analysis Result Page — Full UI
- [x] 10 History Page — Full UI + Logic
- [x] 11 Resume Regeneration

### Phase 4 — Dashboard

- [x] 12 Dashboard Page — Full UI
- [x] 13 Dashboard — Real Data

### Phase 5 — Resume Customization

- [x] 14 Resume Templates — Classic / Modern / Minimal picker + template registry
- [x] 15 Tailored Resume Editor — edit AI content before PDF export

---

## Decisions Made During Build

| Decision | Choice | Reason |
| -------- | ------ | ------ |
| Product name | Resume Analyzer | User decision |
| Backend | Supabase | Auth + DB + storage |
| AI provider | Google Gemini | User decision — free tier, good JSON |
| Auth | Email + password only | User decision — no OAuth |
| Email delivery | Resend (SMTP) | User decision — verification + reset emails |
| Guest mode | None — sign in required | User decision |
| Daily limit | 5 analyses/day (UTC) | User decision — abuse prevention |
| Resume handling | Saved on profile, reuse or upload new | User decision |
| Analytics | Supabase SQL only | No PostHog |
| Browser automation | None | Not needed |
| Tailored resume | Per-analysis PDF | Separate from saved resume |
| AI model ID | `gemini-2.5-flash` | `gemini-2.0-flash` has 0 free-tier quota on user's AI Studio key |
| Resume PDF approach | Content JSON + user-chosen template | User decision — AI cannot clone uploaded PDF layout pixel-perfect; templates + editor give control |
| Template launch set | classic, modern, minimal | User decision — 3 layouts at MVP |
| Tailor vs render | Split into two API steps | Editor needs saved content before PDF; re-render on template change without new AI call |

---

## Notes

_Feature 14–15 complete. Templates + editor on `/analyze/[id]`. APIs: `/api/resume/regenerate`, `/api/resume/content` (save edits), `/api/resume/render` (PDF from content + template). Migrations: `20260704120000_resume_templates.sql`, `20260704130000_tailored_resume_editor.sql` (apply in Supabase SQL Editor)._

**Features 12–13 complete** — Dashboard UI + real data. Tailored resume exports **PDF and Word (.docx)** via `agent/resume-docx.ts`; download `?format=pdf|docx`. Update files regenerates both formats._
