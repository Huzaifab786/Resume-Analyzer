"use client";

import { Download, FileText, Loader2, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  parseResumeTemplateId,
  type ResumeTemplateId,
} from "@/agent/resume-templates";
import type { TailoredResume } from "@/agent/types";
import { ResumeTemplatePicker } from "@/components/analysis-result/ResumeTemplatePicker";
import {
  sanitizeTailoredResumeDraft,
  TailoredResumeEditor,
  validateTailoredResumeDraft,
} from "@/components/analysis-result/TailoredResumeEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TailoredResumeStatus } from "@/types";

type LoadingStage =
  | "idle"
  | "applying"
  | "building"
  | "rendering"
  | "saving";

type RegenerateResponse = {
  success: boolean;
  data?: {
    downloadUrl: string;
    changesApplied: string[];
    templateId: ResumeTemplateId;
    content: TailoredResume;
  };
  error?: string;
};

type RenderResponse = {
  success: boolean;
  data?: {
    downloadUrl: string;
    templateId: ResumeTemplateId;
    changesApplied: string[];
    content: TailoredResume;
  };
  error?: string;
};

type ContentResponse = {
  success: boolean;
  data?: {
    content: TailoredResume;
    updatedAt: string;
  };
  error?: string;
};

type DownloadResponse = {
  success: boolean;
  data?: {
    downloadUrl: string;
    filename: string;
  };
  error?: string;
};

type TailoredResumeCardProps = {
  analysisId: string;
  tailoredResumeStatus: TailoredResumeStatus | null;
  initialChangesApplied: string[] | null;
  initialTemplateId?: string | null;
  initialContent?: TailoredResume | null;
  initialContentUpdatedAt?: string | null;
};

export function TailoredResumeCard({
  analysisId,
  tailoredResumeStatus,
  initialChangesApplied,
  initialTemplateId,
  initialContent = null,
  initialContentUpdatedAt = null,
}: TailoredResumeCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TailoredResumeStatus | null>(
    tailoredResumeStatus,
  );
  const [changesApplied, setChangesApplied] = useState<string[]>(
    initialChangesApplied ?? [],
  );
  const [templateId, setTemplateId] = useState<ResumeTemplateId>(
    parseResumeTemplateId(initialTemplateId),
  );
  const [content, setContent] = useState<TailoredResume | null>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(
    initialContent ? JSON.stringify(initialContent) : null,
  );
  const [contentUpdatedAt, setContentUpdatedAt] = useState<string | null>(
    initialContentUpdatedAt,
  );
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [downloadingFormat, setDownloadingFormat] = useState<
    "pdf" | "docx" | null
  >(null);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);

  const isLoading = loadingStage !== "idle";
  const hasContent = content != null;
  const isGenerated = status === "completed" || hasContent;

  const isDirty = useMemo(() => {
    if (!content || !savedSnapshot) {
      return false;
    }

    return JSON.stringify(content) !== savedSnapshot;
  }, [content, savedSnapshot]);

  useEffect(() => {
    setStatus(tailoredResumeStatus);
    setChangesApplied(initialChangesApplied ?? []);
    setTemplateId(parseResumeTemplateId(initialTemplateId));
    setContent(initialContent);
    setSavedSnapshot(initialContent ? JSON.stringify(initialContent) : null);
    setContentUpdatedAt(initialContentUpdatedAt);
  }, [
    tailoredResumeStatus,
    initialChangesApplied,
    initialTemplateId,
    initialContent,
    initialContentUpdatedAt,
  ]);

  useEffect(() => {
    if (loadingStage !== "applying") return;

    const buildingTimer = window.setTimeout(() => {
      setLoadingStage("building");
    }, 2000);

    return () => {
      window.clearTimeout(buildingTimer);
    };
  }, [loadingStage]);

  const applyContent = (next: TailoredResume) => {
    setContent(next);
    setSavedSnapshot(JSON.stringify(next));
    setChangesApplied(next.changesApplied);
    setFieldErrors([]);
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    setError(null);
    setDownloadingFormat(format);

    try {
      const response = await fetch(
        `/api/resume/download?analysisId=${encodeURIComponent(analysisId)}&format=${format}`,
      );

      const contentType = response.headers.get("Content-Type") ?? "";

      if (!response.ok || contentType.includes("application/json")) {
        const result = (await response.json()) as DownloadResponse;
        setError(
          result.error ??
            (format === "pdf"
              ? "Failed to download PDF."
              : "Failed to download Word file."),
        );
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = /filename="([^"]+)"/i.exec(disposition);
      const filename =
        filenameMatch?.[1] ??
        `Tailored_Resume.${format === "pdf" ? "pdf" : "docx"}`;

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError(
        format === "pdf"
          ? "Failed to download PDF."
          : "Failed to download Word file.",
      );
    } finally {
      setDownloadingFormat(null);
    }
  };

  const runRegenerate = async () => {
    setConfirmRegenerateOpen(false);
    setError(null);
    setFieldErrors([]);
    setLoadingStage("applying");

    try {
      const response = await fetch("/api/resume/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, templateId }),
      });

      const result = (await response.json()) as RegenerateResponse;

      if (!response.ok || !result.success || !result.data) {
        setError(result.error ?? "Failed to regenerate resume.");
        setStatus("failed");
        return;
      }

      setStatus("completed");
      setTemplateId(result.data.templateId);
      applyContent(result.data.content);
      setContentUpdatedAt(new Date().toISOString());
      router.refresh();
    } catch {
      setError("Failed to regenerate resume.");
      setStatus("failed");
    } finally {
      setLoadingStage("idle");
    }
  };

  const handleRegenerateClick = () => {
    if (hasContent && isDirty) {
      setConfirmRegenerateOpen(true);
      return;
    }

    if (hasContent) {
      setConfirmRegenerateOpen(true);
      return;
    }

    void runRegenerate();
  };

  const handleSave = async () => {
    if (!content) {
      return;
    }

    const draft = sanitizeTailoredResumeDraft(content);
    const errors = validateTailoredResumeDraft(draft);
    setFieldErrors(errors);

    if (errors.length > 0) {
      setError("Fix the highlighted issues before saving.");
      return;
    }

    setError(null);
    setLoadingStage("saving");

    try {
      const response = await fetch("/api/resume/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, content: draft }),
      });

      const result = (await response.json()) as ContentResponse;

      if (!response.ok || !result.success || !result.data) {
        setError(result.error ?? "Failed to save edits.");
        return;
      }

      applyContent(result.data.content);
      setContentUpdatedAt(result.data.updatedAt);
      router.refresh();
    } catch {
      setError("Failed to save edits.");
    } finally {
      setLoadingStage("idle");
    }
  };

  const handleUpdatePdf = async (nextTemplateId: ResumeTemplateId = templateId) => {
    if (!content) {
      return;
    }

    const draft = sanitizeTailoredResumeDraft(content);
    const errors = validateTailoredResumeDraft(draft);
    setFieldErrors(errors);

    if (errors.length > 0) {
      setError("Fix the highlighted issues before updating the PDF.");
      return;
    }

    setError(null);
    setLoadingStage("rendering");

    try {
      const response = await fetch("/api/resume/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          templateId: nextTemplateId,
          content: draft,
        }),
      });

      const result = (await response.json()) as RenderResponse;

      if (!response.ok || !result.success || !result.data) {
        setError(result.error ?? "Failed to update PDF.");
        return;
      }

      setStatus("completed");
      setTemplateId(result.data.templateId);
      applyContent(result.data.content);
      setContentUpdatedAt(new Date().toISOString());
      router.refresh();
    } catch {
      setError("Failed to update PDF.");
    } finally {
      setLoadingStage("idle");
    }
  };

  const handleTemplateChange = async (nextTemplateId: ResumeTemplateId) => {
    if (nextTemplateId === templateId || isLoading) {
      return;
    }

    setTemplateId(nextTemplateId);
    setError(null);

    if (!hasContent) {
      return;
    }

    await handleUpdatePdf(nextTemplateId);
  };

  const loadingMessage =
    loadingStage === "applying"
      ? "Applying suggestions…"
      : loadingStage === "saving"
        ? "Saving edits…"
        : loadingStage === "rendering"
          ? "Updating PDF & Word files…"
          : "Building PDF & Word files…";

  if (!isGenerated) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light">
            <Sparkles className="size-5 text-accent-dark" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-text-primary">
              Tailored Resume
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Pick a professional template, then we rewrite your resume for this
              role using AI — without inventing experience you don&apos;t have.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ResumeTemplatePicker
            value={templateId}
            onChange={setTemplateId}
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-3">
            <Loader2 className="size-4 animate-spin text-accent" />
            <p className="text-sm text-text-secondary">{loadingMessage}</p>
          </div>
        ) : (
          <Button
            type="button"
            variant="brand"
            className="mt-6 w-full gap-2 sm:w-auto"
            onClick={() => void runRegenerate()}
          >
            <Sparkles className="size-4" />
            Regenerate Resume
          </Button>
        )}

        {status === "failed" || error ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-error bg-error-light px-4 py-3 text-sm text-error">
              {error ?? "Resume regeneration failed. Please try again."}
            </p>
            {!isLoading ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void runRegenerate()}
              >
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light">
          <Sparkles className="size-5 text-accent-dark" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-text-primary">
            Tailored Resume
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Edit the AI draft, pick a template, then update files and download
            as PDF or editable Word.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {isDirty ? (
              <span className="rounded-full bg-warning-light px-2.5 py-1 text-text-primary">
                Unsaved edits
              </span>
            ) : (
              <span className="rounded-full bg-success-lightest px-2.5 py-1 text-success">
                Edits saved
              </span>
            )}
            {status === "completed" ? (
              <span className="rounded-full bg-accent-light px-2.5 py-1 text-accent-dark">
                PDF & Word ready
              </span>
            ) : null}
            {contentUpdatedAt ? (
              <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-text-muted">
                Last saved{" "}
                {new Date(contentUpdatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ResumeTemplatePicker
          value={templateId}
          onChange={(id) => void handleTemplateChange(id)}
          disabled={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-3">
          <Loader2 className="size-4 animate-spin text-accent" />
          <p className="text-sm text-text-secondary">{loadingMessage}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={isLoading || !isDirty}
          onClick={() => void handleSave()}
        >
          {loadingStage === "saving" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save edits
        </Button>
        <Button
          type="button"
          variant="brand"
          className="gap-2"
          disabled={isLoading}
          onClick={() => void handleUpdatePdf()}
        >
          {loadingStage === "rendering" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Update files
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={
            isLoading || downloadingFormat !== null || status !== "completed"
          }
          onClick={() => void handleDownload("pdf")}
        >
          {downloadingFormat === "pdf" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={
            isLoading || downloadingFormat !== null || status !== "completed"
          }
          onClick={() => void handleDownload("docx")}
        >
          {downloadingFormat === "docx" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileText className="size-4" />
          )}
          Download Word
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={handleRegenerateClick}
        >
          Regenerate with AI
        </Button>
      </div>

      {content ? (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
            Edit resume content
          </p>
          <TailoredResumeEditor
            value={content}
            onChange={setContent}
            disabled={isLoading}
            fieldErrors={fieldErrors}
          />
        </div>
      ) : null}

      {changesApplied.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            AI changes applied
          </p>
          <ul className="mt-2 space-y-2">
            {changesApplied.map((change, index) => (
              <li
                key={`${index}-${change}`}
                className="flex gap-2 text-sm text-text-secondary"
              >
                <span className="text-success">•</span>
                {change}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg border border-error bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <Dialog open={confirmRegenerateOpen} onOpenChange={setConfirmRegenerateOpen}>
        <DialogContent showCloseButton={!isLoading}>
          <DialogHeader>
            <DialogTitle>Regenerate with AI?</DialogTitle>
            <DialogDescription>
              This replaces your current tailored content with a new AI draft.
              Manual edits will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setConfirmRegenerateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="brand"
              disabled={isLoading}
              onClick={() => void runRegenerate()}
            >
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
