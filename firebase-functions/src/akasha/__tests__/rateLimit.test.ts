import { evaluateRateLimit } from '../rateLimit';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

describe('evaluateRateLimit', () => {
  const NOW = new Date('2026-04-19T10:00:00Z').getTime();

  it('free tier: allows first question', () => {
    const r = evaluateRateLimit({ tier: 'free', timestamps: [], now: NOW });
    expect(r.allowed).toBe(true);
    expect(r.prunedTimestamps).toEqual([]);
  });

  it('free tier: blocks a second question within 7 days', () => {
    const ts = [NOW - 2 * DAY];
    const r = evaluateRateLimit({ tier: 'free', timestamps: ts, now: NOW });
    expect(r.allowed).toBe(false);
    expect(r.nextAvailableAt).toBe(NOW - 2 * DAY + 7 * DAY);
  });

  it('free tier: allows after 7 days pass (prunes old)', () => {
    const ts = [NOW - 8 * DAY];
    const r = evaluateRateLimit({ tier: 'free', timestamps: ts, now: NOW });
    expect(r.allowed).toBe(true);
    expect(r.prunedTimestamps).toEqual([]);
  });

  it('premium: allows 3 in 24h, blocks 4th', () => {
    const ts = [NOW - 5 * HOUR, NOW - 2 * HOUR, NOW - 1 * HOUR];
    const r = evaluateRateLimit({ tier: 'premium', timestamps: ts, now: NOW });
    expect(r.allowed).toBe(false);
    expect(r.nextAvailableAt).toBe(NOW - 5 * HOUR + DAY);
  });

  it('premium: prunes timestamps older than 24h', () => {
    const ts = [NOW - 30 * HOUR, NOW - 10 * HOUR];
    const r = evaluateRateLimit({ tier: 'premium', timestamps: ts, now: NOW });
    expect(r.allowed).toBe(true);
    expect(r.prunedTimestamps).toEqual([NOW - 10 * HOUR]);
  });

  it('premium: enforces hidden 5/24h abuse cap even if allowed by rolling limit', () => {
    const ts = [NOW - 20 * HOUR, NOW - 15 * HOUR, NOW - 10 * HOUR, NOW - 5 * HOUR, NOW - 1 * HOUR];
    const r = evaluateRateLimit({ tier: 'premium', timestamps: ts, now: NOW });
    expect(r.allowed).toBe(false);
  });

  it('trial tier: same as premium (3/24h)', () => {
    const ts = [NOW - 5 * HOUR, NOW - 2 * HOUR];
    const r = evaluateRateLimit({ tier: 'trial', timestamps: ts, now: NOW });
    expect(r.allowed).toBe(true);
  });
});
