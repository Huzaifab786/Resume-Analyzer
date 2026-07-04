import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATE_IDS,
} from "@/agent/resume-pdf";
import { parseStoredTailoredResume } from "@/agent/types";
import { uploadTailoredResumeFiles } from "@/lib/tailored-resume-files";
import { createSupabaseServer } from "@/lib/supabase-server";

const renderBodySchema = z.object({
  analysisId: z.string().uuid(),
  templateId: z.enum(RESUME_TEMPLATE_IDS).default(DEFAULT_RESUME_TEMPLATE_ID),
  content: z.unknown().optional(),
});

export async function POST(req: NextRequest) {
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

    const body = renderBodySchema.parse(await req.json());
    const { analysisId, templateId } = body;

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("id, tailored_resume_content, changes_applied")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { success: false, error: "Analysis not found." },
        { status: 404 },
      );
    }

    const contentSource = body.content ?? analysis.tailored_resume_content;

    if (!contentSource) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tailored resume content yet. Regenerate the resume first.",
        },
        { status: 400 },
      );
    }

    let resume;
    try {
      resume = parseStoredTailoredResume(contentSource);
    } catch (error) {
      console.error("[api/resume/render]", error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume content is invalid. Check required fields and try again.",
        },
        { status: 400 },
      );
    }

    if (!resume.fullName.trim() || !resume.summary.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name and summary are required." },
        { status: 400 },
      );
    }

    const uploadResult = await uploadTailoredResumeFiles(
      supabase,
      user.id,
      analysisId,
      resume,
      templateId,
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 },
      );
    }

    const now = new Date().toISOString();
    const updatePayload = {
      tailored_resume_status: "completed" as const,
      tailored_resume_path: uploadResult.pdfPath,
      tailored_resume_content: resume,
      resume_template_id: templateId,
      tailored_at: now,
      ...(body.content ? { tailored_content_updated_at: now } : {}),
    };

    const { error: updateError } = await supabase
      .from("analyses")
      .update(updatePayload)
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[api/resume/render]", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to save tailored resume metadata." },
        { status: 500 },
      );
    }

    revalidatePath(`/analyze/${analysisId}`);
    revalidatePath("/history");

    const changesApplied = Array.isArray(analysis.changes_applied)
      ? analysis.changes_applied.filter(
          (item): item is string => typeof item === "string",
        )
      : [];

    return NextResponse.json({
      success: true,
      data: {
        templateId,
        changesApplied,
        content: resume,
      },
    });
  } catch (error) {
    console.error("[api/resume/render]", error);

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
