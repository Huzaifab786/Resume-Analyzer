import type { SupabaseClient } from "@supabase/supabase-js";

import { DAILY_ANALYSIS_LIMIT } from "@/lib/utils";
import type { Database } from "@/types/database";

export function getUtcDayStart(): Date {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  return startOfDay;
}

export async function countAnalysesToday(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", getUtcDayStart().toISOString());

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getAnalysesRemainingToday(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const usedToday = await countAnalysesToday(supabase, userId);
  return Math.max(0, DAILY_ANALYSIS_LIMIT - usedToday);
}
