import { redirect } from "next/navigation";

import { AnalyzePageContent } from "@/components/analyze/AnalyzePageContent";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { FadeIn } from "@/components/motion/FadeIn";
import { getAnalysesRemainingToday } from "@/lib/analyses";
import { createSupabaseServer } from "@/lib/supabase-server";

type AnalyzePageProps = {
  searchParams: Promise<{ mock?: string }>;
};

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_filename")
    .eq("id", user.id)
    .single();

  const params = await searchParams;
  const savedFilename =
    params.mock === "no-resume" ? null : (profile?.resume_filename ?? null);

  const analysesRemaining =
    params.mock === "limit-reached"
      ? 0
      : await getAnalysesRemainingToday(supabase, user.id);

  return (
    <>
      <AppNavbar userEmail={user.email} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-8">
        <FadeIn>
          <h1 className="text-2xl font-semibold text-text-primary">New Analysis</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Compare your resume against a job description and get an instant match
            score.
          </p>
        </FadeIn>

        <div className="mt-8">
          <AnalyzePageContent
            initialSavedFilename={savedFilename}
            analysesRemaining={analysesRemaining}
          />
        </div>
      </main>
      <AppFooter />
    </>
  );
}
