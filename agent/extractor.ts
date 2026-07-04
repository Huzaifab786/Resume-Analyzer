import { PDFParse } from "pdf-parse";

const MIN_TEXT_LENGTH = 50;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

export function isResumeTextValid(text: string): boolean {
  return text.length >= MIN_TEXT_LENGTH;
}
