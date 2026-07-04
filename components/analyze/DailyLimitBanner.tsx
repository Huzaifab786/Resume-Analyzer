import { Clock } from "lucide-react";

import { DAILY_ANALYSIS_LIMIT } from "@/lib/utils";
import { cn } from "@/lib/utils";

type DailyLimitBannerProps = {
  remaining: number;
  limit?: number;
  className?: string;
};

export function DailyLimitBanner({
  remaining,
  limit = DAILY_ANALYSIS_LIMIT,
  className,
}: DailyLimitBannerProps) {
  const isLimitReached = remaining <= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3",
        isLimitReached
          ? "border-warning bg-warning-light"
          : "border-accent/20 bg-accent-muted",
        className,
      )}
    >
      <Clock
        className={cn(
          "size-4 shrink-0",
          isLimitReached ? "text-warning-foreground" : "text-accent-dark",
        )}
      />
      <p
        className={cn(
          "text-sm font-medium",
          isLimitReached ? "text-warning-foreground" : "text-accent-dark",
        )}
      >
        {isLimitReached
          ? `Daily limit reached — ${limit} of ${limit} analyses used today. Try again tomorrow.`
          : `${remaining} of ${limit} analyses remaining today`}
      </p>
    </div>
  );
}
