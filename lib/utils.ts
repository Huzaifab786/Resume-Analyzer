import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const MATCH_THRESHOLD = 70
export const DAILY_ANALYSIS_LIMIT = 5

type MatchScoreColors = {
  text: string
  ring: string
  bg: string
}

export function getMatchScoreColors(score: number): MatchScoreColors {
  if (score >= 80) {
    return {
      text: "text-success",
      ring: "text-success",
      bg: "bg-success-lightest",
    }
  }

  if (score >= 60) {
    return {
      text: "text-info",
      ring: "text-info",
      bg: "bg-info-lightest",
    }
  }

  if (score >= 40) {
    return {
      text: "text-warning-foreground",
      ring: "text-warning",
      bg: "bg-warning-light",
    }
  }

  return {
    text: "text-text-muted",
    ring: "text-text-muted",
    bg: "bg-neutral-light",
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
