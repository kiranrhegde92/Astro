import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_INPUT_TOKENS = 3500;
const MAX_OUTPUT_TOKENS = 1500;

export interface AskClaudeInput {
  systemPrompt: string;
  userMessage: string;
  apiKey: string;
}

export interface AskClaudeResult {
  answer: string;
  inputTokens: number;
  outputTokens: number;
}

export async function askClaude(input: AskClaudeInput): Promise<AskClaudeResult> {
  const client = new Anthropic({ apiKey: input.apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [{ type: 'text', text: input.systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: input.userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return {
    answer: text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

export const CLAUDE_LIMITS = { MAX_INPUT_TOKENS, MAX_OUTPUT_TOKENS };
