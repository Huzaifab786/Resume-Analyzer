# UI Rules

Concise rules for building Resume Analyzer UI. Reference designs in `context/designs/` after Google Stitch export.

---

## Font

Inter via `next/font/google` in root layout. Apply variable class to `<html>`. Never use system fonts as primary.

---

## Layout

- Page max-width: 1200px for app pages, 1440px for marketing homepage
- Main content padding: 32px
- Gap between sections: 24px
- Header height: 64px, white background, full width
- Top navbar only — no sidebar

---

## Navbar

Three items when logged in: **Dashboard**, **Analyze**, **History**.

- Active: `text-accent`, font-weight 500, 14px
- Inactive: `text-text-dark`, font-weight 500, 14px
- Logo left, nav center or left-after-logo, user avatar/sign out right

---

## Cards

Every content section lives in a white card:

```
background: bg-surface
border: 1px solid border-border
border-radius: 16px
padding: 24px
box-shadow: subtle (see ui-tokens.md)
```

Never colored card backgrounds — color via badges, score rings, and text only.

---

## Analyze Page Layout

Two-column on desktop (resume left, job description right), stacked on mobile.

- Resume upload card has dashed border drop zone
- Job description textarea min-height: 240px
- Analyze button spans full width below both cards on mobile, right-aligned on desktop

---

## Analysis Result Page Layout

Single column, max-width 800px centered.

1. Score header — large ring + title metadata
2. Match summary — full width card
3. Two-column grid on desktop: Skills | ATS Keywords
4. Experience alignment — full width
5. Improvement suggestions — numbered list in card
6. Actions row at bottom

---

## Match Score Display

- Result page: large circular score (80px+) with color ring
- History table: inline 4px progress bar + percentage
- Dashboard recent list: small badge with score

Fill colors per ui-tokens.md score ranges.

---

## Empty States

Every list/section needs an empty state:

- Muted text (`text-text-muted`)
- Simple icon (lucide-react)
- CTA button when a clear next step exists

Examples:
- No analyses yet → "Upload your resume and paste a job description to get started" + Analyze CTA
- No resume uploaded → highlight upload zone

---

## Loading States

During analysis (can take 10–30s on free tier):

- Disable Analyze button
- Show spinner + staged messages: "Reading resume…" → "Analyzing match…"
- Do not navigate until complete

---

## Form Inputs

```
background: bg-surface
border: border-border
border-radius: 8px
padding: 8px 12px
font-size: 14px
placeholder: text-text-muted
focus: ring-1 ring-accent
```

Job description textarea: `resize-y`, `min-h-60`.

---

## History Table

- White rows, `border-border` between rows
- Headers: uppercase, 12px, `text-text-secondary`
- Hover: `bg-surface-secondary`
- Match score column: bar + percentage inline

---

## Do Nots

- No raw Tailwind color classes — project tokens only
- No opaque gradients on card backgrounds — decorative page orbs and glass surfaces are allowed (see Glassmorphism below)
- No raw error messages in UI
- No fixed positioning for layout elements (except sticky navbar)
- No sidebar navigation
- No hardcoded light/dark colors in components — use semantic tokens that swap under `.dark`
- No hand-rolled `backdrop-filter` or animation timings — use `.glass*` utilities and `lib/motion.ts`

---

## Glassmorphism

Premium frosted-glass surfaces on marketing pages and elevated UI.

**Where to use:**

- Sticky navbar — `glass-strong`
- Hero badge, preview card, step cards, feature cards — `glass` + `shadow-card`
- Bottom CTA inner panel — `glass-dark` on dark background
- Floating decorative orbs behind hero — `bg-accent-muted/30 blur-3xl` (token-based, not card backgrounds)

**Rules:**

- Always use `.glass`, `.glass-subtle`, `.glass-strong`, or `.glass-dark` from globals.css
- Pair glass cards with `shadow-card` for depth
- Glass works in both light and dark mode via token `color-mix`
- Do not stack multiple glass layers more than 2 deep — looks muddy

---

## Motion & Animation

Framer Motion for subtle, premium interactions. Marketing homepage and key UI moments only — not every element.

**Standard patterns** (via `components/motion/`):

| Pattern       | Component    | Where                                    |
| ------------- | ------------ | ---------------------------------------- |
| Scroll reveal | `FadeIn`     | Section headings, hero copy, grids       |
| Stagger       | `Stagger`    | Card grids (steps, features)             |
| Hover lift    | `HoverLift`  | Interactive cards                        |
| Float loop    | `Float`      | Hero preview mockup                      |
| Progress fill | `FadeIn` + width animation | Hero preview bars          |

**Rules:**

- Animations must be **subtle** — small y-offsets (8–16px), short durations (0.2–0.5s)
- Always respect `prefers-reduced-motion` — skip or simplify when enabled
- `"use client"` only on motion wrapper components — keep pages as Server Components where possible
- Import easing/duration from `lib/motion.ts` — no magic numbers in JSX
- `viewport={{ once: true }}` on scroll reveals — animate once, not on every scroll
- No bounce, spin, or flashy effects — premium means restrained

**Button hover:** subtle scale via Framer Motion or CSS `transition-transform hover:scale-[1.02]` on primary CTAs.

---

## Dark Mode

- Stitch PNGs in `context/designs/` are **light mode only** — do not generate dark Stitch frames
- Implementation: `class="dark"` on `<html>` toggled by user preference (localStorage) with `prefers-color-scheme` as default
- Theme toggle in navbar (sun/moon icon) on all authenticated pages + homepage
- All surfaces use semantic tokens (`bg-background`, `bg-surface`, `text-text-primary`) — they auto-switch via `ui-tokens.md` `.dark` block
- Cards stay elevated in dark mode — slightly lighter than page background (`bg-surface` on `bg-background`)
- Charts and match score colors use the same semantic tokens in both modes
