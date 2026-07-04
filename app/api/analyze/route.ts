import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { analyzeResumeAgainstJob } from "@/agent/analyzer";
import {
  extractTextFromPdf,
  isResumeTextValid,
} from "@/agent/extractor";
import { countAnalysesToday } from "@/lib/analyses";
import { DAILY_ANALYSIS_LIMIT } from "@/lib/utils";
import { createSupabaseServer } from "@/lib/supabase-server";

const analyzeBodySchema = z.object({
  jobDescription: z.string().trim().min(100, "Job description must be at least 100 characters."),
  jobTitle: z.string().trim().optional(),
  company: z.string().trim().optional(),
  useSavedResume: z.boolean().optional().default(true),
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

    const body = analyzeBodySchema.parse(await req.json());

    const usedToday = await countAnalysesToday(supabase, user.id);
    if (usedToday >= DAILY_ANALYSIS_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "Daily limit reached. You can run 5 analyses per day.",
        },
        { status: 429 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("resume_pdf_url, resume_filename")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.resume_pdf_url) {
      return NextResponse.json(
        { success: false, error: "No resume found. Upload a PDF first." },
        { status: 400 },
      );
    }

    const storagePath = profile.resume_pdf_url;
    const { data: resumeFile, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(storagePath);

    if (downloadError || !resumeFile) {
      console.error("[api/analyze]", downloadError);
      return NextResponse.json(
        { success: false, error: "Could not load your saved resume. Try uploading again." },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const resumeText = await extractTextFromPdf(resumeBuffer);

    if (!isResumeTextValid(resumeText)) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not read text from this PDF. Try a text-based PDF.",
        },
        { status: 400 },
      );
    }

    const { data: pendingAnalysis, error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        job_title: body.jobTitle || null,
        company: body.company || null,
        job_description: body.jobDescription,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !pendingAnalysis) {
      console.error("[api/analyze]", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to start analysis. Please try again." },
        { status: 500 },
      );
    }

    analysisId = pendingAnalysis.id;

    const analysisResult = await analyzeResumeAgainstJob(
      resumeText,
      body.jobDescription,
      body.jobTitle,
      body.company,
    );

    if (!analysisResult.success) {
      await supabase
        .from("analyses")
        .update({
          status: "failed",
          error_message: analysisResult.error,
        })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return NextResponse.json(
        { success: false, error: analysisResult.error },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        match_score: analysisResult.data.matchScore,
        result: analysisResult.data,
        status: "completed",
        error_message: null,
      })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[api/analyze]", updateError);
      return NextResponse.json(
        { success: false, error: "Analysis completed but failed to save results." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { analysisId },
    });
  } catch (error) {
    console.error("[api/analyze]", error);

    if (analysisId) {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("analyses")
          .update({
            status: "failed",
            error_message: "Analysis failed unexpectedly.",
          })
          .eq("id", analysisId)
          .eq("user_id", user.id);
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
