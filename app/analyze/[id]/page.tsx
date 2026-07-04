import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AnalysisResultActions } from "@/components/analysis-result/AnalysisResultActions";
import { AtsKeywordsCard } from "@/components/analysis-result/AtsKeywordsCard";
import { ExperienceAlignmentCard } from "@/components/analysis-result/ExperienceAlignmentCard";
import { ImprovementSuggestions } from "@/components/analysis-result/ImprovementSuggestions";
import { MatchScoreHeader } from "@/components/analysis-result/MatchScoreHeader";
import { MatchSummaryCard } from "@/components/analysis-result/MatchSummaryCard";
import { SkillsBreakdown } from "@/components/analysis-result/SkillsBreakdown";
import { TailoredResumeCard } from "@/components/analysis-result/TailoredResumeCard";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { parseStoredTailoredResume } from "@/agent/types";
import { createSupabaseServer } from "@/lib/supabase-server";
import type {
  AnalysisResult,
  TailoredResume,
  TailoredResumeStatus,
} from "@/types";

type AnalysisResultPageProps = {
  params: Promise<{ id: string }>;
};

function parseChangesApplied(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseInitialContent(value: unknown): TailoredResume | null {
  if (!value) {
    return null;
  }

  try {
    return parseStoredTailoredResume(value);
  } catch {
    return null;
  }
}

export default async function AnalysisResultPage({
  params,
}: AnalysisResultPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: analysis, error } = await supabase
    .from("analyses")
    .select(
      "id, job_title, company, match_score, status, error_message, result, tailored_resume_status, tailored_resume_content, resume_template_id, changes_applied, tailored_content_updated_at, created_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !analysis) {
    notFound();
  }

  const result = analysis.result as AnalysisResult | null;
  const changesApplied = parseChangesApplied(analysis.changes_applied);
  const initialContent = parseInitialContent(analysis.tailored_resume_content);

  return (
    <>
      <AppNavbar userEmail={user.email} />
      <main className="mx-auto w-full max-w-[800px] flex-1 px-8 py-8">
        <FadeIn>
          <Link
            href="/history"
            className="text-sm text-text-secondary transition-colors hover:text-accent-dark"
          >
            ← History
          </Link>
        </FadeIn>

        {analysis.status === "completed" && result && analysis.match_score !== null ? (
          <div className="mt-6 space-y-6">
            <FadeIn>
              <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <MatchScoreHeader
                  jobTitle={analysis.job_title}
                  company={analysis.company}
                  analyzedAt={analysis.created_at}
                  matchScore={analysis.match_score}
                />
              </section>
            </FadeIn>

            <FadeIn>
              <MatchSummaryCard summary={result.matchSummary} />
            </FadeIn>

            <FadeIn>
              <div className="grid gap-6 md:grid-cols-2">
                <SkillsBreakdown
                  matchedSkills={result.matchedSkills}
                  missingSkills={result.missingSkills}
                  niceToHaveSkills={result.niceToHaveSkills}
                />
                <AtsKeywordsCard atsKeywords={result.atsKeywords} />
              </div>
            </FadeIn>

            <FadeIn>
              <ExperienceAlignmentCard alignment={result.experienceAlignment} />
            </FadeIn>

            <FadeIn>
              <ImprovementSuggestions suggestions={result.improvementSuggestions} />
            </FadeIn>

            <FadeIn>
              <TailoredResumeCard
                analysisId={analysis.id}
                tailoredResumeStatus={
                  analysis.tailored_resume_status as TailoredResumeStatus | null
                }
                initialChangesApplied={changesApplied}
                initialTemplateId={analysis.resume_template_id}
                initialContent={initialContent}
                initialContentUpdatedAt={analysis.tailored_content_updated_at}
              />
            </FadeIn>

            <FadeIn>
              <AnalysisResultActions analysisId={analysis.id} />
            </FadeIn>
          </div>
        ) : analysis.status === "failed" ? (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-8 shadow-card">
            <h1 className="text-2xl font-semibold text-text-primary">
              Analysis Failed
            </h1>
            <p className="mt-3 text-sm text-error">
              {analysis.error_message ?? "This analysis failed. Please try again."}
            </p>
            <div className="mt-8">
              <Button
                nativeButton={false}
                render={<Link href="/analyze" />}
                variant="brand"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-8 shadow-card">
            <h1 className="text-2xl font-semibold text-text-primary">
              Analysis In Progress
            </h1>
            <p className="mt-3 text-sm text-text-muted">
              This analysis is still processing. Refresh the page in a moment.
            </p>
          </div>
        )}
      </main>
      <AppFooter />
    </>
  );
}
