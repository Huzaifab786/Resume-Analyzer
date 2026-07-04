import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { renderTailoredResumeDocx } from "@/agent/resume-docx";
import {
  parseResumeTemplateId,
  renderTailoredResumePdf,
} from "@/agent/resume-pdf";
import { parseStoredTailoredResume } from "@/agent/types";
import { DOCX_MIME } from "@/lib/tailored-resume-files";
import { createSupabaseServer } from "@/lib/supabase-server";

const formatSchema = z.enum(["pdf", "docx"]);

export async function GET(req: NextRequest) {
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

    const analysisId = req.nextUrl.searchParams.get("analysisId");
    const formatResult = formatSchema.safeParse(
      req.nextUrl.searchParams.get("format") ?? "pdf",
    );

    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: "Analysis ID is required." },
        { status: 400 },
      );
    }

    if (!formatResult.success) {
      return NextResponse.json(
        { success: false, error: "Format must be pdf or docx." },
        { status: 400 },
      );
    }

    const format = formatResult.data;

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select(
        "id, job_title, company, tailored_resume_status, tailored_resume_content, resume_template_id",
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

    if (
      analysis.tailored_resume_status !== "completed" ||
      !analysis.tailored_resume_content
    ) {
      return NextResponse.json(
        { success: false, error: "No tailored resume available yet." },
        { status: 400 },
      );
    }

    let resume;
    try {
      resume = parseStoredTailoredResume(analysis.tailored_resume_content);
    } catch {
      return NextResponse.json(
        { success: false, error: "Saved resume content is invalid." },
        { status: 400 },
      );
    }

    const templateId = parseResumeTemplateId(analysis.resume_template_id);
    const buffer =
      format === "pdf"
        ? await renderTailoredResumePdf(resume, templateId)
        : await renderTailoredResumeDocx(resume, templateId);

    const filenameBase = analysis.company ?? analysis.job_title ?? "Resume";
    const safeName = filenameBase.replace(/[^\w\-]+/g, "_");
    const extension = format === "pdf" ? "pdf" : "docx";
    const filename = `Tailored_${safeName}.${extension}`;
    const contentType = format === "pdf" ? "application/pdf" : DOCX_MIME;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/resume/download]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
