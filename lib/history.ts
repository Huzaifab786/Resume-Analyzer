import type { SupabaseClient } from "@supabase/supabase-js";

import { MATCH_THRESHOLD } from "@/lib/utils";
import type { Database } from "@/types/database";

export const HISTORY_PAGE_SIZE = 20;

export type HistoryFilter = "all" | "strong" | "needs-work";
export type HistorySort = "newest" | "oldest" | "highest-score";

export type HistoryAnalysisRow = {
  id: string;
  job_title: string | null;
  company: string | null;
  match_score: number | null;
  created_at: string;
  tailored_resume_status: string | null;
};

export type HistoryQueryResult = {
  rows: HistoryAnalysisRow[];
  total: number;
  page: number;
  pageSize: number;
};

export function parseHistoryFilter(value?: string): HistoryFilter {
  if (value === "strong" || value === "needs-work") {
    return value;
  }

  return "all";
}

export function parseHistorySort(value?: string): HistorySort {
  if (value === "oldest" || value === "highest-score") {
    return value;
  }

  return "newest";
}

export function parseHistoryPage(value?: string): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export async function queryHistoryAnalyses(
  supabase: SupabaseClient<Database>,
  userId: string,
  filter: HistoryFilter,
  sort: HistorySort,
  page: number,
): Promise<HistoryQueryResult> {
  const pageSize = HISTORY_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("analyses")
    .select(
      "id, job_title, company, match_score, created_at, tailored_resume_status",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .eq("status", "completed");

  if (filter === "strong") {
    query = query.gte("match_score", MATCH_THRESHOLD);
  } else if (filter === "needs-work") {
    query = query.lt("match_score", MATCH_THRESHOLD);
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "highest-score":
      query = query
        .order("match_score", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    rows: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}
