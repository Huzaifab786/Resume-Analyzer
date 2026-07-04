"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HistoryFilter, HistorySort } from "@/lib/history";

const FILTER_OPTIONS: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "All analyses" },
  { value: "strong", label: "Strong match (≥70%)" },
  { value: "needs-work", label: "Needs work (<70%)" },
];

const SORT_OPTIONS: { value: HistorySort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest-score", label: "Highest score" },
];

type HistoryFiltersProps = {
  filter: HistoryFilter;
  sort: HistorySort;
};

export function HistoryFilters({ filter, sort }: HistoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }

    if ("filter" in updates || "sort" in updates) {
      params.delete("page");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const currentFilterLabel =
    FILTER_OPTIONS.find((option) => option.value === filter)?.label ??
    "All analyses";
  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Newest first";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-9 gap-2 border-border bg-surface text-text-primary"
            />
          }
        >
          {currentFilterLabel}
          <ChevronDown className="size-4 text-text-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          <DropdownMenuRadioGroup
            value={filter}
            onValueChange={(value) => updateParams({ filter: value })}
          >
            {FILTER_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-9 gap-2 border-border bg-surface text-text-primary"
            />
          }
        >
          {currentSortLabel}
          <ChevronDown className="size-4 text-text-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => updateParams({ sort: value })}
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
