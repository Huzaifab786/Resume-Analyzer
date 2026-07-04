"use client";

import {
  RESUME_TEMPLATES,
  type ResumeTemplateId,
} from "@/agent/resume-templates";
import { cn } from "@/lib/utils";

type ResumeTemplatePickerProps = {
  value: ResumeTemplateId;
  onChange: (templateId: ResumeTemplateId) => void;
  disabled?: boolean;
};

function TemplatePreview({ id }: { id: ResumeTemplateId }) {
  if (id === "classic") {
    return (
      <div className="flex h-full flex-col items-center bg-surface px-2 py-2">
        <div className="h-2 w-12 rounded-sm bg-text-primary" />
        <div className="mt-1 h-1 w-16 rounded-sm bg-text-secondary" />
        <div className="mt-1 h-1 w-full rounded-sm bg-text-muted" />
        <div className="mt-2 w-full space-y-1.5">
          <div className="h-1 w-full border-b border-text-primary" />
          <div className="h-1 w-full rounded-sm bg-border" />
          <div className="mt-1 flex justify-between">
            <div className="h-1 w-10 rounded-sm bg-text-primary" />
            <div className="h-1 w-6 rounded-sm bg-text-muted" />
          </div>
          <div className="h-1 w-full rounded-sm bg-border" />
        </div>
      </div>
    );
  }

  if (id === "modern") {
    return (
      <div className="flex h-full flex-col items-center bg-surface px-2 py-2">
        <div className="h-2 w-14 rounded-sm bg-accent-dark" />
        <div className="mt-1 h-1 w-12 rounded-sm bg-accent" />
        <div className="mt-1 h-0.5 w-full bg-accent-dark" />
        <div className="mt-0.5 h-px w-full bg-accent" />
        <div className="mt-2 w-full space-y-1.5">
          <div className="h-1 w-10 rounded-sm bg-accent-dark" />
          <div className="h-px w-full bg-border" />
          <div className="flex justify-between">
            <div className="h-1 w-8 rounded-sm bg-accent-dark" />
            <div className="h-1 w-8 rounded-sm bg-accent-dark" />
          </div>
          <div className="h-1 w-full rounded-sm bg-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center bg-surface px-2 py-2">
      <div className="h-2 w-14 rounded-sm bg-text-primary" />
      <div className="mt-1 h-1 w-10 rounded-sm bg-text-secondary" />
      <div className="mt-1 h-px w-full bg-border" />
      <div className="mt-2 w-full space-y-1.5">
        <div className="h-2.5 w-full rounded-sm bg-border" />
        <div className="h-1 w-full rounded-sm bg-text-muted" />
        <div className="h-2.5 w-full rounded-sm bg-border" />
        <div className="grid grid-cols-3 gap-1">
          <div className="h-1 rounded-sm bg-text-muted" />
          <div className="h-1 rounded-sm bg-text-muted" />
          <div className="h-1 rounded-sm bg-text-muted" />
        </div>
      </div>
    </div>
  );
}

export function ResumeTemplatePicker({
  value,
  onChange,
  disabled = false,
}: ResumeTemplatePickerProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        Resume template
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {RESUME_TEMPLATES.map((template) => {
          const selected = value === template.id;

          return (
            <button
              key={template.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(template.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                selected
                  ? "border-accent bg-accent-light"
                  : "border-border bg-surface hover:border-accent/40",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <div className="h-24 overflow-hidden rounded-lg border border-border bg-surface-secondary">
                <TemplatePreview id={template.id} />
              </div>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                {template.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
