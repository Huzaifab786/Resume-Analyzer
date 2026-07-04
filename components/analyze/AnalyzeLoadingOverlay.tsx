"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  FileSearch,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { duration, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type LoadingStage =
  | "reading"
  | "extracting"
  | "analyzing"
  | "scoring"
  | "suggestions"
  | "finishing";

const STAGES: {
  id: LoadingStage;
  label: string;
  description: string;
}[] = [
  {
    id: "reading",
    label: "Reading your resume",
    description: "Pulling text from your PDF…",
  },
  {
    id: "extracting",
    label: "Extracting experience",
    description: "Skills, roles, and education…",
  },
  {
    id: "analyzing",
    label: "Matching the job",
    description: "Comparing your profile to the posting…",
  },
  {
    id: "scoring",
    label: "Scoring the fit",
    description: "Match score and ATS keywords…",
  },
  {
    id: "suggestions",
    label: "Writing suggestions",
    description: "Actionable tips for this role…",
  },
  {
    id: "finishing",
    label: "Opening your report",
    description: "Almost there…",
  },
];

const TIPS = [
  "Stay on this page — your report opens automatically when analysis finishes.",
  "We only use experience from your resume. Nothing is invented.",
  "ATS systems look for keywords from the job description.",
  "A strong match score highlights skills you already have.",
  "You can regenerate a tailored resume from the results page.",
];

const STAGE_PROGRESS: Record<LoadingStage, number> = {
  reading: 12,
  extracting: 28,
  analyzing: 48,
  scoring: 68,
  suggestions: 86,
  finishing: 96,
};

type AnalyzeLoadingOverlayProps = {
  open: boolean;
  stage: LoadingStage;
};

export function AnalyzeLoadingOverlay({
  open,
  stage,
}: AnalyzeLoadingOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [tipIndex, setTipIndex] = useState(0);
  const activeIndex = Math.max(
    0,
    STAGES.findIndex((item) => item.id === stage),
  );
  const progress = STAGE_PROGRESS[stage];
  const activeStage = STAGES[activeIndex] ?? STAGES[0];

  useEffect(() => {
    if (!open) {
      setTipIndex(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const tipTimer = window.setInterval(() => {
      setTipIndex((current) => (current + 1) % TIPS.length);
    }, 4000);

    return () => {
      window.clearInterval(tipTimer);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.fast, ease: easeOut }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 px-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Analysis in progress"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: duration.normal, ease: easeOut }}
            className="glass-strong w-full max-w-md rounded-2xl border border-border p-6 shadow-card sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-light">
                {stage === "finishing" ? (
                  <Sparkles className="size-6 text-accent-dark" />
                ) : (
                  <FileSearch className="size-6 text-accent-dark" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-text-primary">
                  Analyzing your resume
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Please stay on this page while we work.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text-primary">
                  {activeStage.label}
                </p>
                <p className="text-xs tabular-nums text-text-muted">
                  {progress}%
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: duration.normal, ease: easeOut }
                  }
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {activeStage.description}
              </p>
            </div>

            <ol className="mt-6 space-y-2.5">
              {STAGES.map((item, index) => {
                const isDone = index < activeIndex;
                const isActive = index === activeIndex;

                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                      isActive && "bg-accent-light",
                      !isActive && !isDone && "opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full",
                        isDone && "bg-success-lightest text-success",
                        isActive && "bg-accent text-accent-foreground",
                        !isDone && !isActive && "bg-surface-secondary text-text-muted",
                      )}
                    >
                      {isDone ? (
                        <Check className="size-3.5" />
                      ) : isActive ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <span className="text-[11px] font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        isActive
                          ? "font-medium text-text-primary"
                          : "text-text-secondary",
                      )}
                    >
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex gap-3 rounded-xl border border-border bg-surface-secondary/60 px-4 py-3">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-dark" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: duration.fast, ease: easeOut }}
                  className="text-xs leading-relaxed text-text-secondary"
                >
                  {TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
