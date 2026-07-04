import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { BoostScoreCta } from "@/components/dashboard/BoostScoreCta";
import { GettingStartedCard } from "@/components/dashboard/GettingStartedCard";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { getDashboardData, getDisplayName } from "@/lib/dashboard";
import { createSupabaseServer } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let data;
  let loadError = false;

  try {
    data = await getDashboardData(supabase, user.id);
  } catch {
    loadError = true;
    data = {
      stats: [],
      recentAnalyses: [],
      scoreTrend: [],
      totalCompleted: 0,
    };
  }

  const hasAnalyses = data.totalCompleted > 0;
  const displayName = getDisplayName(user.email);

  return (
    <>
      <AppNavbar userEmail={user.email} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-8">
        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-text-primary">
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Welcome back, {displayName}. Analyze and optimize your
                applications.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/analyze" />}
              variant="brand"
              className="h-11 shrink-0 gap-2 px-5"
            >
              <Plus className="size-4" />
              New Analysis
            </Button>
          </div>
        </FadeIn>

        {loadError ? (
          <FadeIn className="mt-8">
            <div className="rounded-2xl border border-error bg-error-light px-6 py-5 text-sm text-error">
              Could not load dashboard stats. Refresh the page or try again in a
              moment.
            </div>
          </FadeIn>
        ) : !hasAnalyses ? (
          <FadeIn className="mt-8">
            <GettingStartedCard />
          </FadeIn>
        ) : (
          <div className="mt-8 space-y-6">
            <FadeIn>
              <StatsBar stats={data.stats} />
            </FadeIn>

            <div className="grid gap-6 lg:grid-cols-5">
              <FadeIn className="lg:col-span-3">
                <RecentAnalyses analyses={data.recentAnalyses} />
              </FadeIn>

              <div className="space-y-6 lg:col-span-2">
                <FadeIn>
                  <ScoreTrendChart data={data.scoreTrend} />
                </FadeIn>
                <FadeIn>
                  <BoostScoreCta />
                </FadeIn>
              </div>
            </div>
          </div>
        )}
      </main>
      <AppFooter />
    </>
  );
}
