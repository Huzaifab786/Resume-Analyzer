"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn, getMatchScoreColors } from "@/lib/utils";
import type { HistoryAnalysisRow } from "@/lib/history";

type AnalysesTableProps = {
  rows: HistoryAnalysisRow[];
};

function formatHistoryDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-info";
  if (score >= 40) return "bg-warning";
  return "bg-neutral";
}

export function AnalysesTable({ rows }: AnalysesTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Job Title
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Company
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Match Score
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Tailored
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Date
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const score = row.match_score ?? 0;
              const colors = getMatchScoreColors(score);

              return (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/analyze/${row.id}`)}
                  className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary"
                >
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">
                    {row.job_title ?? "Untitled role"}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {row.company ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-secondary">
                        <div
                          className={cn("h-full rounded-full", getScoreBarColor(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={cn("text-sm font-medium tabular-nums", colors.text)}>
                        {score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {row.tailored_resume_status === "completed" ? (
                      <span className="inline-flex rounded-full bg-success-lightest px-2.5 py-0.5 text-xs font-medium text-success-foreground">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {formatHistoryDate(row.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/analyze/${row.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
