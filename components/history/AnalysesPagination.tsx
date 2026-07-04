import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HistoryFilter, HistorySort } from "@/lib/history";

type AnalysesPaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  filter: HistoryFilter;
  sort: HistorySort;
};

function buildHistoryHref(
  page: number,
  filter: HistoryFilter,
  sort: HistorySort,
): string {
  const params = new URLSearchParams();

  if (filter !== "all") {
    params.set("filter", filter);
  }

  if (sort !== "newest") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/history?${query}` : "/history";
}

export function AnalysesPagination({
  total,
  page,
  pageSize,
  filter,
  sort,
}: AnalysesPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((pageNumber) => {
      if (totalPages <= 5) return true;
      if (pageNumber === 1 || pageNumber === totalPages) return true;
      return Math.abs(pageNumber - page) <= 1;
    });

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-text-muted">
        Showing {start}-{end} of {total}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <Button
            nativeButton={false}
            render={
              <Link
                href={buildHistoryHref(Math.max(1, page - 1), filter, sort)}
                aria-disabled={page <= 1}
              />
            }
            variant="outline"
            size="sm"
            className={cn(page <= 1 && "pointer-events-none opacity-50")}
          >
            Previous
          </Button>

          {pageNumbers.map((pageNumber, index) => {
            const prevNumber = pageNumbers[index - 1];
            const showEllipsis = prevNumber !== undefined && pageNumber - prevNumber > 1;

            return (
              <span key={pageNumber} className="flex items-center gap-1">
                {showEllipsis ? (
                  <span className="px-2 text-sm text-text-muted">…</span>
                ) : null}
                <Button
                  nativeButton={false}
                  render={<Link href={buildHistoryHref(pageNumber, filter, sort)} />}
                  variant={pageNumber === page ? "brand" : "outline"}
                  size="sm"
                  className="min-w-9"
                >
                  {pageNumber}
                </Button>
              </span>
            );
          })}

          <Button
            nativeButton={false}
            render={
              <Link
                href={buildHistoryHref(Math.min(totalPages, page + 1), filter, sort)}
                aria-disabled={page >= totalPages}
              />
            }
            variant="outline"
            size="sm"
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
