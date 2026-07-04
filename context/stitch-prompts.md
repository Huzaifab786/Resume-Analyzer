# Google Stitch Design Prompts

Use these prompts in [Google Stitch](https://stitch.withgoogle.com/) to generate UI designs before implementation. Export each screen to `context/designs/` with the filenames listed below.

## MCP setup (Cursor)

1. Get a **Stitch API key**: [stitch.withgoogle.com](https://stitch.withgoogle.com/) → profile → **Stitch settings** → **API key** → Create key
2. Add the key to `.cursor/mcp.json` under `stitch.env.STITCH_API_KEY` (or paste in **Cursor Settings → Tools & MCP → stitch → Environment**)
3. Reload Cursor and enable the **stitch** MCP server
4. Ask the agent to generate designs using the prompts below — it will call `create_project`, then `generate_screen` for each page, then export screenshots to `context/designs/`

**Global design system to include in every prompt:**

> Design system: Inter font. Page background #F6F7FB. Cards white with 1px #E7EAF3 border, 16px radius, subtle shadow. Primary accent indigo #6366F1. Success green #10B981. Warning amber #F59E0B. Text primary #101828, secondary #6A7282, muted #99A1AF. Clean SaaS aesthetic — professional, minimal, trustworthy. Desktop 1440px width. No sidebar. Top navbar only.

---

## 1. Landing Page

**Export as:** `context/designs/landing-page.png`

**Prompt:**

> Design a marketing landing page for "Resume Analyzer" — a web app that compares your resume against any job description using AI and shows match score, missing skills, ATS keywords, and a tailored resume download.
>
> Include: top navbar with logo (document + checkmark icon), Sign In button, hero with headline "Know your fit before you apply", subheadline about instant AI resume analysis and tailored PDF generation, primary CTA "Analyze My Resume", secondary CTA "See how it works". Below hero: 4-step "How it works" section (Upload resume → Paste job description → Get match report → Download tailored resume). Features grid with 4 cards: Match Score, Skills Gap Analysis, ATS Keywords, One-Click Resume Regeneration. Social proof strip with 3 short testimonials. Bottom CTA banner. Footer with links.
>
> Style: modern B2C SaaS, lots of whitespace, indigo accent buttons, no illustrations of people — use simple line icons.

---

## 2. Login Page

**Export as:** `context/designs/login.png`

**Prompt:**

> Design a centered auth page for Resume Analyzer. White card on #F6F7FB background. Logo and "Resume Analyzer" at top. Tagline: "Sign in to analyze your resume".
>
> Tabs: Sign In | Sign Up
> Sign In form: email input, password input, primary "Sign In" button, links below for "Forgot password?" and "Resend verification email"
> Sign Up form: email, password, confirm password, primary "Create account" button, note "We'll send a verification email"
>
> No Google or GitHub buttons. Email/password only. Card max-width 400px, centered.

---

## 3. Dashboard

**Export as:** `context/designs/dashboard.png`

**Prompt:**

> Design an authenticated dashboard for Resume Analyzer.
>
> Navbar: logo, Dashboard (active/indigo), Analyze, History, user avatar right.
>
> Content: page title "Dashboard" with primary button "New Analysis" top right. Row of 5 stat cards: Total Analyses (24), Avg Match Score (72%), Best Match (91%), Resumes Regenerated (8), This Week (5) — each with small trend badge. Below: two columns — left (wider) "Recent Analyses" list with 5 rows showing job title, company, colored match score badge, time ago; right "Match Score Trend" line chart last 30 days with indigo line.
>
> Show one getting-started card variant note in comments: if user has zero analyses, replace stats with a welcome card "Run your first analysis" and 4 numbered steps.
>
> Full width content max 1200px. Professional, data-focused but not cluttered.

---

## 4. New Analysis Page

**Export as:** `context/designs/analyze.png`

**Prompt:**

> Design the "New Analysis" page for Resume Analyzer.
>
> Navbar same as dashboard. Page title "New Analysis". Banner below title: info style "3 of 5 analyses remaining today".
>
> Two-column layout desktop:
> Left card "Your Resume" — TWO states:
> State A (saved resume): green check, "Using saved resume: Sarah_Chen_Resume.pdf", radio or toggle "Keep saved" (selected) vs "Upload new". Small upload zone collapsed.
> State B (no resume): dashed border drag-and-drop zone, upload icon, "Drop your PDF here or click to browse", "PDF only · Max 5MB".
> Right card "Job Description" — optional inputs Job Title and Company Name in a row, large textarea placeholder "Paste the full job description here…", character count "0 / 8000" bottom right.
>
> Full-width primary button below both cards: "Analyze Match" with sparkle icon, disabled state grayed out shown as alternate frame.
> Alternate frame when daily limit reached: banner "Daily limit reached — 5 analyses per day. Try again tomorrow." and disabled Analyze button.
>
> Loading state frame: overlay with spinner and text "Analyzing your match…"
>
> Clean form-focused layout, indigo primary button, mobile stacked variant optional.

---

## 5. Analysis Result Page

**Export as:** `context/designs/analysis-result.png`

**Prompt:**

> Design the analysis result page for Resume Analyzer showing AI resume vs job match report.
>
> Navbar standard. Back link "← History". Header row: job title "Senior Frontend Engineer", company "Acme Corp", date "Analyzed Mar 15, 2026". Large circular match score 78% in blue-green ring center-right.
>
> Cards stacked, max-width 800px centered:
> 1. "Match Summary" — paragraph explaining fit
> 2. Two columns: "Skills Breakdown" with green pills (React, TypeScript, Next.js) under "Matched", orange pills (GraphQL, AWS) under "Missing", gray pills under "Nice to have"; and "ATS Keywords" with progress bar 68%, green keyword chips and red missing chips
> 3. "Experience Alignment" — short summary plus two bullet lists Strengths and Gaps
> 4. "Improvement Suggestions" — numbered list 1-5 with actionable resume edits
> 5. "Tailored Resume" card — two states in separate frames:
>    - Empty: document icon, text "Apply AI suggestions to generate a job-specific resume", primary button "Regenerate Resume"
>    - Generated: green check "Resume ready", Download PDF button, bullet list "Changes applied" (3-4 items like "Added keywords: GraphQL, AWS", "Rewrote professional summary"), ghost "Regenerate again"
>
> Bottom actions: primary "Regenerate Resume" OR "Analyze Another" depending on state, ghost "Delete Analysis".
>
> Data-dense but scannable. Use color meaningfully for matched vs missing only.

---

## 6. History Page

**Export as:** `context/designs/history.png`

**Prompt:**

> Design the Analysis History page for Resume Analyzer.
>
> Navbar standard. Page title "Analysis History". Toolbar: filter dropdown "All analyses" with options Strong Match / Needs Work, sort dropdown "Newest first", search input optional.
>
> Table: columns JOB TITLE, COMPANY, MATCH SCORE (mini progress bar + %), TAILORED (green "Yes" badge or gray "—"), DATE, ACTION (View link). 6-8 sample rows with varied scores (45% to 92%). Pagination footer "Showing 1-20 of 47" with page numbers.
>
> Include empty state alternate frame: illustration-free, text "No analyses yet", button "Start First Analysis".
>
> Same design system as dashboard. Table hover state light gray row background.

---

## Stitch Workflow Tips

1. Generate landing page first — establishes visual language
2. Use Stitch "Apply design system" or paste the global design system block into each follow-up prompt
3. Export PNG at 2x resolution
4. Name files exactly as listed so build agents can reference them
5. Replace old JobPilot designs (`find-jobs.png`, `job-details.png`, `profile.png`) — they no longer apply to this project

---

## Optional: Mobile Frames

If Stitch supports breakpoints, generate mobile variants for:

- Analyze page (stacked cards)
- Analysis result (single column, score ring above title)
- History (cards instead of table)

Export as `analyze-mobile.png`, `analysis-result-mobile.png`, `history-mobile.png`.
