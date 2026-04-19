import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash-latest';
const MAX_OUTPUT_TOKENS = 1500;

export interface AskGeminiInput {
  systemPrompt: string;
  userMessage: string;
  apiKey: string;
}

export interface AskGeminiResult {
  answer: string;
  inputTokens: number;
  outputTokens: number;
}

export async function askGemini(input: AskGeminiInput): Promise<AskGeminiResult> {
  const genAI = new GoogleGenerativeAI(input.apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: input.systemPrompt,
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.8,
    },
  });

  const delays = [0, 1200, 3000];
  let lastErr: unknown;
  for (const delay of delays) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    try {
      const result = await model.generateContent(input.userMessage);
      const response = result.response;
      const text = response.text().trim();
      const usage = response.usageMetadata;
      return {
        answer: text,
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
      };
    } catch (err) {
      lastErr = err;
      const msg = (err as Error)?.message ?? '';
      if (!msg.includes('429') && !msg.toLowerCase().includes('rate')) throw err;
    }
  }
  throw lastErr;
}
