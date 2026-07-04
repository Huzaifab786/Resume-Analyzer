import Link from "next/link";
import { FileText } from "lucide-react";

import {
  formatRelativeTime,
  type DashboardRecentAnalysis,
} from "@/lib/dashboard";
import { cn, getMatchScoreColors } from "@/lib/utils";

type RecentAnalysesProps = {
  analyses: DashboardRecentAnalysis[];
};

export function RecentAnalyses({ analyses }: RecentAnalysesProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          Recent Analyses
        </h2>
      </div>

      {analyses.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">
          No analyses yet. Run your first match to see it here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {analyses.map((analysis) => {
            const colors = getMatchScoreColors(analysis.matchScore);

            return (
              <li key={analysis.id}>
                <Link
                  href={`/analyze/${analysis.id}`}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-surface-secondary/60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light">
                    <FileText className="size-4 text-accent-dark" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {analysis.jobTitle}
                    </p>
                    <p className="truncate text-sm text-text-secondary">
                      {analysis.company ?? "Company not set"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                      colors.bg,
                      colors.text,
                    )}
                  >
                    {analysis.matchScore}%
                  </span>
                  <span className="hidden w-24 shrink-0 text-right text-xs text-text-muted sm:block">
                    {formatRelativeTime(analysis.createdAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-2 border-t border-border pt-4 text-center">
        <Link
          href="/history"
          className="text-sm font-medium text-accent-dark transition-colors hover:text-accent"
        >
          View all analyses
        </Link>
      </div>
    </section>
  );
}
