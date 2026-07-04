import { chatJson } from "@/lib/ai";
import {
  type AnalysisResult,
  parseAnalysisResult,
} from "@/agent/types";

const MAX_RESUME_CHARS = 12_000;
const MAX_JOB_DESCRIPTION_CHARS = 8_000;

type AnalyzeSuccess = {
  success: true;
  data: AnalysisResult;
};

type AnalyzeFailure = {
  success: false;
  error: string;
};

export type AnalyzeResumeResult = AnalyzeSuccess | AnalyzeFailure;

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n\n[Truncated for length]`;
}

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
  company?: string,
): Promise<AnalyzeResumeResult> {
  try {
    const systemPrompt = `You are an expert resume analyst and ATS specialist.
Compare the candidate's resume against the job description.
Return ONLY valid JSON matching the required schema.
Be specific — reference actual skills, titles, and requirements from the inputs.
Never invent experience the resume does not contain.
Score honestly: 90+ only for near-perfect alignment.`;

    const userPrompt = `JOB TITLE: ${jobTitle ?? "Not provided"}
COMPANY: ${company ?? "Not provided"}

JOB DESCRIPTION:
${truncateText(jobDescription, MAX_JOB_DESCRIPTION_CHARS)}

RESUME TEXT:
${truncateText(resumeText, MAX_RESUME_CHARS)}

Return JSON with keys:
matchScore, matchSummary, matchedSkills, missingSkills, niceToHaveSkills,
atsKeywords { found, missing, matchPercentage },
experienceAlignment { summary, strengths, gaps },
improvementSuggestions`;

    const raw = await chatJson(systemPrompt, userPrompt);
    const data = parseAnalysisResult(raw);

    return { success: true, data };
  } catch (error) {
    console.error("[agent/analyzer]", error);
    return {
      success: false,
      error: "Analysis failed. Please try again in a moment.",
    };
  }
}
