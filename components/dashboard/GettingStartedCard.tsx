import Link from "next/link";
import { FileText, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Upload,
    title: "Upload your resume",
    description: "Save a PDF once and reuse it for every job you analyze.",
  },
  {
    icon: FileText,
    title: "Paste a job description",
    description: "Drop in the posting you care about — title and company optional.",
  },
  {
    icon: Sparkles,
    title: "Get your match report",
    description: "See score, gaps, ATS keywords, and a tailored resume you can edit.",
  },
] as const;

export function GettingStartedCard() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-8 shadow-card">
      <h2 className="text-xl font-semibold text-text-primary">
        Get started with Resume Analyzer
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-text-secondary">
        Upload your resume and paste a job description to get started. Your first
        analysis takes under two minutes.
      </p>

      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <li
              key={step.title}
              className="rounded-xl border border-border bg-surface-secondary/50 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent-dark">
                  {index + 1}
                </span>
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent-light">
                  <Icon className="size-4 text-accent-dark" />
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-text-primary">
                {step.title}
              </p>
              <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        <Button
          nativeButton={false}
          render={<Link href="/analyze" />}
          variant="brand"
          className="h-11 px-6"
        >
          Start First Analysis
        </Button>
      </div>
    </section>
  );
}
