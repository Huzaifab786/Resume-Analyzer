# UI Tokens

Design tokens for Resume Analyzer. All colors, typography, spacing, and component values. Use these throughout — never hardcode colors or use raw Tailwind color classes.

---

## How to Use

Tailwind CSS v4 with `@theme` in `app/globals.css`. No `tailwind.config.ts` for colors.

```tsx
// Correct
className="bg-surface text-text-primary border-border"

// Never
className="bg-[#F6F7FB] text-purple-500"
```

---

## globals.css — Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #f6f7fb;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f2f5f7;
  --color-surface-muted: #f4f5fb;

  /* Borders */
  --color-border: #e7eaf3;
  --color-border-light: #e5e7eb;
  --color-border-muted: #dfe1e7;

  /* Text */
  --color-text-primary: #101828;
  --color-text-secondary: #6a7282;
  --color-text-muted: #99a1af;
  --color-text-dark: #364153;
  --color-text-darkest: #111827;

  /* Primary accent — indigo-violet (professional, trustworthy) */
  --color-accent: #6366f1;
  --color-accent-dark: #4f46e5;
  --color-accent-light: #eef2ff;
  --color-accent-muted: #f5f7ff;
  --color-accent-foreground: #ffffff;

  /* Success — green (matched skills, high scores) */
  --color-success: #10b981;
  --color-success-dark: #007a55;
  --color-success-light: #d0fae5;
  --color-success-lightest: #ecfdf5;
  --color-success-foreground: #007a55;

  /* Info — blue */
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
  --color-info-lightest: #eff6ff;
  --color-info-foreground: #1d4ed8;

  /* Warning — orange (missing skills, medium scores) */
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-warning-foreground: #b45309;

  /* Error — red */
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-error-foreground: #ffffff;

  /* Neutral — nice-to-have skills */
  --color-neutral: #94a3b8;
  --color-neutral-light: #f1f5f9;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

/* Dark mode — toggled via class="dark" on <html> */
.dark {
  --color-background: #0f1117;
  --color-surface: #181b24;
  --color-surface-secondary: #1f2430;
  --color-surface-tertiary: #252b38;
  --color-surface-muted: #1a1f2a;

  --color-border: #2d3548;
  --color-border-light: #343d52;
  --color-border-muted: #3d4760;

  --color-text-primary: #f3f4f6;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-text-dark: #d1d5db;
  --color-text-darkest: #f9fafb;

  --color-accent: #818cf8;
  --color-accent-dark: #6366f1;
  --color-accent-light: #312e81;
  --color-accent-muted: #1e1b4b;
  --color-accent-foreground: #ffffff;

  --color-success-light: #064e3b;
  --color-success-lightest: #022c22;
  --color-success-foreground: #6ee7b7;

  --color-info-light: #1e3a5f;
  --color-info-lightest: #172554;
  --color-info-foreground: #93c5fd;

  --color-warning-light: #451a03;
  --color-warning-foreground: #fbbf24;

  --color-error-light: #450a0a;

  --color-neutral-light: #1e293b;
}
```

Stitch designs are **light mode only** — reference screenshots use light tokens. Dark mode is implemented in code via the `.dark` block above.

---

## Color Usage Guide

### Page Layout

| Element           | Token                  |
| ----------------- | ---------------------- |
| Page background   | `bg-background`        |
| Card / surface    | `bg-surface`           |
| Secondary surface | `bg-surface-secondary` |
| Default border    | `border-border`        |

### Match Score Colors

| Score Range | Meaning    | Token                                  |
| ----------- | ---------- | -------------------------------------- |
| 80–100      | Strong fit | `text-success` / `bg-success-lightest` |
| 60–79       | Moderate   | `text-info` / `bg-info-lightest`       |
| 40–59       | Weak       | `text-warning` / `bg-warning-light`    |
| Below 40    | Poor       | `text-text-muted` / `bg-neutral-light` |

### Skills Badges

| Type           | Background            | Text                      |
| -------------- | --------------------- | ------------------------- |
| Matched skill  | `bg-success-lightest` | `text-success-foreground` |
| Missing skill  | `bg-warning-light`    | `text-warning-foreground` |
| Nice-to-have   | `bg-neutral-light`    | `text-text-secondary`     |

### ATS Keywords

| Type             | Background            | Text                      |
| ---------------- | --------------------- | ------------------------- |
| Keyword found    | `bg-success-lightest` | `text-success-foreground` |
| Keyword missing  | `bg-error-light`      | `text-error`              |

---

## Typography

| Element              | Size | Weight | Color token           |
| -------------------- | ---- | ------ | --------------------- |
| Hero headline        | 48px | 700    | `text-text-primary`   |
| Page title           | 24px | 600    | `text-text-primary`   |
| Match score (large)  | 48px | 700    | score color token     |
| Section heading      | 16px | 600    | `text-text-primary`   |
| Body text            | 14px | 500    | `text-text-primary`   |
| Labels               | 14px | 500    | `text-text-secondary` |
| Muted / timestamps   | 12px | 400    | `text-text-muted`     |
| Stat numbers         | 30px | 600    | `text-text-primary`   |

Font: **Inter** via `next/font/google`.

---

## Component Tokens

### Cards

```
background: bg-surface
border: 1px solid var(--color-border)
border-radius: 16px (rounded-2xl)
padding: 24px (p-6)
box-shadow: 0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)
```

### Primary Button

```
background: bg-accent
text: text-accent-foreground
border-radius: rounded-md
padding: px-4 py-2
font-weight: font-medium
```

### Upload Drop Zone

```
border: 2px dashed var(--color-border)
border-radius: rounded-xl
background: bg-surface-secondary
padding: p-8
hover: border-accent bg-accent-muted
```

### Match Score Ring

Large circular indicator on result page — stroke color follows score range tokens above.

### Dashboard Chart

| Element    | Value              |
| ---------- | ------------------ |
| Line stroke| `#6366F1` (accent) |
| Grid lines | `#E7EAF3` dashed   |
| Axis labels| `#9CA3AF`, 12px    |

---

## Invariants

- Never use hex in components — use CSS variables via Tailwind tokens
- Font is Inter only
- Never use raw Tailwind color scales (`bg-purple-500`, `text-gray-600`)
- Match score colors always follow the score range table above
- Dark mode uses `.dark` on `<html>` — never duplicate color values in components
- Stitch design PNGs are light-mode references only; dark mode is code-only
- Glass surfaces use `.glass*` utility classes from globals.css — never hand-roll backdrop-filter in components
- Motion uses shared presets from `lib/motion.ts` — never one-off spring/duration values in components
- Tailwind `bg-accent` / `text-accent` map to brand indigo via `--brand-accent` in `@theme` — never use self-referencing `var(--color-accent)` or shadcn's subtle `--accent` var

---

## Glassmorphism

Frosted-glass surfaces for navbar, cards, badges, and overlays. Defined as utilities in `globals.css` — use the class, not inline styles.

| Utility        | Use case                                      |
| -------------- | --------------------------------------------- |
| `glass`        | Default cards, hero preview, feature cards    |
| `glass-subtle` | Badges, pills, secondary floating elements    |
| `glass-strong` | Sticky navbar, modals, prominent overlays     |
| `glass-dark`   | Dark CTA banner inner panels                  |

All glass utilities combine:

- Semi-transparent surface via `color-mix` on `--color-surface`
- `backdrop-blur` (12px default, 20px strong, 8px subtle)
- Semi-transparent border via `color-mix` on `--color-border-light`
- Optional `shadow-card` for elevation

Dark mode auto-adapts — tokens swap under `.dark`, glass utilities follow.

```tsx
// Correct
<div className="glass rounded-2xl p-6 shadow-card">

// Never
<div className="bg-white/70 backdrop-blur-md">
```

---

## Motion Tokens

Shared animation values live in `lib/motion.ts`. Import presets — do not hardcode durations in components.

| Preset            | Value                          | Use                          |
| ----------------- | ------------------------------ | ---------------------------- |
| `easeOut`         | `[0.22, 1, 0.36, 1]`           | Enter animations             |
| `duration.fast`   | `0.2`                          | Hover, micro-interactions    |
| `duration.normal` | `0.5`                          | Fade-in, section reveals     |
| `duration.slow`   | `0.8`                          | Hero stagger, floating loops |
| `hover.lift`      | `y: -4`                        | Card hover lift              |
| `hover.scale`     | `scale: 1.02`                  | Button hover (subtle)        |
