/**
 * Export Stitch screen screenshots to context/designs/.
 * Uses list_screens (includes screenshot URLs) — no get_screen needed.
 *
 * Usage: node scripts/export-stitch-screenshots.mjs
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { StitchToolClient } from "@google/stitch-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DESIGNS_DIR = path.join(ROOT, "context", "designs");
const MCP_CONFIG = path.join(ROOT, ".cursor", "mcp.json");

const PROJECT_ID = "7967175862946795562";

// Match Stitch screen titles → output filename
const TITLE_MAP = [
  { match: /landing page/i, file: "landing-page.png" },
  { match: /sign in|sign up|auth/i, file: "login.png" },
  { match: /^dashboard/i, file: "dashboard.png" },
  { match: /new analysis/i, file: "analyze.png" },
  { match: /analysis report/i, file: "analysis-result.png" },
  { match: /analysis history/i, file: "history.png" },
];

async function loadApiKey() {
  const raw = await readFile(MCP_CONFIG, "utf-8");
  const key = JSON.parse(raw)?.mcpServers?.stitch?.env?.STITCH_API_KEY;
  if (!key) throw new Error("STITCH_API_KEY missing in .cursor/mcp.json");
  return key;
}

function screenIdFromName(name) {
  const parts = name?.split("/screens/");
  return parts?.length === 2 ? parts[1] : null;
}

async function downloadImage(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  await writeFile(destPath, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  process.env.STITCH_API_KEY = await loadApiKey();
  await mkdir(DESIGNS_DIR, { recursive: true });

  const toolClient = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
  const raw = await toolClient.callTool("list_screens", { projectId: PROJECT_ID });
  const screens = raw?.screens ?? [];

  console.log(`Found ${screens.length} screens in project ${PROJECT_ID}\n`);

  const exported = new Set();

  for (const screen of screens) {
    const title = screen.title ?? "";
    const mapping = TITLE_MAP.find(
      ({ file, match }) => match.test(title) && !exported.has(file),
    );
    if (!mapping) continue;

    const url = screen.screenshot?.downloadUrl;
    if (!url) {
      console.warn(`  Skipped ${title} — no screenshot URL`);
      continue;
    }

    const dest = path.join(DESIGNS_DIR, mapping.file);
    console.log(`Exporting "${title}" → ${mapping.file}`);
    await downloadImage(url, dest);
    exported.add(mapping.file);
    console.log(`  Saved (${screenIdFromName(screen.name)})`);
  }

  await toolClient.close();

  const missing = TITLE_MAP.filter(({ file }) => !exported.has(file));
  if (missing.length > 0) {
    console.warn("\nMissing exports:", missing.map((m) => m.file).join(", "));
    process.exit(1);
  }

  console.log("\nAll 6 screenshots exported to context/designs/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
