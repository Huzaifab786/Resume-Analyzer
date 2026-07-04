import { Check, X } from "lucide-react";

import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AtsKeywords } from "@/types";

type AtsKeywordsCardProps = {
  atsKeywords: AtsKeywords;
};

type KeywordListProps = {
  label: string;
  keywords: string[];
  variant: "found" | "missing";
};

function KeywordList({ label, keywords, variant }: KeywordListProps) {
  if (keywords.length === 0) {
    return null;
  }

  const isFound = variant === "found";

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
              isFound
                ? "bg-success-lightest text-success-foreground"
                : "bg-error-light text-error",
            )}
          >
            {isFound ? (
              <Check className="size-3" />
            ) : (
              <X className="size-3" />
            )}
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AtsKeywordsCard({ atsKeywords }: AtsKeywordsCardProps) {
  return (
    <section className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold text-text-primary">ATS Keywords</h2>
        <span className="text-sm font-semibold text-accent">
          {atsKeywords.matchPercentage}%
        </span>
      </div>

      <div className="mt-4">
        <Progress value={atsKeywords.matchPercentage}>
          <ProgressTrack className="h-2 bg-surface-secondary">
            <ProgressIndicator className="bg-accent" />
          </ProgressTrack>
        </Progress>
        <p className="mt-1 text-xs text-text-muted">Keyword scan score</p>
      </div>

      <div className="mt-5 space-y-4">
        <KeywordList
          label="Found"
          keywords={atsKeywords.found}
          variant="found"
        />
        <KeywordList
          label="Missing"
          keywords={atsKeywords.missing}
          variant="missing"
        />
      </div>
    </section>
  );
}
