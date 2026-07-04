import { cn, getMatchScoreColors } from "@/lib/utils";

type MatchScoreHeaderProps = {
  jobTitle: string | null;
  company: string | null;
  analyzedAt: string;
  matchScore: number;
};

function formatAnalyzedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function MatchScoreHeader({
  jobTitle,
  company,
  analyzedAt,
  matchScore,
}: MatchScoreHeaderProps) {
  const colors = getMatchScoreColors(matchScore);

  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {jobTitle ?? "Analysis Result"}
        </h1>
        {company ? (
          <p className="mt-1 text-sm text-text-secondary">{company}</p>
        ) : null}
        <p className="mt-2 text-xs text-text-muted">
          Analyzed on {formatAnalyzedDate(analyzedAt)}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative size-28">
          <svg className="size-28 -rotate-90" viewBox="0 0 36 36" aria-hidden>
            <path
              className="text-surface-secondary"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={colors.ring}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${matchScore}, 100`}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", colors.text)}>
              {matchScore}%
            </span>
            <span className="text-xs font-medium text-text-muted">Match</span>
          </div>
        </div>
      </div>
    </div>
  );
}
