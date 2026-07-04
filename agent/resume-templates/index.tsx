import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";

import type { TailoredResume } from "@/agent/types";
import { ClassicResumeDocument } from "@/agent/resume-templates/classic";
import { MinimalResumeDocument } from "@/agent/resume-templates/minimal";
import { ModernResumeDocument } from "@/agent/resume-templates/modern";

export const RESUME_TEMPLATE_IDS = ["classic", "modern", "minimal"] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export const DEFAULT_RESUME_TEMPLATE_ID: ResumeTemplateId = "classic";

export type ResumeTemplateMeta = {
  id: ResumeTemplateId;
  name: string;
  description: string;
};

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Centered header, ruled sections, categorized skills",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Navy accents, double header rule, bold hierarchy",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Gray section bars, three-column skills grid",
  },
];

export function isResumeTemplateId(value: unknown): value is ResumeTemplateId {
  return (
    typeof value === "string" &&
    (RESUME_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

export function parseResumeTemplateId(value: unknown): ResumeTemplateId {
  return isResumeTemplateId(value) ? value : DEFAULT_RESUME_TEMPLATE_ID;
}

export function buildResumeDocument(
  resume: TailoredResume,
  templateId: ResumeTemplateId = DEFAULT_RESUME_TEMPLATE_ID,
): ReactElement<DocumentProps> {
  switch (templateId) {
    case "modern":
      return <ModernResumeDocument resume={resume} />;
    case "minimal":
      return <MinimalResumeDocument resume={resume} />;
    case "classic":
    default:
      return <ClassicResumeDocument resume={resume} />;
  }
}
