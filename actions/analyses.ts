"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServer } from "@/lib/supabase-server";

type DeleteAnalysisResult = {
  success: boolean;
  error?: string;
};

export async function deleteAnalysis(
  analysisId: string,
): Promise<DeleteAnalysisResult> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[actions/analyses]", error);
      return { success: false, error: "Failed to delete analysis." };
    }

    revalidatePath("/history");
    revalidatePath("/dashboard");
    revalidatePath("/analyze");

    return { success: true };
  } catch (error) {
    console.error("[actions/analyses]", error);
    return { success: false, error: "Failed to delete analysis." };
  }
}
