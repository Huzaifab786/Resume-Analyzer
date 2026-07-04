import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseStoredTailoredResume } from "@/agent/types";
import { createSupabaseServer } from "@/lib/supabase-server";

const contentBodySchema = z.object({
  analysisId: z.string().uuid(),
  content: z.unknown(),
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

    const body = contentBodySchema.parse(await req.json());
    const { analysisId } = body;

    let content;
    try {
      content = parseStoredTailoredResume(body.content);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid resume content. Check required fields like name, summary, and experience.",
        },
        { status: 400 },
      );
    }

    if (!content.fullName.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 },
      );
    }

    if (!content.summary.trim()) {
      return NextResponse.json(
        { success: false, error: "Summary is required." },
        { status: 400 },
      );
    }

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("id, tailored_resume_status")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { success: false, error: "Analysis not found." },
        { status: 404 },
      );
    }

    const updatedAt = new Date().toISOString();
    const nextStatus =
      analysis.tailored_resume_status === "completed"
        ? "completed"
        : "pending";

    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        tailored_resume_content: content,
        tailored_content_updated_at: updatedAt,
        tailored_resume_status: nextStatus,
      })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[api/resume/content]", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to save resume edits." },
        { status: 500 },
      );
    }

    revalidatePath(`/analyze/${analysisId}`);

    return NextResponse.json({
      success: true,
      data: {
        content,
        updatedAt,
      },
    });
  } catch (error) {
    console.error("[api/resume/content]", error);

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
