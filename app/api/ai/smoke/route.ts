import { NextResponse } from "next/server";

import { GEMINI_MODEL, chatJson } from "@/lib/ai";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured" },
        { status: 503 },
      );
    }

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

    const raw = await chatJson(
      "You are a health check endpoint. Return ONLY valid JSON with no markdown.",
      `Return JSON: { "status": "ok", "model": "${GEMINI_MODEL}" }`,
    );

    const data = JSON.parse(raw) as { status: string; model: string };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[api/ai/smoke]", error);

    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.includes("Too Many Requests")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API quota exceeded for this key. Open https://aistudio.google.com → check API key usage, or wait ~1 minute and retry.",
        },
        { status: 429 },
      );
    }

    if (
      message.includes("API key not valid") ||
      message.includes("API_KEY_INVALID")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid GEMINI_API_KEY. Create a new key at https://aistudio.google.com/apikey",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "AI smoke test failed" },
      { status: 500 },
    );
  }
}
