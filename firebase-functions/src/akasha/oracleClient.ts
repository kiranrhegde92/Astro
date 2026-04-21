import { askClaude } from './claudeClient';
import { askGemini } from './geminiClient';

export type OracleProvider = 'gemini' | 'claude';

export interface AskOracleInput {
  systemPrompt: string;
  userMessage: string;
  provider: OracleProvider;
  anthropicKey?: string;
  geminiKey?: string;
}

export interface AskOracleResult {
  answer: string;
  inputTokens: number;
  outputTokens: number;
  provider: OracleProvider;
}

export function resolveProvider(): OracleProvider {
  const p = (process.env.MODEL_PROVIDER ?? 'gemini').toLowerCase();
  if (p === 'claude' || p === 'anthropic') return 'claude';
  return 'gemini';
}

export async function askOracle(input: AskOracleInput): Promise<AskOracleResult> {
  if (input.provider === 'claude') {
    if (!input.anthropicKey) throw new Error('ANTHROPIC_API_KEY missing');
    const res = await askClaude({
      systemPrompt: input.systemPrompt,
      userMessage: input.userMessage,
      apiKey: input.anthropicKey,
    });
    return { ...res, provider: 'claude' };
  }
  if (!input.geminiKey) throw new Error('GEMINI_API_KEY missing');
  const res = await askGemini({
    systemPrompt: input.systemPrompt,
    userMessage: input.userMessage,
    apiKey: input.geminiKey,
  });
  return { ...res, provider: 'gemini' };
}
