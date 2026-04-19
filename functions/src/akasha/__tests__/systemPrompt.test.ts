import { buildSystemPrompt } from '../systemPrompt';
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

describe('buildSystemPrompt', () => {
  it('includes Akasha identity', () => {
    const p = buildSystemPrompt({ digest: DIGEST, locale: 'en' });
    expect(p.toLowerCase()).toContain('akasha');
    expect(p.toLowerCase()).toContain('oracle');
  });

  it('embeds the digest as JSON', () => {
    const p = buildSystemPrompt({ digest: DIGEST, locale: 'en' });
    expect(p).toContain('"seventhLord":"Saturn"');
  });

  it('instructs response language', () => {
    const en = buildSystemPrompt({ digest: DIGEST, locale: 'en' });
    const hi = buildSystemPrompt({ digest: DIGEST, locale: 'hi' });
    expect(en).toContain('en');
    expect(hi).toContain('hi');
    expect(en).not.toEqual(hi);
  });

  it('enforces grounding and scope rules', () => {
    const p = buildSystemPrompt({ digest: DIGEST, locale: 'en' });
    expect(p).toMatch(/do not invent|must trace/i);
    expect(p).toMatch(/death timing|harm|medical/i);
  });

  it('sets word length range 150-400', () => {
    const p = buildSystemPrompt({ digest: DIGEST, locale: 'en' });
    expect(p).toContain('150');
    expect(p).toContain('400');
  });
});
