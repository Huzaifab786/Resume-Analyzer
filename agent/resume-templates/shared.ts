import type { TailoredResume } from "@/agent/types";

export const SECTION_HEADINGS = {
  summary: "Professional Summary",
  skills: "Technical Skills",
  experience: "Work Experience",
  projects: "Projects",
  education: "Education",
} as const;

export type ContactPart = {
  text: string;
  href?: string;
};

export function formatDateRange(startDate: string, endDate?: string): string {
  return `${startDate} — ${endDate?.trim() || "Present"}`;
}

export function getContactParts(resume: TailoredResume): ContactPart[] {
  const parts: ContactPart[] = [];

  const location = resume.address ?? resume.location;
  if (location) {
    parts.push({ text: location });
  }

  if (resume.email) {
    parts.push({ text: resume.email, href: `mailto:${resume.email}` });
  }

  if (resume.phone) {
    parts.push({ text: resume.phone });
  }

  const links = resume.links ?? [];
  if (links.length > 0) {
    for (const link of links) {
      parts.push({ text: link.label, href: link.url });
    }
  } else if (resume.linkedinUrl) {
    parts.push({ text: "LinkedIn", href: resume.linkedinUrl });
  }

  return parts;
}

export function formatContactLine(
  resume: TailoredResume,
  separator: string,
): string {
  return getContactParts(resume)
    .map((part) => part.text)
    .join(separator);
}

export function groupSkillsByCategory(
  resume: TailoredResume,
): { category: string; skills: string[] }[] {
  const groups = new Map<string, string[]>();

  for (const skill of resume.skills) {
    const category = skill.category?.trim() || "Skills";
    const label = skill.level ? `${skill.name} (${skill.level})` : skill.name;
    const existing = groups.get(category) ?? [];
    existing.push(label);
    groups.set(category, existing);
  }

  return Array.from(groups.entries()).map(([category, skills]) => ({
    category,
    skills,
  }));
}

export function formatSkillLabel(skill: {
  name: string;
  level?: string;
}): string {
  return skill.level ? `${skill.name} (${skill.level})` : skill.name;
}

export function educationDateLabel(school: {
  startDate?: string;
  endDate?: string;
  year?: string;
}): string {
  if (school.startDate) {
    return formatDateRange(school.startDate, school.endDate);
  }

  return school.year ?? school.endDate ?? "";
}
