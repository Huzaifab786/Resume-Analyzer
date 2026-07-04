"use client";

import {
  CheckCircle2,
  CloudCheck,
  FileText,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type ResumeMode = "saved" | "upload";

type ResumeUploadProps = {
  savedFilename: string | null;
  mode: ResumeMode;
  onModeChange: (mode: ResumeMode) => void;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  isUploading?: boolean;
  uploadError?: string | null;
};

const ACCEPTED_TYPE = "application/pdf";
const MAX_SIZE_MB = 5;

export function ResumeUpload({
  savedFilename,
  mode,
  onModeChange,
  selectedFile,
  onFileSelect,
  disabled = false,
  isUploading = false,
  uploadError: externalUploadError = null,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);

  const uploadError = externalUploadError ?? localUploadError;
  const isDisabled = disabled || isUploading;

  const hasSavedResume = Boolean(savedFilename);
  const activeFilename =
    mode === "saved" && savedFilename
      ? savedFilename
      : selectedFile?.name ?? null;

  const validateFile = (file: File): string | null => {
    if (file.type !== ACCEPTED_TYPE) {
      return "Only PDF files are accepted.";
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_SIZE_MB} MB.`;
    }

    return null;
  };

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        onFileSelect(null);
        setLocalUploadError(null);
        return;
      }

      const error = validateFile(file);
      if (error) {
        setLocalUploadError(error);
        onFileSelect(null);
        return;
      }

      setLocalUploadError(null);
      onFileSelect(file);
      onModeChange("upload");
    },
    [onFileSelect, onModeChange],
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;

    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFile(file);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Your Resume</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {hasSavedResume
              ? "Use your saved resume or upload a new PDF."
              : "Upload your resume to get started."}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light">
          <FileText className="size-5 text-accent-dark" />
        </div>
      </div>

      {activeFilename ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success bg-success-lightest px-3 py-2">
          <CheckCircle2 className="size-4 shrink-0 text-success" />
          <p className="text-xs font-medium uppercase tracking-wide text-success-foreground">
            Active file: {activeFilename}
          </p>
        </div>
      ) : null}

      {hasSavedResume ? (
        <div className="mb-4 space-y-3">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => onModeChange("saved")}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
              mode === "saved"
                ? "border-accent bg-accent-muted"
                : "border-border bg-surface hover:border-accent/40",
              isDisabled && "pointer-events-none opacity-50",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                mode === "saved" ? "border-accent bg-accent" : "border-border",
              )}
            >
              {mode === "saved" ? (
                <span className="size-1.5 rounded-full bg-accent-foreground" />
              ) : null}
            </span>
            <div className="flex flex-1 items-start gap-3">
              <CloudCheck className="size-5 shrink-0 text-accent-dark" />
              <div>
                <p className="text-sm font-medium text-text-primary">Keep saved</p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  Use your current verified resume
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isDisabled}
            onClick={() => onModeChange("upload")}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
              mode === "upload"
                ? "border-accent bg-accent-muted"
                : "border-border bg-surface hover:border-accent/40",
              isDisabled && "pointer-events-none opacity-50",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                mode === "upload" ? "border-accent bg-accent" : "border-border",
              )}
            >
              {mode === "upload" ? (
                <span className="size-1.5 rounded-full bg-accent-foreground" />
              ) : null}
            </span>
            <div className="flex flex-1 items-start gap-3">
              <FileUp className="size-5 shrink-0 text-text-secondary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Upload new</p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  Overwrite with a different PDF
                </p>
              </div>
            </div>
          </button>
        </div>
      ) : null}

      {(!hasSavedResume || mode === "upload") && (
        <div
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isDisabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isDisabled && inputRef.current?.click()}
          className={cn(
            "flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
            isDragging
              ? "border-accent bg-accent-muted"
              : "border-border bg-surface-secondary hover:border-accent hover:bg-accent-muted",
            isDisabled && "pointer-events-none opacity-50",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPE}
            className="hidden"
            disabled={isDisabled}
            onChange={handleInputChange}
          />
          <div className="flex size-12 items-center justify-center rounded-full bg-accent-light">
            {isUploading ? (
              <Loader2 className="size-5 animate-spin text-accent-dark" />
            ) : (
              <Upload className="size-5 text-accent-dark" />
            )}
          </div>
          <p className="mt-4 text-sm font-medium text-text-primary">
            {isUploading
              ? "Uploading resume…"
              : selectedFile
                ? selectedFile.name
                : "Drag and drop your resume"}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            or click to browse — PDF only, max {MAX_SIZE_MB} MB
          </p>
        </div>
      )}

      {uploadError ? (
        <p className="mt-3 text-sm text-error">{uploadError}</p>
      ) : null}
    </div>
  );
}
