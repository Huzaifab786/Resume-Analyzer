import { cn } from "@/lib/utils";

type SkillsBreakdownProps = {
  matchedSkills: string[];
  missingSkills: string[];
  niceToHaveSkills: string[];
};

type SkillGroupProps = {
  label: string;
  skills: string[];
  badgeClassName: string;
};

function SkillGroup({ label, skills, badgeClassName }: SkillGroupProps) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              badgeClassName,
            )}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SkillsBreakdown({
  matchedSkills,
  missingSkills,
  niceToHaveSkills,
}: SkillsBreakdownProps) {
  const hasSkills =
    matchedSkills.length > 0 ||
    missingSkills.length > 0 ||
    niceToHaveSkills.length > 0;

  return (
    <section className="h-full rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-primary">Skills Breakdown</h2>

      {hasSkills ? (
        <div className="mt-4 space-y-4">
          <SkillGroup
            label="Matched"
            skills={matchedSkills}
            badgeClassName="bg-success-lightest text-success-foreground"
          />
          <SkillGroup
            label="Missing"
            skills={missingSkills}
            badgeClassName="bg-warning-light text-warning-foreground"
          />
          <SkillGroup
            label="Nice to have"
            skills={niceToHaveSkills}
            badgeClassName="bg-neutral-light text-text-secondary"
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-muted">No skills data available.</p>
      )}
    </section>
  );
}
