import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenerativeAI(apiKey);
}

export async function chatJson(
  system: string,
  user: string,
  options?: { temperature?: number },
): Promise<string> {
  const model = getGenAI().getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: options?.temperature ?? 0.3,
    },
  });

  const result = await model.generateContent({
    systemInstruction: system,
    contents: [{ role: "user", parts: [{ text: user }] }],
  });

  const text = result.response.text();

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}

export { MODEL as GEMINI_MODEL };
