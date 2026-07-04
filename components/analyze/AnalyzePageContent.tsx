"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  AnalyzeLoadingOverlay,
  type LoadingStage,
} from "@/components/analyze/AnalyzeLoadingOverlay";
import { DailyLimitBanner } from "@/components/analyze/DailyLimitBanner";
import { JobDescriptionForm } from "@/components/analyze/JobDescriptionForm";
import { ResumeUpload, type ResumeMode } from "@/components/analyze/ResumeUpload";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { DAILY_ANALYSIS_LIMIT } from "@/lib/utils";

const MIN_JOB_DESCRIPTION_LENGTH = 100;

type UploadResponse = {
  success: boolean;
  data?: { filename: string; path: string };
  error?: string;
};

type AnalyzeResponse = {
  success: boolean;
  data?: { analysisId: string };
  error?: string;
};

type AnalyzePageContentProps = {
  initialSavedFilename: string | null;
  analysesRemaining: number;
};

export function AnalyzePageContent({
  initialSavedFilename,
  analysesRemaining,
}: AnalyzePageContentProps) {
  const router = useRouter();
  const [savedFilename, setSavedFilename] = useState(initialSavedFilename);
  const hasSavedResume = Boolean(savedFilename);
  const isLimitReached = analysesRemaining <= 0;

  const [resumeMode, setResumeMode] = useState<ResumeMode>(
    hasSavedResume ? "saved" : "upload",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("reading");
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    setSavedFilename(initialSavedFilename);
    setResumeMode(initialSavedFilename ? "saved" : "upload");
  }, [initialSavedFilename]);

  const uploadResume = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.success || !result.data) {
        setUploadError(result.error ?? "Failed to upload resume. Please try again.");
        setSelectedFile(null);
        return;
      }

      setSavedFilename(result.data.filename);
    } catch {
      setUploadError("Failed to upload resume. Please try again.");
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      setUploadError(null);
      setSelectedFile(file);

      if (file) {
        void uploadResume(file);
      }
    },
    [uploadResume],
  );

  const resumeReady =
    !isUploading &&
    Boolean(savedFilename) &&
    (resumeMode === "saved" ||
      (resumeMode === "upload" && selectedFile !== null));

  const jobDescriptionReady =
    jobDescription.trim().length >= MIN_JOB_DESCRIPTION_LENGTH;

  const canAnalyze =
    !isLimitReached && resumeReady && jobDescriptionReady && !isLoading;

  useEffect(() => {
    if (!isLoading || loadingStage === "finishing") return;

    const stageOrder: LoadingStage[] = [
      "reading",
      "extracting",
      "analyzing",
      "scoring",
      "suggestions",
    ];

    const currentIndex = stageOrder.indexOf(loadingStage);
    if (currentIndex < 0 || currentIndex >= stageOrder.length - 1) {
      return;
    }

    const stageTimer = window.setTimeout(() => {
      setLoadingStage(stageOrder[currentIndex + 1] ?? "suggestions");
    }, 2800);

    return () => {
      window.clearTimeout(stageTimer);
    };
  }, [isLoading, loadingStage]);

  useEffect(() => {
    if (!isLoading) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoading]);

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setAnalyzeError(null);
    setLoadingStage("reading");
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
          useSavedResume: resumeMode === "saved",
        }),
      });

      const result = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !result.success || !result.data?.analysisId) {
        setAnalyzeError(result.error ?? "Analysis failed. Please try again.");
        setIsLoading(false);
        setLoadingStage("reading");
        return;
      }

      setLoadingStage("finishing");
      router.push(`/analyze/${result.data.analysisId}`);
      router.refresh();
    } catch {
      setAnalyzeError("Analysis failed. Please try again.");
      setIsLoading(false);
      setLoadingStage("reading");
    }
  };

  return (
    <>
      <FadeIn className="space-y-6">
        <DailyLimitBanner
          remaining={analysesRemaining}
          limit={DAILY_ANALYSIS_LIMIT}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <ResumeUpload
            savedFilename={savedFilename}
            mode={resumeMode}
            onModeChange={setResumeMode}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            disabled={isLoading || isLimitReached}
            isUploading={isUploading}
            uploadError={uploadError}
          />
          <JobDescriptionForm
            jobTitle={jobTitle}
            company={company}
            jobDescription={jobDescription}
            onJobTitleChange={setJobTitle}
            onCompanyChange={setCompany}
            onJobDescriptionChange={setJobDescription}
            disabled={isLoading || isLimitReached || isUploading}
          />
        </div>

        <div className="flex flex-col items-stretch gap-3 lg:items-end">
          {isLimitReached ? (
            <p className="text-sm text-warning-foreground">
              You&apos;ve used all {DAILY_ANALYSIS_LIMIT} analyses for today. Come
              back tomorrow to run more.
            </p>
          ) : isUploading ? (
            <p className="text-sm text-text-muted">Uploading your resume…</p>
          ) : !resumeReady ? (
            <p className="text-sm text-text-muted">
              {hasSavedResume
                ? "Select a resume option or upload a new PDF to continue."
                : "Upload your resume PDF to continue."}
            </p>
          ) : !jobDescriptionReady ? (
            <p className="text-sm text-text-muted">
              Job description must be at least {MIN_JOB_DESCRIPTION_LENGTH}{" "}
              characters.
            </p>
          ) : null}

          {analyzeError ? (
            <p className="rounded-lg border border-error bg-error-light px-4 py-3 text-sm text-error">
              {analyzeError}
            </p>
          ) : null}

          <Button
            type="button"
            variant="brand"
            size="lg"
            disabled={!canAnalyze}
            onClick={() => void handleAnalyze()}
            className="h-11 w-full gap-2 px-6 lg:w-auto lg:min-w-[220px]"
          >
            <Sparkles className="size-4" />
            Analyze Match
          </Button>
        </div>
      </FadeIn>

      <AnalyzeLoadingOverlay open={isLoading} stage={loadingStage} />
    </>
  );
}
