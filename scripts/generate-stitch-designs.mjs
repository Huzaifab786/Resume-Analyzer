/**
 * Generates Resume Analyzer UI screens via Google Stitch SDK.
 * Reads STITCH_API_KEY from .cursor/mcp.json — never pass the key on the command line.
 *
 * Usage: node scripts/generate-stitch-designs.mjs
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Stitch, StitchToolClient, Screen } from "@google/stitch-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DESIGNS_DIR = path.join(ROOT, "context", "designs");
const MCP_CONFIG = path.join(ROOT, ".cursor", "mcp.json");

const POLL_INTERVAL_MS = 15_000;
const POLL_MAX_ATTEMPTS = 24; // 6 minutes

const DESIGN_SYSTEM =
  "Design system: Inter font. Page background #F6F7FB. Cards white with 1px #E7EAF3 border, 16px radius, subtle shadow. Primary accent indigo #6366F1. Success green #10B981. Warning amber #F59E0B. Text primary #101828, secondary #6A7282, muted #99A1AF. Clean SaaS aesthetic — professional, minimal, trustworthy. Desktop 1440px width. No sidebar. Top navbar only. Light mode only.";

const SCREENS = [
  {
    file: "landing-page.png",
    prompt: `${DESIGN_SYSTEM}

Design a marketing landing page for "Resume Analyzer" — a web app that compares your resume against any job description using AI and shows match score, missing skills, ATS keywords, and a tailored resume download.

Include: top navbar with logo (document + checkmark icon), Sign In button, hero with headline "Know your fit before you apply", subheadline about instant AI resume analysis and tailored PDF generation, primary CTA "Analyze My Resume", secondary CTA "See how it works". Below hero: 4-step "How it works" section (Upload resume → Paste job description → Get match report → Download tailored resume). Features grid with 4 cards: Match Score, Skills Gap Analysis, ATS Keywords, One-Click Resume Regeneration. Social proof strip with 3 short testimonials. Bottom CTA banner. Footer with links.

Style: modern B2C SaaS, lots of whitespace, indigo accent buttons, no illustrations of people — use simple line icons.`,
  },
  {
    file: "login.png",
    prompt: `${DESIGN_SYSTEM}

Design a centered auth page for Resume Analyzer. White card on #F6F7FB background. Logo and "Resume Analyzer" at top. Tagline: "Sign in to analyze your resume".

Tabs: Sign In | Sign Up
Sign In form: email input, password input, primary "Sign In" button, links below for "Forgot password?" and "Resend verification email"
Sign Up form: email, password, confirm password, primary "Create account" button, note "We'll send a verification email"

No Google or GitHub buttons. Email/password only. Card max-width 400px, centered.`,
  },
  {
    file: "dashboard.png",
    prompt: `${DESIGN_SYSTEM}

Design an authenticated dashboard for Resume Analyzer.

Navbar: logo, Dashboard (active/indigo), Analyze, History, user avatar right.

Content: page title "Dashboard" with primary button "New Analysis" top right. Row of 5 stat cards: Total Analyses (24), Avg Match Score (72%), Best Match (91%), Resumes Regenerated (8), This Week (5) — each with small trend badge. Below: two columns — left (wider) "Recent Analyses" list with 5 rows showing job title, company, colored match score badge, time ago; right "Match Score Trend" line chart last 30 days with indigo line.

Full width content max 1200px. Professional, data-focused but not cluttered.`,
  },
  {
    file: "analyze.png",
    prompt: `${DESIGN_SYSTEM}

Design the "New Analysis" page for Resume Analyzer.

Navbar same as dashboard. Page title "New Analysis". Banner below title: info style "3 of 5 analyses remaining today".

Two-column layout desktop:
Left card "Your Resume" — saved resume state: green check, "Using saved resume: Sarah_Chen_Resume.pdf", toggle "Keep saved" (selected) vs "Upload new".
Right card "Job Description" — optional inputs Job Title and Company Name in a row, large textarea placeholder "Paste the full job description here…", character count "0 / 8000" bottom right.

Full-width primary button below both cards: "Analyze Match" with sparkle icon.

Clean form-focused layout, indigo primary button.`,
  },
  {
    file: "analysis-result.png",
    prompt: `${DESIGN_SYSTEM}

Design the analysis result page for Resume Analyzer showing AI resume vs job match report.

Navbar standard. Back link "← History". Header row: job title "Senior Frontend Engineer", company "Acme Corp", date "Analyzed Mar 15, 2026". Large circular match score 78% in blue-green ring center-right.

Cards stacked, max-width 800px centered:
1. "Match Summary" — paragraph explaining fit
2. Two columns: "Skills Breakdown" with green pills (React, TypeScript, Next.js) under "Matched", orange pills (GraphQL, AWS) under "Missing"; and "ATS Keywords" with progress bar 68%, green and red keyword chips
3. "Experience Alignment" — summary plus Strengths and Gaps bullet lists
4. "Improvement Suggestions" — numbered list 1-5
5. "Tailored Resume" card — empty state with "Regenerate Resume" button

Bottom actions: "Analyze Another", "Delete Analysis".`,
  },
  {
    file: "history.png",
    prompt: `${DESIGN_SYSTEM}

Design the Analysis History page for Resume Analyzer.

Navbar standard. Page title "Analysis History". Toolbar: filter dropdown "All analyses", sort dropdown "Newest first".

Table: columns JOB TITLE, COMPANY, MATCH SCORE (mini progress bar + %), TAILORED (green "Yes" badge or gray "—"), DATE, ACTION (View link). 6-8 sample rows with varied scores. Pagination footer "Showing 1-20 of 47".

Same design system as dashboard. Table hover state light gray row background.`,
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadApiKey() {
  const raw = await readFile(MCP_CONFIG, "utf-8");
  const config = JSON.parse(raw);
  const key = config?.mcpServers?.stitch?.env?.STITCH_API_KEY;
  if (!key || typeof key !== "string") {
    throw new Error(
      "STITCH_API_KEY missing in .cursor/mcp.json under mcpServers.stitch.env",
    );
  }
  return key;
}

function extractScreenData(raw, projectId) {
  const components = raw?.outputComponents ?? raw?.output_components ?? [];
  for (const component of components) {
    const screens = component?.design?.screens ?? [];
    if (screens[0]) {
      return { ...screens[0], projectId };
    }
  }
  return null;
}

async function listScreenCount(toolClient, projectId) {
  const raw = await toolClient.callTool("list_screens", { projectId });
  return (raw?.screens ?? []).length;
}

async function getLatestScreen(toolClient, projectId) {
  const raw = await toolClient.callTool("list_screens", { projectId });
  const screens = raw?.screens ?? [];
  if (screens.length === 0) return null;
  return new Screen(toolClient, {
    ...screens[screens.length - 1],
    projectId,
  });
}

async function generateScreen(toolClient, projectId, prompt) {
  const beforeCount = await listScreenCount(toolClient, projectId);

  try {
    const raw = await toolClient.callTool("generate_screen_from_text", {
      projectId,
      prompt,
      deviceType: "DESKTOP",
      modelId: "GEMINI_3_FLASH",
    });

    const screenData = extractScreenData(raw, projectId);
    if (screenData) {
      return new Screen(toolClient, screenData);
    }
  } catch (error) {
    console.log(
      `  Generate call ended: ${error?.message ?? error} — polling for screen...`,
    );
  }

  for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);
    const count = await listScreenCount(toolClient, projectId);
    if (count > beforeCount) {
      const screen = await getLatestScreen(toolClient, projectId);
      if (screen) return screen;
    }
    console.log(`  Polling ${attempt}/${POLL_MAX_ATTEMPTS}...`);
  }

  throw new Error("Screen was not ready after polling");
}

async function downloadImage(imageRef, destPath) {
  if (imageRef.startsWith("data:")) {
    const base64 = imageRef.split(",")[1];
    await writeFile(destPath, Buffer.from(base64, "base64"));
    return;
  }

  const response = await fetch(imageRef);
  if (!response.ok) {
    throw new Error(`Failed to download image: HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destPath, buffer);
}

async function main() {
  process.env.STITCH_API_KEY = await loadApiKey();
  await mkdir(DESIGNS_DIR, { recursive: true });

  const toolClient = new StitchToolClient({
    apiKey: process.env.STITCH_API_KEY,
    timeout: 600_000,
  });
  const stitch = new Stitch(toolClient);

  console.log("Creating Stitch project...");
  const project = await stitch.createProject("Resume Analyzer");
  const projectId = project.id;
  console.log(`Project ID: ${projectId}`);

  for (const screen of SCREENS) {
    console.log(`\nGenerating: ${screen.file} ...`);
    try {
      const generated = await generateScreen(
        toolClient,
        projectId,
        screen.prompt,
      );
      console.log(`  Screen ID: ${generated.id} — fetching screenshot...`);

      const imageRef = await generated.getImage();
      if (!imageRef) {
        throw new Error("No screenshot URL returned");
      }

      const dest = path.join(DESIGNS_DIR, screen.file);
      await downloadImage(imageRef, dest);
      console.log(`  Saved: context/designs/${screen.file}`);
    } catch (error) {
      console.error(`  Failed: ${screen.file}`, error?.message || error);
    }
  }

  await toolClient.close();
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
