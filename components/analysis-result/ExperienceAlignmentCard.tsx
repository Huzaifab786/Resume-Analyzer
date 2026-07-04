import type { ExperienceAlignment } from "@/types";

type ExperienceAlignmentCardProps = {
  alignment: ExperienceAlignment;
};

export function ExperienceAlignmentCard({
  alignment,
}: ExperienceAlignmentCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-primary">
        Experience Alignment
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        {alignment.summary}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-success-foreground">
            Strengths
          </p>
          <ul className="mt-2 space-y-2">
            {alignment.strengths.map((strength) => (
              <li
                key={strength}
                className="flex gap-2 text-sm text-text-secondary"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-warning-foreground">
            Gaps
          </p>
          <ul className="mt-2 space-y-2">
            {alignment.gaps.map((gap) => (
              <li key={gap} className="flex gap-2 text-sm text-text-secondary">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
