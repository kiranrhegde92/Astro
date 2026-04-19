import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-2.0-flash';
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

  const result = await model.generateContent(input.userMessage);
  const response = result.response;
  const text = response.text().trim();
  const usage = response.usageMetadata;

  return {
    answer: text,
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
  };
}
