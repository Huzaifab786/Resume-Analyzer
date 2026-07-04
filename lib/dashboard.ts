import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type DashboardStatId =
  | "total"
  | "avg"
  | "best"
  | "regenerated"
  | "week";

export type DashboardStat = {
  id: DashboardStatId;
  label: string;
  value: string;
  trend: string;
  trendTone: "positive" | "neutral" | "negative";
};

export type DashboardRecentAnalysis = {
  id: string;
  jobTitle: string;
  company: string | null;
  matchScore: number;
  createdAt: string;
};

export type DashboardTrendPoint = {
  label: string;
  score: number;
};

export type DashboardData = {
  stats: DashboardStat[];
  recentAnalyses: DashboardRecentAnalysis[];
  scoreTrend: DashboardTrendPoint[];
  totalCompleted: number;
};

type CompletedAnalysisRow = {
  id: string;
  job_title: string | null;
  company: string | null;
  match_score: number | null;
  created_at: string;
  tailored_resume_status: string | null;
};

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function daysAgoUtc(days: number): Date {
  const date = startOfUtcDay(new Date());
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function formatTrendDelta(delta: number, asPercent = false): {
  trend: string;
  trendTone: DashboardStat["trendTone"];
} {
  if (delta === 0) {
    return { trend: "stable", trendTone: "neutral" };
  }

  const sign = delta > 0 ? "+" : "";
  const value = asPercent ? `${sign}${delta}%` : `${sign}${delta}`;

  return {
    trend: value,
    trendTone: delta > 0 ? "positive" : "negative",
  };
}

function average(scores: number[]): number | null {
  if (scores.length === 0) {
    return null;
  }

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function buildScoreTrend(
  rows: CompletedAnalysisRow[],
): DashboardTrendPoint[] {
  const start = daysAgoUtc(29);
  const byDay = new Map<string, number[]>();

  for (const row of rows) {
    if (row.match_score == null) continue;

    const created = new Date(row.created_at);
    if (created < start) continue;

    const key = created.toISOString().slice(0, 10);
    const scores = byDay.get(key) ?? [];
    scores.push(row.match_score);
    byDay.set(key, scores);
  }

  const points: DashboardTrendPoint[] = [];

  for (let offset = 0; offset < 30; offset += 1) {
    const day = daysAgoUtc(29 - offset);
    const key = day.toISOString().slice(0, 10);
    const scores = byDay.get(key);

    if (!scores || scores.length === 0) {
      continue;
    }

    const avg = average(scores);
    if (avg == null) continue;

    points.push({
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(day),
      score: Math.round(avg),
    });
  }

  return points;
}

function buildStats(rows: CompletedAnalysisRow[]): DashboardStat[] {
  const weekStart = daysAgoUtc(6);
  const prevWeekStart = daysAgoUtc(13);

  const scores = rows
    .map((row) => row.match_score)
    .filter((score): score is number => score != null);

  const thisWeekRows = rows.filter(
    (row) => new Date(row.created_at) >= weekStart,
  );
  const prevWeekRows = rows.filter((row) => {
    const created = new Date(row.created_at);
    return created >= prevWeekStart && created < weekStart;
  });

  const thisWeekScores = thisWeekRows
    .map((row) => row.match_score)
    .filter((score): score is number => score != null);
  const prevWeekScores = prevWeekRows
    .map((row) => row.match_score)
    .filter((score): score is number => score != null);

  const total = rows.length;
  const avgScore = average(scores);
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;
  const regenerated = rows.filter(
    (row) => row.tailored_resume_status === "completed",
  ).length;
  const thisWeek = thisWeekRows.length;
  const prevWeek = prevWeekRows.length;

  const thisWeekAvg = average(thisWeekScores);
  const prevWeekAvg = average(prevWeekScores);
  const avgDelta =
    thisWeekAvg != null && prevWeekAvg != null
      ? Math.round(thisWeekAvg - prevWeekAvg)
      : 0;

  const regeneratedThisWeek = thisWeekRows.filter(
    (row) => row.tailored_resume_status === "completed",
  ).length;
  const regeneratedPrevWeek = prevWeekRows.filter(
    (row) => row.tailored_resume_status === "completed",
  ).length;

  const bestThisWeek =
    bestScore != null &&
    thisWeekRows.some((row) => row.match_score === bestScore);

  return [
    {
      id: "total",
      label: "Total Analyses",
      value: String(total),
      ...formatTrendDelta(thisWeek - prevWeek),
    },
    {
      id: "avg",
      label: "Avg Match Score",
      value: avgScore == null ? "—" : `${Math.round(avgScore)}%`,
      ...formatTrendDelta(avgDelta, true),
    },
    {
      id: "best",
      label: "Best Match",
      value: bestScore == null ? "—" : `${bestScore}%`,
      trend: bestThisWeek ? "new best" : "stable",
      trendTone: bestThisWeek ? "positive" : "neutral",
    },
    {
      id: "regenerated",
      label: "Resumes Regenerated",
      value: String(regenerated),
      ...formatTrendDelta(regeneratedThisWeek - regeneratedPrevWeek),
    },
    {
      id: "week",
      label: "This Week",
      value: String(thisWeek),
      ...formatTrendDelta(thisWeek - prevWeek),
    },
  ];
}

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardData> {
  const { data, error } = await supabase
    .from("analyses")
    .select(
      "id, job_title, company, match_score, created_at, tailored_resume_status",
    )
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[lib/dashboard]", error);
    throw new Error("Failed to load dashboard data.");
  }

  const rows = (data ?? []) as CompletedAnalysisRow[];

  const recentAnalyses: DashboardRecentAnalysis[] = rows
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      jobTitle: row.job_title?.trim() || "Untitled role",
      company: row.company,
      matchScore: row.match_score ?? 0,
      createdAt: row.created_at,
    }));

  return {
    stats: buildStats(rows),
    recentAnalyses,
    scoreTrend: buildScoreTrend(rows),
    totalCompleted: rows.length,
  };
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function getDisplayName(email: string | undefined): string {
  if (!email) return "there";

  const local = email.split("@")[0] ?? "there";
  const part = local.split(/[._-]/)[0] ?? local;

  if (!part) return "there";

  return part.charAt(0).toUpperCase() + part.slice(1);
}
