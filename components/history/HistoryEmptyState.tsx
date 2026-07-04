import { FileSearch } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HistoryEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface px-8 py-16 text-center shadow-card">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent-light">
        <FileSearch className="size-6 text-accent-dark" />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-text-primary">
        No analyses yet
      </h2>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        Upload your resume and paste a job description to get started. Your match
        history will appear here.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/analyze" />}
        variant="brand"
        className="mt-6"
      >
        Start First Analysis
      </Button>
    </div>
  );
}
