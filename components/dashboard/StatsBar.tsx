import {
  Award,
  BarChart3,
  CalendarDays,
  FileOutput,
  Target,
  type LucideIcon,
} from "lucide-react";

import type { DashboardStat, DashboardStatId } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

type StatsBarProps = {
  stats: DashboardStat[];
};

const STAT_ICONS: Record<DashboardStatId, LucideIcon> = {
  total: BarChart3,
  avg: Target,
  best: Award,
  regenerated: FileOutput,
  week: CalendarDays,
};

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = STAT_ICONS[stat.id];

        return (
          <article
            key={stat.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {stat.label}
              </p>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-light">
                <Icon className="size-4 text-accent-dark" aria-hidden />
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="text-3xl font-semibold tabular-nums text-text-primary">
                {stat.value}
              </p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  stat.trendTone === "positive" &&
                    "bg-success-lightest text-success-foreground",
                  stat.trendTone === "neutral" &&
                    "bg-accent-light text-accent-dark",
                  stat.trendTone === "negative" &&
                    "bg-error-light text-error",
                )}
              >
                {stat.trend}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
