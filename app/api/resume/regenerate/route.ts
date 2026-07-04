import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATE_IDS,
} from "@/agent/resume-pdf";
import { tailorResumeForJob } from "@/agent/tailor";
import {
  extractTextFromPdf,
  isResumeTextValid,
} from "@/agent/extractor";
import { uploadTailoredResumeFiles } from "@/lib/tailored-resume-files";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { AnalysisResult } from "@/types";

const regenerateBodySchema = z.object({
  analysisId: z.string().uuid(),
  templateId: z.enum(RESUME_TEMPLATE_IDS).default(DEFAULT_RESUME_TEMPLATE_ID),
});

export async function POST(req: NextRequest) {
  let analysisId: string | null = null;

  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = regenerateBodySchema.parse(await req.json());
    analysisId = body.analysisId;
    const templateId = body.templateId;

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select(
        "id, user_id, job_title, company, job_description, result, status",
      )
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { success: false, error: "Analysis not found." },
        { status: 404 },
      );
    }

    if (analysis.status !== "completed" || !analysis.result) {
      return NextResponse.json(
        { success: false, error: "Only completed analyses can be tailored." },
        { status: 400 },
      );
    }

    await supabase
      .from("analyses")
      .update({ tailored_resume_status: "pending" })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("resume_pdf_url")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.resume_pdf_url) {
      await supabase
        .from("analyses")
        .update({ tailored_resume_status: "failed" })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return NextResponse.json(
        { success: false, error: "No saved resume found. Upload a resume first." },
        { status: 400 },
      );
    }

    const { data: resumeFile, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(profile.resume_pdf_url);

    if (downloadError || !resumeFile) {
      console.error("[api/resume/regenerate]", downloadError);
      await supabase
        .from("analyses")
        .update({ tailored_resume_status: "failed" })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return NextResponse.json(
        { success: false, error: "Could not load your saved resume." },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const resumeText = await extractTextFromPdf(resumeBuffer);

    if (!isResumeTextValid(resumeText)) {
      await supabase
        .from("analyses")
        .update({ tailored_resume_status: "failed" })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return NextResponse.json(
        {
          success: false,
          error: "Could not read text from this PDF. Try a text-based PDF.",
        },
        { status: 400 },
      );
    }

    const tailorResult = await tailorResumeForJob(
      resumeText,
      analysis.job_description,
      analysis.result as AnalysisResult,
      analysis.job_title,
      analysis.company,
    );

    if (!tailorResult.success) {
      await supabase
        .from("analyses")
        .update({ tailored_resume_status: "failed" })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return NextResponse.json(
        { success: false, error: tailorResult.error },
        { status: 500 },
      );
    }

    const uploadResult = await uploadTailoredResumeFiles(
      supabase,
      user.id,
      analysisId,
      tailorResult.data,
      templateId,
    );

    if (!uploadResult.success) {
      await supabase
        .from("analyses")
        .update({ tailored_resume_status: "failed" })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 },
      );
    }

    const tailoredAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        tailored_resume_status: "completed",
        tailored_resume_path: uploadResult.pdfPath,
        tailored_resume_content: tailorResult.data,
        resume_template_id: templateId,
        changes_applied: tailorResult.data.changesApplied,
        tailored_at: tailoredAt,
        tailored_content_updated_at: tailoredAt,
      })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[api/resume/regenerate]", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to save tailored resume metadata." },
        { status: 500 },
      );
    }

    revalidatePath(`/analyze/${analysisId}`);
    revalidatePath("/history");

    return NextResponse.json({
      success: true,
      data: {
        changesApplied: tailorResult.data.changesApplied,
        templateId,
        content: tailorResult.data,
      },
    });
  } catch (error) {
    console.error("[api/resume/regenerate]", error);

    if (analysisId) {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("analyses")
          .update({ tailored_resume_status: "failed" })
          .eq("id", analysisId)
          .eq("user_id", user.id);
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
