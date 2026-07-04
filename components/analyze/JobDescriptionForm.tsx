"use client";

import { Briefcase } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_LENGTH = 8000;

type JobDescriptionFormProps = {
  jobTitle: string;
  company: string;
  jobDescription: string;
  onJobTitleChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
};

export function JobDescriptionForm({
  jobTitle,
  company,
  jobDescription,
  onJobTitleChange,
  onCompanyChange,
  onJobDescriptionChange,
  disabled = false,
  maxLength = DEFAULT_MAX_LENGTH,
}: JobDescriptionFormProps) {
  const charCount = jobDescription.length;
  const isNearLimit = charCount > maxLength * 0.9;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Job Description</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Paste the job posting you want to match against.
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light">
          <Briefcase className="size-5 text-accent-dark" />
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="job-title"
            className="text-xs font-medium uppercase tracking-wide text-text-secondary"
          >
            Job Title
          </Label>
          <Input
            id="job-title"
            value={jobTitle}
            onChange={(event) => onJobTitleChange(event.target.value)}
            placeholder="e.g. Senior Product Designer"
            disabled={disabled}
            className="h-10 border-border bg-surface"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="company"
            className="text-xs font-medium uppercase tracking-wide text-text-secondary"
          >
            Company Name{" "}
            <span className="normal-case text-text-muted">(Optional)</span>
          </Label>
          <Input
            id="company"
            value={company}
            onChange={(event) => onCompanyChange(event.target.value)}
            placeholder="e.g. Acme Corp"
            disabled={disabled}
            className="h-10 border-border bg-surface"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="job-description"
            className="text-xs font-medium uppercase tracking-wide text-text-secondary"
          >
            Job Details
          </Label>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => {
              const value = event.target.value;
              if (value.length <= maxLength) {
                onJobDescriptionChange(value);
              }
            }}
            placeholder="Paste the full job description here..."
            disabled={disabled}
            className="min-h-60 resize-y border-border bg-surface"
          />
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs text-text-muted",
                isNearLimit && "text-warning-foreground",
              )}
            >
              {charCount.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
