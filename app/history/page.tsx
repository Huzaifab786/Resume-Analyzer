import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AnalysesPagination } from "@/components/history/AnalysesPagination";
import { AnalysesTable } from "@/components/history/AnalysesTable";
import { HistoryEmptyState } from "@/components/history/HistoryEmptyState";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  parseHistoryFilter,
  parseHistoryPage,
  parseHistorySort,
  queryHistoryAnalyses,
} from "@/lib/history";
import { createSupabaseServer } from "@/lib/supabase-server";

type HistoryPageProps = {
  searchParams: Promise<{
    filter?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const filter = parseHistoryFilter(params.filter);
  const sort = parseHistorySort(params.sort);
  const page = parseHistoryPage(params.page);

  const { count: completedCount } = await supabase
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const hasAnyAnalyses = (completedCount ?? 0) > 0;

  const { rows, total, pageSize } = await queryHistoryAnalyses(
    supabase,
    user.id,
    filter,
    sort,
    page,
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total > 0 && page > totalPages) {
    const redirectParams = new URLSearchParams();
    if (filter !== "all") redirectParams.set("filter", filter);
    if (sort !== "newest") redirectParams.set("sort", sort);
    if (totalPages > 1) redirectParams.set("page", String(totalPages));
    const query = redirectParams.toString();
    redirect(query ? `/history?${query}` : "/history");
  }

  return (
    <>
      <AppNavbar userEmail={user.email} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-8">
        <FadeIn>
          <h1 className="text-2xl font-semibold text-text-primary">Analysis History</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Review and manage your past resume-to-job matches.
          </p>
        </FadeIn>

        <div className="mt-8 space-y-6">
          {!hasAnyAnalyses ? (
            <FadeIn>
              <HistoryEmptyState />
            </FadeIn>
          ) : (
            <>
              <Suspense fallback={null}>
                <HistoryFilters filter={filter} sort={sort} />
              </Suspense>

              {rows.length > 0 ? (
                <FadeIn>
                  <AnalysesTable rows={rows} />
                </FadeIn>
              ) : (
                <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-card">
                  <p className="text-sm text-text-secondary">
                    No analyses match this filter. Try a different filter or sort.
                  </p>
                </div>
              )}

              <AnalysesPagination
                total={total}
                page={page}
                pageSize={pageSize}
                filter={filter}
                sort={sort}
              />
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </>
  );
}
