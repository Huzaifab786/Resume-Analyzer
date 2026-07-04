import { z } from "zod";

export const atsKeywordsSchema = z.object({
  found: z.array(z.string()),
  missing: z.array(z.string()),
  matchPercentage: z.number().min(0).max(100),
});

export const experienceAlignmentSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});

export const analysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchSummary: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()),
  atsKeywords: atsKeywordsSchema,
  experienceAlignment: experienceAlignmentSchema,
  improvementSuggestions: z.array(z.string()),
});

export type AtsKeywords = z.infer<typeof atsKeywordsSchema>;
export type ExperienceAlignment = z.infer<typeof experienceAlignmentSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export function parseAnalysisResult(raw: string): AnalysisResult {
  return analysisResultSchema.parse(JSON.parse(raw));
}

export const tailoredExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  companyDescription: z.string().optional(),
  bullets: z.array(z.string()),
});

export const tailoredEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  details: z.string().optional(),
});

export const tailoredProjectSchema = z.object({
  name: z.string(),
  subtitle: z.string().optional(),
  technologies: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().optional(),
  bullets: z.array(z.string()),
});

export const tailoredSkillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
  category: z.string().optional(),
});

export const tailoredDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const tailoredLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const tailoredResumeSchema = z.object({
  fullName: z.string(),
  headline: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  personalDetails: z.array(tailoredDetailSchema).optional(),
  links: z.array(tailoredLinkSchema).optional(),
  summary: z.string(),
  skills: z.array(tailoredSkillSchema),
  experience: z.array(tailoredExperienceSchema),
  projects: z.array(tailoredProjectSchema).default([]),
  education: z.array(tailoredEducationSchema),
  changesApplied: z.array(z.string()),
});

export type TailoredResume = z.infer<typeof tailoredResumeSchema>;

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") {
          return [item.trim()];
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const text =
            optionalString(record.text) ??
            optionalString(record.label) ??
            optionalString(record.name);

          return text ? [text] : [];
        }

        return [];
      })
      .filter((item) => item.length > 0);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => toStringArray(item));
  }

  if (typeof value === "string") {
    return value
      .split(/[,;•\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function normalizeExperienceEntry(
  entry: unknown,
): z.infer<typeof tailoredExperienceSchema> | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const company = optionalString(record.company);
  const title =
    optionalString(record.title) ??
    optionalString(record.jobTitle) ??
    optionalString(record.role);
  const startDate =
    optionalString(record.startDate) ??
    optionalString(record.start) ??
    optionalString(record.from);

  if (!company || !title || !startDate) {
    return null;
  }

  return {
    company,
    title,
    startDate,
    endDate:
      optionalString(record.endDate) ??
      optionalString(record.end) ??
      optionalString(record.to),
    location: optionalString(record.location),
    companyDescription:
      optionalString(record.companyDescription) ??
      optionalString(record.companySummary),
    bullets: toStringArray(
      record.bullets ??
        record.responsibilities ??
        record.highlights ??
        record.achievements,
    ),
  };
}

function normalizeSkillEntry(
  entry: unknown,
  fallbackCategory?: string,
): z.infer<typeof tailoredSkillSchema> | null {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    if (!trimmed) {
      return null;
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0 && colonIndex < trimmed.length - 1) {
      return {
        name: trimmed.slice(colonIndex + 1).trim(),
        category: trimmed.slice(0, colonIndex).trim(),
      };
    }

    return {
      name: trimmed,
      category: fallbackCategory,
    };
  }

  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const name =
    optionalString(record.name) ??
    optionalString(record.skill) ??
    optionalString(record.label);

  if (!name) {
    return null;
  }

  return {
    name,
    level:
      optionalString(record.level) ??
      optionalString(record.proficiency) ??
      optionalString(record.rating),
    category:
      optionalString(record.category) ??
      optionalString(record.group) ??
      fallbackCategory,
  };
}

function normalizeSkills(value: unknown): z.infer<typeof tailoredSkillSchema>[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeSkillEntry(entry))
      .filter((entry): entry is z.infer<typeof tailoredSkillSchema> => entry !== null);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, item]) => {
        if (typeof item === "string") {
          const items = item
            .split(/[,;]/)
            .map((part) => part.trim())
            .filter(Boolean);

          if (items.length > 1) {
            return items.map((name) => ({ name, category: key }));
          }

          return [{ name: item.trim() || key, category: key }];
        }

        if (Array.isArray(item)) {
          return item
            .map((entry) => normalizeSkillEntry(entry, key))
            .filter(
              (entry): entry is z.infer<typeof tailoredSkillSchema> =>
                entry !== null,
            );
        }

        const normalized = normalizeSkillEntry(item, key);
        return normalized ? [normalized] : [];
      },
    );
  }

  return toStringArray(value)
    .map((name) => ({ name }))
    .filter((skill) => skill.name.length > 0);
}

function normalizeDetailEntry(
  entry: unknown,
): z.infer<typeof tailoredDetailSchema> | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const label = optionalString(record.label) ?? optionalString(record.key);
  const value = optionalString(record.value);

  if (!label || !value) {
    return null;
  }

  return { label, value };
}

function normalizeLinkEntry(
  entry: unknown,
): z.infer<typeof tailoredLinkSchema> | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const label = optionalString(record.label) ?? optionalString(record.name);
  const url =
    optionalString(record.url) ??
    optionalString(record.href) ??
    optionalString(record.link);

  if (!label || !url) {
    return null;
  }

  return { label, url };
}

function normalizeProjectEntry(
  entry: unknown,
): z.infer<typeof tailoredProjectSchema> | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const name =
    optionalString(record.name) ??
    optionalString(record.title) ??
    optionalString(record.projectName) ??
    optionalString(record.project);

  if (!name) {
    return null;
  }

  const technologies =
    optionalString(record.technologies) ??
    optionalString(record.techStack) ??
    optionalString(record.tech) ??
    optionalString(record.stack);

  return {
    name,
    subtitle:
      optionalString(record.subtitle) ??
      optionalString(record.context) ??
      optionalString(record.type) ??
      optionalString(record.role),
    technologies,
    startDate:
      optionalString(record.startDate) ??
      optionalString(record.start) ??
      optionalString(record.from),
    endDate:
      optionalString(record.endDate) ??
      optionalString(record.end) ??
      optionalString(record.to),
    url:
      optionalString(record.url) ??
      optionalString(record.link) ??
      optionalString(record.href),
    bullets: toStringArray(
      record.bullets ??
        record.highlights ??
        record.achievements ??
        record.description,
    ),
  };
}

function normalizeEducationEntry(
  entry: unknown,
): z.infer<typeof tailoredEducationSchema> | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const degree =
    optionalString(record.degree) ??
    optionalString(record.qualification) ??
    optionalString(record.program);
  const institution =
    optionalString(record.institution) ??
    optionalString(record.school) ??
    optionalString(record.university) ??
    optionalString(record.college);

  if (!degree || !institution) {
    return null;
  }

  return {
    degree,
    institution,
    year:
      optionalString(record.year) ??
      optionalString(record.graduationYear) ??
      optionalString(record.graduation),
    startDate:
      optionalString(record.startDate) ??
      optionalString(record.start) ??
      optionalString(record.from),
    endDate:
      optionalString(record.endDate) ??
      optionalString(record.end) ??
      optionalString(record.to),
    location: optionalString(record.location),
    details:
      optionalString(record.details) ??
      optionalString(record.note) ??
      optionalString(record.cgpa) ??
      optionalString(record.gpa),
  };
}

export function normalizeTailoredResumeInput(input: unknown): unknown {
  if (!input || typeof input !== "object") {
    return input;
  }

  const record = input as Record<string, unknown>;

  const linkedinUrl =
    optionalString(record.linkedinUrl) ?? optionalString(record.linkedin);
  const links = Array.isArray(record.links)
    ? record.links
        .map((entry) => normalizeLinkEntry(entry))
        .filter((entry): entry is z.infer<typeof tailoredLinkSchema> => entry !== null)
    : [];

  return {
    fullName:
      optionalString(record.fullName) ??
      optionalString(record.name) ??
      "Candidate",
    headline:
      optionalString(record.headline) ??
      optionalString(record.title) ??
      optionalString(record.jobTitle),
    email: optionalString(record.email),
    phone: optionalString(record.phone),
    address: optionalString(record.address),
    location: optionalString(record.location),
    linkedinUrl,
    personalDetails: Array.isArray(record.personalDetails)
      ? record.personalDetails
          .map((entry) => normalizeDetailEntry(entry))
          .filter(
            (entry): entry is z.infer<typeof tailoredDetailSchema> =>
              entry !== null,
          )
      : undefined,
    links:
      links.length > 0
        ? links
        : linkedinUrl
          ? [{ label: "LinkedIn", url: linkedinUrl }]
          : undefined,
    summary:
      optionalString(record.summary) ??
      optionalString(record.profile) ??
      "",
    skills: normalizeSkills(record.skills),
    experience: Array.isArray(record.experience)
      ? record.experience
          .map((entry) => normalizeExperienceEntry(entry))
          .filter((entry): entry is z.infer<typeof tailoredExperienceSchema> =>
            entry !== null,
          )
      : [],
    projects: Array.isArray(record.projects)
      ? record.projects
          .map((entry) => normalizeProjectEntry(entry))
          .filter((entry): entry is z.infer<typeof tailoredProjectSchema> =>
            entry !== null,
          )
      : [],
    education: Array.isArray(record.education)
      ? record.education
          .map((entry) => normalizeEducationEntry(entry))
          .filter((entry): entry is z.infer<typeof tailoredEducationSchema> =>
            entry !== null,
          )
      : [],
    changesApplied: toStringArray(record.changesApplied ?? record.changes),
  };
}

export function parseTailoredResume(raw: string): TailoredResume {
  const parsed = JSON.parse(raw) as unknown;
  return tailoredResumeSchema.parse(normalizeTailoredResumeInput(parsed));
}

export function parseStoredTailoredResume(value: unknown): TailoredResume {
  return tailoredResumeSchema.parse(normalizeTailoredResumeInput(value));
}
