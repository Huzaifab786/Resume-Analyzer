"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteAnalysis } from "@/actions/analyses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AnalysisResultActionsProps = {
  analysisId: string;
};

export function AnalysisResultActions({
  analysisId,
}: AnalysisResultActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteAnalysis(analysisId);

      if (!result.success) {
        setError(result.error ?? "Failed to delete analysis.");
        return;
      }

      setIsOpen(false);
      router.push("/history");
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <Button
          nativeButton={false}
          render={<Link href="/analyze" />}
          variant="brand"
          className="h-11 px-6"
        >
          Analyze Another
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="text-error hover:bg-error-light hover:text-error"
          onClick={() => setIsOpen(true)}
        >
          Delete Analysis
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>Delete this analysis?</DialogTitle>
            <DialogDescription>
              This permanently removes the analysis and any tailored resume
              linked to it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <p className="text-sm text-error">{error}</p>
          ) : null}

          <DialogFooter className="border-0 bg-transparent p-0">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
