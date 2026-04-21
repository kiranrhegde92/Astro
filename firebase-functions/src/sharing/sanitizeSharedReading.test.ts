import { sanitizeSharedReading } from './sanitizeSharedReading';

describe('sanitizeSharedReading', () => {
  it('keeps allowed fields only', () => {
    const input = {
      question: 'q',
      answer: 'a',
      locale: 'en',
      createdAt: 1,
      uid: 'secret',
      email: 'x@y',
    };
    const out = sanitizeSharedReading(input as any);
    expect(out).toEqual({ question: 'q', answer: 'a', locale: 'en', createdAt: 1 });
  });

  it('truncates answer to 2000 chars', () => {
    const out = sanitizeSharedReading({
      question: 'q',
      answer: 'x'.repeat(3000),
      locale: 'en',
      createdAt: 1,
    } as any);
    expect(out).not.toBeNull();
    expect(out!.answer.length).toBe(2000);
  });

  it('truncates question to 400 chars', () => {
    const out = sanitizeSharedReading({
      question: 'q'.repeat(600),
      answer: 'a',
      locale: 'en',
      createdAt: 1,
    } as any);
    expect(out).not.toBeNull();
    expect(out!.question.length).toBe(400);
  });

  it('returns null when missing required fields', () => {
    expect(sanitizeSharedReading({ answer: 'a' } as any)).toBeNull();
    expect(sanitizeSharedReading({ question: 'q', answer: 'a', locale: 'en' } as any)).toBeNull();
    expect(sanitizeSharedReading({} as any)).toBeNull();
  });

  it('returns null when createdAt is not a number', () => {
    expect(
      sanitizeSharedReading({ question: 'q', answer: 'a', locale: 'en', createdAt: '123' } as any),
    ).toBeNull();
  });

  it('returns null on empty strings', () => {
    expect(
      sanitizeSharedReading({ question: '', answer: 'a', locale: 'en', createdAt: 1 } as any),
    ).toBeNull();
  });
});
