import { PDFParse } from "pdf-parse";

const MIN_TEXT_LENGTH = 50;

/**
 * Extract plain text from a PDF buffer using pdf-parse v2 (`PDFParse`).
 * Always destroys the parser so workers/file handles are released.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse accepts Buffer/Uint8Array via LoadParameters.data
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    try {
      await parser.destroy();
    } catch (error) {
      console.error("[agent/extractor] Failed to destroy PDF parser", error);
    }
  }
}

export function isResumeTextValid(text: string): boolean {
  return text.length >= MIN_TEXT_LENGTH;
}
