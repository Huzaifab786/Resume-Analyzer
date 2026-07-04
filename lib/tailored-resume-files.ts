import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getTailoredStoragePaths,
  renderTailoredResumeDocx,
} from "@/agent/resume-docx";
import { renderTailoredResumePdf } from "@/agent/resume-pdf";
import type { ResumeTemplateId } from "@/agent/resume-templates";
import type { TailoredResume } from "@/agent/types";
import type { Database } from "@/types/database";

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type UploadResult =
  | { success: true; pdfPath: string; docxPath: string | null }
  | { success: false; error: string };

async function uploadDocxWithFallback(
  supabase: SupabaseClient<Database>,
  path: string,
  buffer: Buffer,
): Promise<boolean> {
  const attempts = [DOCX_MIME, "application/octet-stream"] as const;

  for (const contentType of attempts) {
    const { error } = await supabase.storage.from("resumes").upload(path, buffer, {
      contentType,
      upsert: true,
    });

    if (!error) {
      return true;
    }

    console.error(`[tailored-resume-files] docx upload (${contentType})`, error);
  }

  return false;
}

export async function uploadTailoredResumeFiles(
  supabase: SupabaseClient<Database>,
  userId: string,
  analysisId: string,
  resume: TailoredResume,
  templateId: ResumeTemplateId,
): Promise<UploadResult> {
  const paths = getTailoredStoragePaths(userId, analysisId);

  const [pdfBuffer, docxBuffer] = await Promise.all([
    renderTailoredResumePdf(resume, templateId),
    renderTailoredResumeDocx(resume, templateId),
  ]);

  const { error: pdfUploadError } = await supabase.storage
    .from("resumes")
    .upload(paths.pdf, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (pdfUploadError) {
    console.error("[tailored-resume-files] pdf", pdfUploadError);
    return { success: false, error: "Failed to save tailored resume PDF." };
  }

  const docxUploaded = await uploadDocxWithFallback(
    supabase,
    paths.docx,
    docxBuffer,
  );

  return {
    success: true,
    pdfPath: paths.pdf,
    docxPath: docxUploaded ? paths.docx : null,
  };
}
