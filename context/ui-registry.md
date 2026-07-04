# UI Registry

Living document. Updated after every component is built.

---

## How to Use

1. Check if a similar component exists here
2. If yes — match its exact classes
3. If no — build following ui-rules.md and ui-tokens.md, then add here

---

## Baseline — Established 2026-07-01

| Property         | Correct class                                      |
| ---------------- | -------------------------------------------------- |
| Page background  | `bg-background`                                    |
| Card background  | `bg-surface`                                       |
| Card border      | `border border-border`                             |
| Card radius      | `rounded-2xl`                                      |
| Card shadow      | `shadow-card`                                      |
| Card hover shadow| `shadow-card-hover`                                |
| Glass default    | `glass`                                            |
| Glass navbar     | `glass-strong`                                     |
| Glass badge      | `glass-subtle`                                     |
| Glass dark panel | `glass-dark`                                       |
| Card padding     | `p-6`                                              |
| Button primary   | `bg-accent text-accent-foreground hover:bg-accent-dark` |
| Button outline   | `variant="outline" border-border bg-surface`       |
| Text primary     | `text-text-primary`                                |
| Text secondary   | `text-text-secondary`                              |
| Text muted       | `text-text-muted`                                  |
| Text dark (nav)  | `text-text-dark`                                   |
| Icon container   | `size-10 rounded-lg bg-accent-light` + `text-accent-dark` icon |
| Section padding  | `px-8 py-16 md:py-24`                              |
| Max width        | `max-w-[1440px] mx-auto`                           |
| Navbar height    | `h-16`                                             |

**Motion:** Use `FadeIn`, `Stagger`/`StaggerItem`, `HoverLift`, `Float` from `components/motion/`. Presets from `lib/motion.ts`. Always respect `prefers-reduced-motion`.

---

## Components

### Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-07-01 (revamp)

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `glass-strong`                                     |
| Border           | via glass utility                                  |
| Border radius    | none                                               |
| Text — primary   | `text-text-primary` (logo)                         |
| Text — secondary | `text-text-dark` (links)                           |
| Spacing          | `h-16 px-8`, inner `max-w-[1440px]`                |
| Hover state      | `hover:text-accent`, link underline via `after:`   |
| Shadow           | none on header; CTA uses `shadow-card`             |
| Accent usage     | logo icon bg `bg-accent-light`, CTA `bg-accent`    |

**Pattern notes:**
Client component with Framer Motion entrance (`y: -16 → 0`). Sticky glass navbar. Button hover scale via `hoverScale` preset. Nav links animate underline on hover.

---

### Footer

File: components/layout/Footer.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                       |
| Border           | `border-t border-border`                           |
| Border radius    | none                                               |
| Text — primary   | `text-text-primary` (column titles)                |
| Text — secondary | `text-text-secondary` (links)                      |
| Spacing          | `px-8 py-12`, column gap `gap-8`                   |
| Hover state      | `hover:text-accent` on links                       |
| Shadow           | none                                               |
| Accent usage     | none on container                                  |

**Pattern notes:**
Four-column grid on desktop. Copyright row separated with `border-t border-border mt-12 pt-8`.

---

### Hero

File: components/homepage/Hero.tsx
Last updated: 2026-07-01 (revamp)

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-background` + `HeroBackground` orbs            |
| Border           | none                                               |
| Border radius    | badge `rounded-full`                               |
| Text — primary   | `text-text-primary`, headline `text-4xl md:text-5xl lg:text-[48px] font-bold` |
| Text — secondary | `text-text-secondary` (subheadline, badge)         |
| Spacing          | `px-8 py-16 md:py-24`, content gap `gap-6`         |
| Hover state      | button scale via Framer Motion `hoverScale`        |
| Shadow           | CTAs use `shadow-card`                             |
| Accent usage     | `text-accent` on headline emphasis, orbs `bg-accent-muted/40` |

**Pattern notes:**
Client component. Staggered `FadeIn` on copy blocks. Badge uses `glass-subtle`. Secondary CTA uses `glass`. Decorative blur orbs in `HeroBackground.tsx`.

---

### HeroPreview (mock card)

File: components/homepage/HeroPreview.tsx
Last updated: 2026-07-01 (revamp)

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `glass`                                            |
| Border           | via glass utility                                  |
| Border radius    | `rounded-2xl`                                      |
| Text — primary   | `text-text-primary`                                |
| Text — secondary | `text-text-secondary`, `text-text-muted`           |
| Spacing          | `p-6`, inner `space-y-6`                           |
| Hover state      | none — wrapped in `Float` for gentle bob           |
| Shadow           | `shadow-card`                                      |
| Accent usage     | progress bars `bg-accent`, `bg-info` — animated width on scroll |

**Pattern notes:**
Wrapped in `Float` component. Chrome bar uses `glass-subtle`. Progress bars animate via Framer Motion `whileInView`.

---

### Motion Components

Files: `components/motion/FadeIn.tsx`, `HoverLift.tsx`, `Float.tsx`, `Stagger.tsx`
Presets: `lib/motion.ts`

| Component   | Purpose                          |
| ----------- | -------------------------------- |
| `FadeIn`    | Scroll-triggered fade + slide up |
| `HoverLift` | Card hover `y: -4`               |
| `Float`     | Infinite gentle vertical bob     |
| `Stagger`   | Parent container for stagger     |
| `StaggerItem` | Child item in stagger grid     |

---

### HowItWorks

File: components/homepage/HowItWorks.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | section `bg-surface-secondary`, cards `bg-surface` |
| Border           | cards `border border-border`                       |
| Border radius    | `rounded-2xl` on cards                             |
| Text — primary   | `text-text-primary` (headings)                     |
| Text — secondary | `text-text-secondary` (descriptions)               |
| Spacing          | cards `p-6`, grid `gap-6`                          |
| Hover state      | none                                               |
| Shadow           | `shadow-card` on step cards                        |
| Accent usage     | step label `text-accent`, icon container `bg-accent-light` |

**Pattern notes:**
Section id `how-it-works` for anchor links. Four-column grid on lg. Step number as `text-xs font-medium text-accent`.

---

### Features

File: components/homepage/Features.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-background` section, `bg-surface` cards        |
| Border           | `border border-border`                             |
| Border radius    | `rounded-2xl`                                      |
| Text — primary   | `text-text-primary`                                |
| Text — secondary | `text-text-secondary`                              |
| Spacing          | cards `p-6`, grid `gap-6`                          |
| Hover state      | `hover:text-accent-dark` on "Learn more" links     |
| Shadow           | `shadow-card`                                      |
| Accent usage     | icon container + link `text-accent`                |

**Pattern notes:**
Section id `features`. Two-column grid on sm+. Same card pattern as HowItWorks steps.

---

### BottomCta

File: components/homepage/BottomCta.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-text-darkest` (inverted dark banner)           |
| Border           | none                                               |
| Border radius    | `rounded-2xl` on banner                            |
| Text — primary   | `text-surface` (headline on dark bg)               |
| Text — secondary | `text-text-muted` (subtext on dark bg)             |
| Spacing          | `px-8 py-12 md:px-16 md:py-16`                     |
| Hover state      | outline btn `hover:bg-surface/10`                  |
| Shadow           | none                                               |
| Accent usage     | primary CTA `bg-accent`                            |

**Pattern notes:**
Dark inverted CTA band inside light page. Outline button uses transparent bg with light text on dark container.

---

### ThemeToggle

File: components/layout/ThemeToggle.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `variant="ghost"`                                  |
| Border           | none                                               |
| Border radius    | default button                                     |
| Text — primary   | `text-text-dark hover:text-text-primary`           |
| Spacing          | `size-9` icon button                               |
| Hover state      | ghost hover                                        |
| Shadow           | none                                               |
| Accent usage     | none                                               |

**Pattern notes:**
Toggles `dark` class on `<html>`. Persists preference in localStorage, defaults to `prefers-color-scheme`.

---

### AuthForm (Login / Sign Up)

File: components/auth/AuthForm.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `glass` on card                                    |
| Border           | `border border-border`                             |
| Border radius    | `rounded-2xl`                                      |
| Text — primary   | `text-text-primary` (title)                        |
| Text — secondary | `text-text-secondary` (subtitle, tab inactive)     |
| Text — muted     | `text-text-muted` (footer link)                    |
| Spacing          | card `p-8`, form `space-y-5`, fields `space-y-2`   |
| Hover state      | links `hover:text-accent-dark`                     |
| Shadow           | `shadow-card`                                      |
| Accent usage     | logo icon `bg-accent-light`, CTA `variant="brand"`, active tab `text-accent-dark after:bg-accent-dark` |

**Pattern notes:**
Client component. Centered auth card max-width `max-w-md`. Tabs use `variant="line"` with full-width tab list. Labels uppercase `text-xs tracking-wide text-text-secondary`. Inputs `h-10 border-border bg-surface`. Error text `text-error`, success `text-success-foreground`. Forgot password toggles inline mode without route change.

---

### Login Page

File: app/login/page.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-background` (from layout)                      |
| Layout           | `Navbar` + centered `main` + simple footer         |
| Main spacing     | `px-8 py-16`, flex center                          |
| Footer           | `border-t border-border px-8 py-6`                   |

**Pattern notes:**
Server Component shell. Reuses marketing `Navbar`. Simple legal footer row matches Stitch login design.

---

### AppNavbar

File: components/layout/AppNavbar.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `glass-strong`                                     |
| Border           | via glass utility                                  |
| Border radius    | none                                               |
| Text — primary   | `text-text-primary` (logo)                         |
| Text — active    | `text-accent` + `after:bg-accent` underline        |
| Text — inactive  | `text-text-dark hover:text-accent-dark`            |
| Spacing          | `h-16 px-8`, inner `max-w-[1200px]`                |
| Hover state      | link color transition                              |
| Shadow           | none                                               |
| Accent usage     | logo icon `bg-accent-light`, active link underline |

**Pattern notes:**
Client component for authenticated app pages. Nav links: Dashboard, Analyze, History. Active route via `usePathname`. ThemeToggle + email truncate + sign out ghost icon button.

---

### AppFooter

File: components/layout/AppFooter.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | transparent                                        |
| Border           | `border-t border-border`                           |
| Text — muted     | `text-text-muted` (copyright)                      |
| Text — secondary | `text-text-secondary` (links)                      |
| Spacing          | `px-8 py-6`, inner `max-w-[1200px]`                |
| Hover state      | `hover:text-accent-dark` on links                  |

**Pattern notes:**
Server Component. Compact single-row footer for app pages (analyze, dashboard, history). Simpler than marketing `Footer`.

---

### DailyLimitBanner

File: components/analyze/DailyLimitBanner.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-accent-muted` / limit reached `bg-warning-light` |
| Border           | `border-accent/20` / limit `border-warning`        |
| Border radius    | `rounded-xl`                                       |
| Text             | `text-accent-dark` / limit `text-warning-foreground` |
| Spacing          | `px-4 py-3`, icon `size-4`                         |
| Icon             | `Clock` from lucide-react                          |

**Pattern notes:**
Server-safe presentational component. Uses `DAILY_ANALYSIS_LIMIT` from `lib/utils.ts`. Two states: remaining count vs limit reached message.

---

### ResumeUpload

File: components/analyze/ResumeUpload.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface` card, drop zone `bg-surface-secondary` |
| Border           | card `border-border`, drop zone `border-dashed`    |
| Border radius    | card `rounded-2xl`, options `rounded-xl`           |
| Text — primary   | `text-text-primary`                                |
| Text — secondary | `text-text-secondary`                              |
| Spacing          | card `p-6`, drop zone `p-8`                        |
| Hover state      | drop zone `hover:border-accent hover:bg-accent-muted` |
| Shadow           | `shadow-card`                                      |
| Accent usage     | selected option `border-accent bg-accent-muted`, icon container `bg-accent-light` |
| Active file      | `bg-success-lightest border-success text-success-foreground` |

**Pattern notes:**
Client component. Two modes when saved resume exists: radio-style cards for "Keep saved" vs "Upload new". Drag-and-drop + click upload for PDF only (5 MB). Custom radio circles — no RadioGroup primitive. Supports `isUploading` spinner state and server `uploadError` from parent.

---

### Resume Upload API

File: app/api/resume/upload/route.ts
Last updated: 2026-07-01

**Pattern notes:**
`POST` multipart form field `file`. Auth required. Validates `application/pdf`, max 5 MB. Uploads to `resumes/{user_id}/resume.pdf` with upsert. Updates `profiles.resume_pdf_url` (storage path) + `resume_filename`. Returns `{ success, data: { filename, path } }`.

---

### JobDescriptionForm

File: components/analyze/JobDescriptionForm.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                       |
| Border           | `border border-border`                             |
| Border radius    | `rounded-2xl`                                      |
| Text — labels    | `text-xs uppercase tracking-wide text-text-secondary` |
| Inputs           | `h-10 border-border bg-surface`                    |
| Textarea         | `min-h-60 resize-y border-border bg-surface`       |
| Char count       | `text-text-muted`, near limit `text-warning-foreground` |
| Spacing          | card `p-6`, fields `space-y-5`                     |
| Shadow           | `shadow-card`                                      |
| Accent usage     | header icon container `bg-accent-light`            |

**Pattern notes:**
Client component. Job Title, Company (optional), Job Details textarea. Max 8000 chars with live counter. Matches AuthForm label styling.

---

### AnalyzeLoadingOverlay

File: components/analyze/AnalyzeLoadingOverlay.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-background/80 backdrop-blur-sm` full-screen    |
| Card             | `glass-strong rounded-2xl border-border shadow-card` |
| Text — primary   | `text-text-primary` (stage message)                |
| Text — muted     | `text-text-muted` (helper)                         |
| Spacing          | card `p-8`, icon container `size-14`               |
| Motion           | Framer `AnimatePresence`, presets from `lib/motion.ts` |
| Stages           | reading → extracting → analyzing → scoring → suggestions → finishing |
| Progress         | Animated bar + %; checklist with Check / spinner / numbers |
| Tips             | Rotating tip every 4s in `bg-surface-secondary` tip card |

**Pattern notes:**
Full-screen overlay keeps user on `/analyze` until redirect. Body scroll locked. `beforeunload` warn while loading. Overlay stays open through success (`finishing`) so form does not flash before navigation.

---

### Analyze Page

File: app/analyze/page.tsx + components/analyze/AnalyzePageContent.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Layout           | `AppNavbar` + `main max-w-[1200px] px-8 py-8` + `AppFooter` |
| Page title       | `text-2xl font-semibold text-text-primary`         |
| Grid             | `lg:grid-cols-2 gap-6` resume + JD cards           |
| CTA              | `Button variant="brand"` full width mobile, right-aligned desktop |
| Mock states      | `?mock=no-resume`, `?mock=limit-reached`           |

**Pattern notes:**
Server page shell fetches user, passes real props to client `AnalyzePageContent`. Analyze calls `POST /api/analyze`, shows engaging loading overlay on-page, then redirects to `/analyze/[id]` on success. Overlay not dismissed on success — only on error.

---

### Analysis Result Page

File: app/analyze/[id]/page.tsx
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Layout           | `AppNavbar` + `main max-w-[800px]` + `AppFooter`  |
| Back link        | `← History` → `/history`                           |
| Section cards    | `rounded-2xl border-border bg-surface p-6 shadow-card` |
| Grid             | `md:grid-cols-2` skills + ATS                      |
| Mock tailored    | `?mock=tailored` on result page                    |

**Pattern notes:**
Server Component loads analysis scoped to user. Completed state renders full result stack. Failed/pending states show dedicated messages. Delete via `AnalysisResultActions` + `actions/analyses.ts`.

---

### MatchScoreHeader

File: components/analysis-result/MatchScoreHeader.tsx

**Pattern notes:**
SVG circular ring with `getMatchScoreColors()` from `lib/utils.ts`. Job title, company, formatted date, large % in ring center.

---

### SkillsBreakdown / AtsKeywordsCard / ExperienceAlignmentCard / ImprovementSuggestions

Files: `components/analysis-result/*.tsx`

**Pattern notes:**
Skill badges: matched `bg-success-lightest`, missing `bg-warning-light`, nice-to-have `bg-neutral-light`. ATS uses `Progress` bar + found/missing keyword pills with Check/X icons. Experience: two-column strengths/gaps bullets. Suggestions: numbered accent circles.

---

### TailoredResumeCard

File: components/analysis-result/TailoredResumeCard.tsx

**Pattern notes:**
Client component. Empty: template picker + Regenerate. After content: template picker, status chips (Unsaved edits / Edits saved / PDF ready / Last saved), actions Save edits → Update PDF → Download PDF → Regenerate with AI (confirm dialog). Editor below. Template switch and Update PDF call `/api/resume/render` with current content. Save calls `/api/resume/content`.

### ResumeTemplatePicker

File: components/analysis-result/ResumeTemplatePicker.tsx

**Pattern notes:**
3-column grid (`sm:grid-cols-3`) of selectable cards. Selected: `border-accent bg-accent-light`. Each card has CSS mini-preview (not image assets), name, description. Uses `RESUME_TEMPLATES` from `agent/resume-templates`.

### TailoredResumeEditor

File: components/analysis-result/TailoredResumeEditor.tsx

**Pattern notes:**
Section cards (`rounded-xl border border-border bg-surface-secondary/40 p-4`) for Header, Profile, Personal details, Links, Skills, Experience, Education. Add/remove rows with outline `Plus` / ghost `Trash2` buttons. Nested experience/education blocks use `bg-surface` inner cards. Validation warnings in `border-warning bg-warning-light`. Exports `validateTailoredResumeDraft` + `sanitizeTailoredResumeDraft`.

---

### AnalysisResultActions

File: components/analysis-result/AnalysisResultActions.tsx

**Pattern notes:**
Client component. "Analyze Another" brand CTA + ghost "Delete Analysis" opening confirm `Dialog`. Delete calls `deleteAnalysis` server action → redirect `/history`.

---

### History Page

File: app/history/page.tsx + components/history/*
Last updated: 2026-07-01

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Layout           | `AppNavbar` + `main max-w-[1200px]` + `AppFooter`  |
| Table            | `rounded-2xl border-border bg-surface shadow-card` |
| Headers          | `text-xs uppercase tracking-wide text-text-secondary` |
| Row hover        | `hover:bg-surface-secondary`, cursor-pointer         |
| Score bar        | `h-1 w-16` inline bar + `%` with `getMatchScoreColors` |
| Filters          | `DropdownMenu` outline buttons, URL searchParams     |
| Pagination       | "Showing X-Y of Z" + page number links               |

**Pattern notes:**
Server page queries `lib/history.ts` with filter/sort/page from URL. `HistoryFilters` client updates searchParams. Row click navigates to `/analyze/[id]`. Empty state when no completed analyses.

---

## Dashboard Page

File: `app/dashboard/page.tsx` + `components/dashboard/*`
Last updated: 2026-07-04

| Property | Class / pattern |
| -------- | --------------- |
| Layout | `AppNavbar` + `main max-w-[1200px]` + `AppFooter` |
| Header | Title + welcome subtitle + brand `New Analysis` CTA |
| Stats | `grid sm:grid-cols-2 lg:grid-cols-5`, cards `rounded-2xl border-border bg-surface shadow-card` |
| Trend badges | Positive `bg-success-lightest text-success-foreground`; neutral `bg-accent-light text-accent-dark` |
| Main grid | `lg:grid-cols-5` — recent `lg:col-span-3`, chart+CTA `lg:col-span-2` |
| Empty | `GettingStartedCard` 3-step grid + Start First Analysis |
| Data | `lib/dashboard.ts` → completed analyses only; trends week-over-week |

### StatsBar

File: components/dashboard/StatsBar.tsx

Five stat cards: label uppercase muted, icon in `bg-accent-light` rounded square (BarChart3, Target, Award, FileOutput, CalendarDays), large value, trend pill (positive / neutral / negative).

### RecentAnalyses

File: components/dashboard/RecentAnalyses.tsx

List rows: document icon, title/company, score badge via `getMatchScoreColors`, relative time. Footer link to `/history`.

### ScoreTrendChart

File: components/dashboard/ScoreTrendChart.tsx

Client `recharts` line chart. Stroke/grid/axis use CSS vars (`--color-accent`, `--color-border`, `--color-text-muted`). Empty when &lt; 2 points.

### GettingStartedCard / BoostScoreCta

Getting started: numbered steps + brand CTA. Boost: solid `bg-accent` card, white Improve Resume button → `/analyze`.

