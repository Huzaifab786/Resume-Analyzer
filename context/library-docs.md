# Library Docs

Project-specific usage patterns for every third party library in this project. Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. **Check AGENTS.md** at the project root for installed skills.
2. **Check if an MCP server is configured** for that library.
3. **Read this file** for project-specific patterns.

Order of authority:

```
MCP server → Skills via AGENTS.md → This file → General training knowledge
```

---

## Supabase

**Check first:** Read `node_modules/@supabase/ssr` docs and Supabase Next.js App Router guide before implementing auth.

### Client vs Server

Two separate clients — never mix them:

```typescript
// lib/supabase-client.ts — browser context only
import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

```typescript
// lib/supabase-server.ts — server context only
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

**Rules:**

- Browser client — Client Components, client-side auth helpers only
- Server client — Server Components, API routes, Server Actions, middleware
- Never use browser client in server context
- Never use server client in browser context

---

### Auth

Email + password only. No OAuth providers enabled.

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${origin}/auth/callback`,
    data: { full_name: fullName },
  },
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Resend verification email (login page)
const { error } = await supabase.auth.resend({
  type: "signup",
  email,
  options: { emailRedirectTo: `${origin}/auth/callback` },
});

// Password reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/auth/callback?next=/login`,
});
```

**Resend SMTP setup:**

1. Create Resend account and verify domain (or use Resend test domain for dev)
2. Supabase Dashboard → Project Settings → Authentication → SMTP Settings
3. Enable custom SMTP — host `smtp.resend.com`, port `465`, user `resend`, password = Resend API key
4. Set sender email e.g. `noreply@yourdomain.com`

**Rules:**

- Email confirmation required before first analysis (check `user.email_confirmed_at`)
- No Google, GitHub, or other OAuth providers
- Auth callback route handles email confirmation tokens
- `resend()` is for user-triggered verification resend — Supabase sends via Resend SMTP

```typescript
// Get current user in server context
const supabase = await createSupabaseServer();
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
if (!user) redirect("/login");
```

---

### DB Queries

```typescript
// Read analyses for current user
const { data, error } = await supabase
  .from("analyses")
  .select("*")
  .eq("user_id", user.id)
  .eq("status", "completed")
  .order("created_at", { ascending: false });

// Insert analysis
const { data, error } = await supabase
  .from("analyses")
  .insert({
    user_id: user.id,
    job_description: jobDescription,
    job_title: jobTitle,
    company,
    status: "pending",
  })
  .select()
  .single();

// Update with result
const { error } = await supabase
  .from("analyses")
  .update({
    match_score: result.matchScore,
    result: result.payload,
    status: "completed",
  })
  .eq("id", analysisId)
  .eq("user_id", user.id);
```

**Rules:**

- Always scope queries to `user_id`
- Always handle the `error` return
- Use `.single()` when expecting exactly one row

---

### Storage

```typescript
// Upload resume (server-side in API route)
const { data, error } = await supabase.storage
  .from("resumes")
  .upload(`${userId}/resume.pdf`, fileBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });

// Download resume for analysis (server-side)
const { data, error } = await supabase.storage
  .from("resumes")
  .download(`${userId}/resume.pdf`);
```

**Rules:**

- Bucket is private — never expose permanent public URLs for resumes
- Always use `upsert: true` for resume uploads
- Download server-side only for PDF parsing — never send raw PDF to AI if text extraction fails
- Path is always `resumes/{user_id}/resume.pdf`

---

## Google Gemini

This project uses **Google Gemini** (free tier via AI Studio) for all AI features. All calls go through `lib/ai.ts` — never call the SDK from components.

### Setup

```typescript
// lib/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function chatJson(system: string, user: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });
  const result = await model.generateContent([
    { role: "user", parts: [{ text: `${system}\n\n${user}` }] },
  ]);
  return result.response.text();
}
```

**Rules:**

- Model is always `gemini-2.5-flash` — never swap without updating this file
- API key from `GEMINI_API_KEY` env var — server-side only
- All AI calls from `agent/` via API routes only

---

```typescript
// agent/analyzer.ts
import { z } from "zod";
import { chatJson } from "@/lib/ai";

const analysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchSummary: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()),
  atsKeywords: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string()),
    matchPercentage: z.number().min(0).max(100),
  }),
  experienceAlignment: z.object({
    summary: z.string(),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
  }),
  improvementSuggestions: z.array(z.string()),
});

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
  company?: string,
) {
  const systemPrompt = `You are an expert resume analyst and ATS specialist.
Compare the candidate's resume against the job description.
Return ONLY valid JSON matching the required schema.
Be specific — reference actual skills, titles, and requirements from the inputs.
Never invent experience the resume does not contain.
Score honestly: 90+ only for near-perfect alignment.`;

  const userPrompt = `JOB TITLE: ${jobTitle ?? "Not provided"}
COMPANY: ${company ?? "Not provided"}

JOB DESCRIPTION:
${jobDescription}

RESUME TEXT:
${resumeText}

Return JSON with keys:
matchScore, matchSummary, matchedSkills, missingSkills, niceToHaveSkills,
atsKeywords { found, missing, matchPercentage },
experienceAlignment { summary, strengths, gaps },
improvementSuggestions`;

  const raw = await chatJson(systemPrompt, userPrompt);
  return analysisResultSchema.parse(JSON.parse(raw));
}
```

**Rules:**

- Temperature `0.3` for analysis — consistent scoring
- Always validate AI output with Zod before saving to DB
- Never send PDF binary to AI — only extracted text
- Truncate resume text to ~12,000 chars if needed to stay within free tier limits
- Truncate job description to ~8,000 chars if needed
- AI calls only from `agent/` via API routes — never from client

---

## Resume Tailoring Agent

```typescript
// agent/tailor.ts
const tailoredResumeSchema = z.object({
  fullName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string().optional(),
    }),
  ),
  changesApplied: z.array(z.string()), // human-readable changelog
});
```

**System prompt rules:**

- Rewrite the resume to better match the job description using the provided improvement suggestions
- Integrate missing ATS keywords only where the candidate's real experience supports them
- Rephrase bullets for impact — stronger action verbs, quantify where data exists in original
- Never add employers, job titles, degrees, certifications, or skills not present in the original resume
- For missing skills: frame adjacent experience honestly in summary or bullets — never claim direct expertise
- Return `changesApplied` array describing each edit in plain English

**Temperature:** `0.5` — slightly more creative than analysis, still grounded

---

## @react-pdf/renderer

**Check first:** Read package docs before implementing — PDF APIs differ from general React knowledge.

### Tailored Resume PDF

```typescript
// agent/resume-pdf.tsx — server-side only
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  section: { marginTop: 12, marginBottom: 4 },
  heading: { fontSize: 11, fontWeight: "bold", borderBottomWidth: 1, marginBottom: 6 },
  bullet: { marginLeft: 8, marginBottom: 2 },
});

export async function renderTailoredResumePdf(resume: TailoredResume) {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* name, contact, summary, skills, experience, education */}
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
```

**Usage in API route:**

```typescript
const buffer = await renderTailoredResumePdf(tailoredContent);
await supabase.storage
  .from("resumes")
  .upload(`${userId}/tailored/${analysisId}.pdf`, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });
```

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` — not `PDFDownloadLink`
- PDF generation only in API routes (`/api/resume/regenerate`, planned `/api/resume/render`)
- Upload buffer directly to Supabase Storage — never write to disk
- Keep layout single-page if possible; allow 2 pages max for senior resumes
- Only use supported CSS properties: `padding, margin, fontSize, color, fontFamily, flexDirection, fontWeight, textAlign, lineHeight, borderBottomWidth`

### Resume Templates (planned — Feature 14)

```typescript
// agent/resume-templates/index.ts
export const RESUME_TEMPLATE_IDS = ["classic", "modern", "minimal"] as const;
export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export function getResumeTemplate(id: ResumeTemplateId) {
  // returns render function: (resume: TailoredResume) => React.ReactElement
}
```

| Template ID | Style |
| ----------- | ----- |
| `classic`   | Times serif, centered header, two-column employment/education dates |
| `modern`    | Helvetica, left-aligned, compact single-column |
| `minimal`   | Helvetica, extra whitespace, simplified section headings |

- All templates share `TailoredResume` from `agent/types.ts` — no per-template JSON shapes
- Default template: `classic`
- Validate `templateId` with Zod enum before render

### Tailored Resume Editor (planned — Feature 15)

- Editable fields mirror `TailoredResume` schema exactly — client form state typed as `TailoredResume`
- Save path: `POST /api/resume/content` or PATCH analysis — stores `analyses.tailored_resume_content`
- Render path: `POST /api/resume/render` — `{ analysisId, templateId, content? }`
- User edits are never sent to Gemini unless user explicitly triggers AI regenerate
- Re-validate with `parseTailoredResume` / `tailoredResumeSchema` on save and render

---

## pdf-parse

### Extract Text from Resume PDF

```typescript
import pdf from "pdf-parse";

const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
const pdfData = await pdf(buffer);
const extractedText = pdfData.text.trim();
```

**Rules:**

- Server-side only
- If `extractedText` is empty or < 50 chars → return user error about scanned/image PDFs
- Do not store raw resume text in DB — use only for the analysis call

---

## recharts (Dashboard chart only)

Used only for the score trend line chart on `/dashboard`.

```typescript
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
```

**Rules:**

- Client Component wrapper only (`"use client"`)
- Chart colors use tokens from ui-tokens.md — `#7C5CFC` for line stroke
- Empty state when fewer than 2 data points

---

## shadcn/ui + Tailwind v4

- Install components as needed: `button`, `card`, `input`, `textarea`, `badge`, `dropdown-menu`, `dialog`, `progress`
- All colors from `@theme` in globals.css — see ui-tokens.md
- Never use raw Tailwind color scales
- Glass surfaces via `.glass*` utilities — see ui-tokens.md Glassmorphism section

---

## Framer Motion

Used for subtle scroll reveals, hover lifts, and floating elements. All motion goes through shared wrappers in `components/motion/` — never import `motion` directly in page files.

### Setup

```typescript
// lib/motion.ts — shared presets
export const easeOut = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.2,
  normal: 0.5,
  slow: 0.8,
} as const;

export const hoverLift = { y: -4 } as const;
export const hoverScale = { scale: 1.02 } as const;
```

### FadeIn (scroll reveal)

```typescript
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, easeOut } from "@/lib/motion";

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: duration.normal, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### HoverLift (card hover)

```typescript
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, easeOut, hoverLift } from "@/lib/motion";

export function HoverLift({ children, className }: HoverLiftProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : hoverLift}
      transition={{ duration: duration.fast, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Rules:**

- Client Components only — never use in Server Components directly
- Always call `useReducedMotion()` and skip animation when true
- Import presets from `lib/motion.ts` — no inline duration/easing values
- Use `FadeIn` for sections, `Stagger` for grids, `HoverLift` for cards
- Keep animations subtle — this is a professional tool, not a landing page template
- Do not animate layout-shifting properties on large containers (width, height, grid)

---

## What We Do NOT Use

| Library | Reason |
| ------- | ------ |
| Browserbase | No web browsing in this app |
| Stagehand | No browser automation |
| PostHog | Dashboard stats from Supabase SQL |
| Adzuna | User provides job descriptions manually |
| OpenAI (paid) | Gemini free tier used instead |
| groq-sdk | Gemini only — not used |

If analytics are needed post-MVP, evaluate **Vercel Analytics** (page views) or **Umami** (self-hosted). Neither is required for launch.
