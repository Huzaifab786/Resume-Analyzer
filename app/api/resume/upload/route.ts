import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServer } from "@/lib/supabase-server";

const ACCEPTED_TYPE = "application/pdf";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 },
      );
    }

    if (file.type !== ACCEPTED_TYPE) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are accepted." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File must be under 5 MB." },
        { status: 400 },
      );
    }

    const storagePath = `${user.id}/resume.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, buffer, {
        contentType: ACCEPTED_TYPE,
        upsert: true,
      });

    if (uploadError) {
      console.error("[api/resume/upload]", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload resume. Please try again." },
        { status: 500 },
      );
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        resume_pdf_url: storagePath,
        resume_filename: file.name,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[api/resume/upload]", profileError);
      return NextResponse.json(
        { success: false, error: "Failed to save resume. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        path: storagePath,
      },
    });
  } catch (error) {
    console.error("[api/resume/upload]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
