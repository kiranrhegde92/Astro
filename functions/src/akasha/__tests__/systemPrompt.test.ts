import { STATIC_SYSTEM_PROMPT, buildUserMessage } from '../systemPrompt';
import type { AkashaDigest } from '../types';

const DIGEST: AkashaDigest = {
  vedic: {
    ascendant: 'Simha', moonSign: 'Karka', moonNakshatra: 'Pushya',
    seventhLord: 'Saturn', seventhHousePlanets: ['Venus'], tenthLord: 'Venus',
    tenthHousePlanets: [], currentMahaDasha: 'Jupiter', currentAntarDasha: 'Saturn',
    dashaEndsOn: '2027-03-10',
  },
  western: {
    sunSign: 'Capricorn', moonSign: 'Cancer', risingSign: 'Leo',
    venusSign: 'Sagittarius', marsSign: 'Libra', majorTransits: [],
  },
  kp: { significators: { '7': ['Venus', 'Saturn'] }, rulingPlanets: ['Moon', 'Jupiter'] },
  chinese: {
    animal: 'Horse', element: 'Metal', yearPillar: 'Metal Horse',
    currentYear: { animal: 'Horse', element: 'Fire', relation: 'friend' },
  },
};

describe('STATIC_SYSTEM_PROMPT', () => {
  it('includes Akasha identity', () => {
    expect(STATIC_SYSTEM_PROMPT.toLowerCase()).toContain('akasha');
    expect(STATIC_SYSTEM_PROMPT.toLowerCase()).toContain('oracle');
  });

  it('enforces grounding and scope rules', () => {
    expect(STATIC_SYSTEM_PROMPT).toMatch(/do not invent|must trace/i);
    expect(STATIC_SYSTEM_PROMPT).toMatch(/death timing|harm|medical/i);
  });

  it('sets word length range 150-400', () => {
    expect(STATIC_SYSTEM_PROMPT).toContain('150');
    expect(STATIC_SYSTEM_PROMPT).toContain('400');
  });

  it('does not embed per-user digest or question (so it stays cacheable)', () => {
    expect(STATIC_SYSTEM_PROMPT).not.toContain('Saturn');
    expect(STATIC_SYSTEM_PROMPT).not.toContain('DIGEST');
  });
});

describe('buildUserMessage', () => {
  it('embeds digest JSON', () => {
    const msg = buildUserMessage({ digest: DIGEST, question: 'when?', locale: 'en' });
    expect(msg).toContain('"seventhLord":"Saturn"');
  });

  it('embeds locale instruction', () => {
    const en = buildUserMessage({ digest: DIGEST, question: 'q', locale: 'en' });
    const hi = buildUserMessage({ digest: DIGEST, question: 'q', locale: 'hi' });
    expect(en).toContain('en');
    expect(hi).toContain('hi');
    expect(en).not.toEqual(hi);
  });

  it('embeds the question', () => {
    const msg = buildUserMessage({ digest: DIGEST, question: 'when will I marry?', locale: 'en' });
    expect(msg).toContain('when will I marry?');
  });
});
