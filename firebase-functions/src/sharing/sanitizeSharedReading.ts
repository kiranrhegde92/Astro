export type RawReading = {
  question?: unknown;
  answer?: unknown;
  locale?: unknown;
  createdAt?: unknown;
};

export type PublicReading = {
  question: string;
  answer: string;
  locale: string;
  createdAt: number;
};

const MAX_ANSWER = 2000;

function str(v: unknown, max?: number): string | null {
  if (typeof v !== 'string' || v.length === 0) return null;
  return max ? v.slice(0, max) : v;
}

export function sanitizeSharedReading(raw: RawReading): PublicReading | null {
  const question = str(raw.question, 400);
  const answer = str(raw.answer, MAX_ANSWER);
  const locale = str(raw.locale, 10);
  const createdAtNum = typeof raw.createdAt === 'number' ? raw.createdAt : null;
  if (!question || !answer || !locale || createdAtNum === null) return null;
  return { question, answer, locale, createdAt: createdAtNum };
}
