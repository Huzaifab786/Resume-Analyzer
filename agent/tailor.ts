import { chatJson } from "@/lib/ai";
import {
  type AnalysisResult,
  type TailoredResume,
  parseTailoredResume,
} from "@/agent/types";

const MAX_RESUME_CHARS = 12_000;
const MAX_JOB_DESCRIPTION_CHARS = 8_000;

type TailorSuccess = {
  success: true;
  data: TailoredResume;
};

type TailorFailure = {
  success: false;
  error: string;
};

export type TailorResumeResult = TailorSuccess | TailorFailure;

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n\n[Truncated for length]`;
}

const MATCH_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "based",
  "company",
  "for",
  "in",
  "inc",
  "llc",
  "ltd",
  "of",
  "on",
  "or",
  "remote",
  "the",
  "to",
  "uk",
  "us",
  "usa",
]);

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(value: string): string[] {
  return normalizeForMatch(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !MATCH_STOPWORDS.has(token));
}

/** True when candidate text is supported by the original resume (tolerant of PDF/AI wording). */
function appearsInOriginal(original: string, candidate: string): boolean {
  const needle = normalizeForMatch(candidate);
  if (!needle) {
    return true;
  }

  if (original.includes(needle)) {
    return true;
  }

  const tokens = significantTokens(candidate);
  if (tokens.length === 0) {
    return needle
      .split(" ")
      .filter(Boolean)
      .every((token) => original.includes(token));
  }

  // All meaningful tokens must appear somewhere in the extracted resume text.
  // Order-independent so "Frontend Developer — Acme" still matches split PDF lines.
  return tokens.every((token) => original.includes(token));
}

function titleAppearsInOriginal(original: string, title: string): boolean {
  if (appearsInOriginal(original, title)) {
    return true;
  }

  // Allow minor seniority wording differences (e.g. AI adds/removes "Senior").
  const withoutSeniority = title.replace(
    /^(senior|junior|lead|staff|principal|associate)\s+/i,
    "",
  );

  if (
    withoutSeniority !== title &&
    appearsInOriginal(original, withoutSeniority)
  ) {
    return true;
  }

  return false;
}

export function validateTailoredAgainstOriginal(
  originalResumeText: string,
  tailored: TailoredResume,
): string | null {
  const original = normalizeForMatch(originalResumeText);

  for (const job of tailored.experience) {
    if (!appearsInOriginal(original, job.company)) {
      return "Tailored resume added an employer not found in your original resume.";
    }

    if (!titleAppearsInOriginal(original, job.title)) {
      return "Tailored resume added a job title not found in your original resume.";
    }
  }

  for (const school of tailored.education) {
    if (!appearsInOriginal(original, school.institution)) {
      return "Tailored resume added education not found in your original resume.";
    }
  }

  for (const project of tailored.projects) {
    const projectKey =
      project.name.split(/[—\-–|]/)[0]?.trim() || project.name;

    if (
      !appearsInOriginal(original, project.name) &&
      !appearsInOriginal(original, projectKey)
    ) {
      return "Tailored resume added a project not found in your original resume.";
    }
  }

  return null;
}

export async function tailorResumeForJob(
  originalResumeText: string,
  jobDescription: string,
  analysisResult: AnalysisResult,
  jobTitle?: string | null,
  company?: string | null,
): Promise<TailorResumeResult> {
  try {
    const systemPrompt = `You are an expert resume writer and ATS specialist.
Rewrite the candidate's resume to better match the job description using the analysis feedback.
Return ONLY valid JSON matching the required schema.

Rules:
- Preserve the original resume's structure, section content, and formatting conventions (dates, locations, personal details, links, skill proficiency levels, company descriptions, projects)
- Always include a projects array when the original resume has projects — do not drop the Projects section
- Never add employers, job titles, degrees, certifications, projects, or skills not supported by the original resume
- Keep job titles and employer names as close as possible to the original wording (do not rename roles)
- Keep personal details (date of birth, nationality, etc.) and links exactly as they appear in the original — do not invent new ones
- Integrate missing ATS keywords only where the candidate's real experience supports them
- Rephrase bullets for impact with stronger action verbs; quantify only when data exists in the original
- Frame skill gaps using adjacent experience honestly — never claim expertise the candidate lacks
- Return a changesApplied array describing each edit in plain English`;

    const userPrompt = `JOB TITLE: ${jobTitle ?? "Not provided"}
COMPANY: ${company ?? "Not provided"}

JOB DESCRIPTION:
${truncateText(jobDescription, MAX_JOB_DESCRIPTION_CHARS)}

ANALYSIS RESULT:
${JSON.stringify(analysisResult, null, 2)}

ORIGINAL RESUME TEXT:
${truncateText(originalResumeText, MAX_RESUME_CHARS)}

Return JSON with this exact shape:
{
  "fullName": "string",
  "headline": "string or omit — professional title e.g. UX Designer",
  "email": "string or omit",
  "phone": "string or omit",
  "address": "string or omit — full street address from original",
  "location": "string or omit — city/country if separate from address",
  "personalDetails": [{ "label": "Date of birth", "value": "1989/20/03" }],
  "links": [{ "label": "LinkedIn", "url": "https://..." }],
  "summary": "string — profile/summary paragraph",
  "skills": [{ "name": "JavaScript", "category": "Languages", "level": "optional" }],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "Oct 2024",
      "endDate": "Present or omit",
      "location": "New York",
      "companyDescription": "string or omit — tech stack or company context line from original",
      "bullets": ["bullet1", "bullet2"]
    }
  ],
  "projects": [
    {
      "name": "string — project title from original",
      "subtitle": "string or omit — e.g. Final Year Project",
      "technologies": "string or omit — tech stack line",
      "startDate": "string or omit",
      "endDate": "string or omit",
      "url": "string or omit",
      "bullets": ["bullet1", "bullet2"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "startDate": "Jan 2017",
      "endDate": "Feb 2020",
      "location": "New York",
      "year": "string or omit",
      "details": "string or omit — e.g. CGPA: 3.37 / 4.0"
    }
  ],
  "changesApplied": ["change1", "change2"]
}

Preserve date formats from the original resume (e.g. "Oct 2024 — Present").
skills must be an array of { name, category?, level? } objects — use category when the original groups skills (Languages, Frontend, Backend, etc.).
Every experience entry must include bullets (array, can be empty).
projects must be included when present in the original resume (array, can be empty only if original has no projects).
Every education entry must include institution. Include education details like CGPA when present.`;

    const raw = await chatJson(systemPrompt, userPrompt, { temperature: 0.5 });
    const tailored = parseTailoredResume(raw);

    const validationError = validateTailoredAgainstOriginal(
      originalResumeText,
      tailored,
    );

    if (validationError) {
      return { success: false, error: validationError };
    }

    return { success: true, data: tailored };
  } catch (error) {
    console.error("[agent/tailor]", error);
    return {
      success: false,
      error: "Failed to tailor resume. Please try again in a moment.",
    };
  }
}
