# Code Standards

Implementation rules for Resume Analyzer. Follow these in every session without exception.

---

## Engineering Mindset

- **Read context files first** — verify against architecture.md and project-overview.md
- **Scope is sacred** — build only the current feature
- **Every feature must be testable** immediately after implementation
- **Clean over clever** — readable code over abstractions
- **One thing at a time** — complete one feature before starting the next
- **Failures are expected** — log analysis failures to DB, show human-readable errors in UI

---

## TypeScript

- Strict mode — no exceptions
- Never use `any` — use `unknown` and narrow
- All function parameters and return types explicitly typed
- Use `type` for object shapes — `interface` only for extendable component props
- All async functions must handle errors

---

## Next.js 16 Conventions

- App Router only
- React 19
- Server Components by default
- `"use client"` only when needed (state, effects, browser APIs, recharts)
- Data fetching in Server Components — not Client Components
- Route handlers in `app/api/` — delegate to `agent/` functions
- Server Actions in `actions/` — never inline in components
- Read Next.js docs in `node_modules/next/dist/docs/` before implementing framework features

---

## File and Folder Naming

- Folders: kebab-case — `analysis-result`
- Component files: PascalCase — `StatsBar.tsx`
- Utility files: camelCase — `supabase-server.ts`, `ai.ts`
- API routes: always `route.ts`
- Server Actions: camelCase — `analyses.ts`, `profile.ts`
- One component per file — named exports only

---

## Component Structure

```typescript
"use client"; // only if needed

import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";

type Props = {
  analysisId: string;
  matchScore: number;
};

export function ComponentName({ analysisId, matchScore }: Props) {
  // state → derived → handlers → return
}
```

- No inline styles — Tailwind + CSS variables from ui-tokens.md
- No default exports for components

---

## API Route Handlers

```typescript
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    // validate → call agent → return
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/analyze]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

- Always try/catch
- Always validate request body
- Log with route prefix: `[api/analyze]`
- Return `{ success: boolean, data?: T, error?: string }`
- Auth check on every protected route

---

## Server Actions

```typescript
"use server";

export async function deleteAnalysis(analysisId: string) {
  try {
    const supabase = await createSupabaseServer();
    // auth + scoped delete
    revalidatePath("/history");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[actions/analyses]", error);
    return { success: false, error: "Failed to delete analysis" };
  }
}
```

- Never throw — return `{ success: false, error }`
- Always `revalidatePath` after mutations

---

## Agent Code

```typescript
export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string,
): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
  try {
    const data = await runAnalysis(resumeText, jobDescription);
    return { success: true, data };
  } catch (error) {
    console.error("[agent/analyzer]", error);
    return { success: false, error: String(error) };
  }
}
```

- Agent functions never import from `components/` or `actions/`
- No React hooks or browser APIs in agent code

---

## Supabase Client Usage

- Browser: `createSupabaseClient()` in Client Components only
- Server: `await createSupabaseServer()` everywhere else
- Always scope queries to `user_id`

---

## Error Handling

- Console errors include prefix: `[component/function name]`
- User-facing errors are human readable — never raw stack traces
- Failed analyses set `status: failed` + `error_message` in DB
- API errors return generic 500 message — never expose internals

---

## Environment Variables

| Variable                        | Used In                |
| ------------------------------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | supabase clients       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase clients       |
| `GEMINI_API_KEY`                | lib/ai.ts              |

`NEXT_PUBLIC_` prefix only for non-secret values. Never expose AI keys to the browser.

---

## Rate Limits

- Enforce `DAILY_ANALYSIS_LIMIT` in `POST /api/analyze` only
- Regeneration (`POST /api/resume/regenerate`) does **not** count toward daily limit
- Return `429` with human-readable message when limit exceeded
- Show remaining count on `/analyze` — e.g. "3 of 5 analyses remaining today"

---

## Match Threshold

```typescript
// lib/utils.ts
export const MATCH_THRESHOLD = 70;
export const DAILY_ANALYSIS_LIMIT = 5;
```

Import everywhere — never hardcode `70` or `5` in components or routes.

---

## Import Aliases

Always use `@/` — never deep relative imports.

---

## Dependencies

Approved for this project:

- `@supabase/ssr` — Supabase auth + DB
- `@supabase/supabase-js` — Supabase client
- `@google/generative-ai` — Gemini AI (only approved AI provider)
- `pdf-parse` — PDF text extraction
- `@react-pdf/renderer` — Tailored resume PDF generation
- `zod` — Schema validation
- `recharts` — Dashboard chart only
- `lucide-react` — Icons
- `framer-motion` — Subtle animations and hover effects (via `components/motion/`)
- `tailwindcss` — Styling
- shadcn/ui components

Do not install Browserbase, Stagehand, PostHog, or OpenAI without updating this list and context files first.

---

## Comments

- No comments explaining what code does
- Comments only for non-obvious why
- No TODO comments in committed code
