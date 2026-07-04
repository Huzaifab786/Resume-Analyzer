import { renderToBuffer } from "@react-pdf/renderer";

import type { TailoredResume } from "@/agent/types";
import {
  buildResumeDocument,
  DEFAULT_RESUME_TEMPLATE_ID,
  type ResumeTemplateId,
} from "@/agent/resume-templates";

export async function renderTailoredResumePdf(
  resume: TailoredResume,
  templateId: ResumeTemplateId = DEFAULT_RESUME_TEMPLATE_ID,
): Promise<Buffer> {
  return renderToBuffer(buildResumeDocument(resume, templateId));
}

export {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATE_IDS,
  RESUME_TEMPLATES,
  isResumeTemplateId,
  parseResumeTemplateId,
  type ResumeTemplateId,
  type ResumeTemplateMeta,
} from "@/agent/resume-templates";
