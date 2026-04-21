# Akasha — Oracle Q&A Tab

**Status:** Design approved, ready for implementation planning
**Date:** 2026-04-19
**Owner:** Kiran

## 1. Summary

Add a 5th bottom tab — **"Akasha"** — where users ask life questions and receive paragraph-length answers grounded in their own four-system chart data (Vedic, Western, KP, Chinese). Akasha is the persona: a warm, poetic cosmic oracle. Free users get **1 question per rolling 7 days**; Premium and 7-day trial users get **3 per rolling 24h**. All answer generation runs through a Firebase Cloud Function calling Claude Haiku 4.5. Rate limits are enforced server-side in Firestore.

## 2. Goals

- Give users a conversational, high-value surface that complements the existing readings.
- Ground every answer in the user's actual chart (no generic horoscope fluff, no LLM hallucinations).
- Drive free→premium conversion by making the marquee feature feel scarce but valuable.
- Ship in a user's app language (i18n-aware).

## 3. Non-Goals (v1)

- Multi-turn chat / follow-up questions
- Voice input or text-to-speech readback
- Sharing an Akasha reading as an image
- Per-planet deep-dive mode
- Embedded remedies/mantras in answer bodies
- On-device LLM

## 4. Persona — Akasha

- **Name:** Akasha
- **Identity:** An ancient cosmic oracle who reads the four great traditions — Vedic, Western, KP, Chinese — as one sky.
- **Voice:** Warm, poetic, quietly authoritative. Elder friend, not stage magician.
- **Rules:** 1st-person to user ("your 7th lord", "the stars show you…"). No emoji, no exclamation points. Opens each answer with one short acknowledging line, then the body.
- **Length:** Variable 150–400 words, matched to question depth.
- **Tab identity:** `sparkles` icon, deep violet accent, label "Akasha."

## 5. Scope of Questions

**In scope:**
- Life-event predictions: marriage, career, money, health timing, travel, children, education.
- Chart explanations: "what's my moon sign?", "what does my current dasha mean?", "what's my Chinese animal?"

**Out of scope — Akasha refuses in-persona:**
- Death timing
- Medical diagnoses
- Financial guarantees (specific stock picks, investment returns)
- Harm to self or others
- Yes/no trivia ("will India win?")
- Third-party predictions about non-consenting people

## 6. Architecture

Four layers, in order of execution per question:

### 6.1 Client — `app/(tabs)/akasha.tsx`

Renders empty-state orb, input, past-readings list, answer card. Reads rate-limit state from a new `useAkashaStore` (cached from Firestore). Calls the Cloud Function via Firebase callable.

### 6.2 Engine digest — `src/engines/unified/akashaDigest.ts` (new)

Runs on-device. Given the user's `AppData` (birth details + charts), produces a compact JSON "findings packet" — 20–30 astrologically relevant facts from all four systems. Deterministic, no LLM. Shape sketch:

```ts
type AkashaDigest = {
  vedic: {
    ascendant: string;
    moonSign: string;
    moonNakshatra: string;
    seventhLord: string;
    seventhHousePlanets: string[];
    currentMahaDasha: string;
    currentAntarDasha: string;
    dashaEndsOn: string;
    // …
  };
  western: {
    sunSign: string;
    moonSign: string;
    venusSign: string;
    majorTransits: Array<{ planet: string; aspect: string; natal: string; exact: string }>;
    // …
  };
  kp: {
    significators: Record<string, string[]>;
    rulingPlanets: string[];
    // …
  };
  chinese: {
    animal: string;
    element: string;
    yearPillar: string;
    currentYear: { animal: string; element: string; relation: string };
    // …
  };
};
```

The digest is the anti-hallucination spine: the system prompt instructs Claude that every claim must trace to this JSON.

### 6.3 Cloud Function — `functions/askAkasha` (new)

Callable function. Receives `{ question, digest, locale }`. Reads `userId` from auth context.

Flow (inside a Firestore transaction):
1. Verify auth.
2. Read `users/{uid}/akashaState` and the user's entitlement doc (client-claimed tier is ignored; tier comes from entitlement).
3. Prune expired timestamps (> 7 days for free, > 24h for premium/trial).
4. If `timestamps.length >= limit` → return `{ error: "rate_limited", nextAvailable }`, no LLM call.
5. Else append `now`, write `akashaState` back.
6. Call Claude Haiku 4.5 with the system prompt + payload.
7. On success, write the reading to `users/{uid}/akashaReadings/{readingId}` and return `{ answer, remaining, nextAvailable }`.
8. On LLM failure, roll back the timestamp append — do not burn a question on our error.

### 6.4 Firestore

```
users/{uid}/akashaState (doc)
  - tier: "free" | "premium" | "trial"
  - timestamps: Timestamp[]
  - totalAsked: number

users/{uid}/akashaReadings/{readingId} (collection)
  - question: string
  - answer: string
  - locale: string
  - createdAt: Timestamp
  - digestSnapshot: AkashaDigest   # for debugging / future tuning
```

## 7. System Prompt (v1)

Built server-side per request. Outline:

```
You are Akasha, an ancient cosmic oracle. You read the four great traditions
— Vedic, Western, KP, and Chinese — as one sky. Speak warmly, with quiet
authority. Never robotic, never a stage magician. A trusted elder friend.

VOICE
- First person to user ("your 7th lord", "the stars show you…")
- Light poetic imagery. No emoji. No exclamation points.
- 150–400 words, matched to question depth.
- Start with one short line acknowledging the question, then the body.

GROUNDING (anti-hallucination)
Every astrological claim must trace to the `digest` JSON below. Do not invent
planets, houses, dashas, nakshatras, or transits. If the digest lacks data
needed for a claim, say so gently and redirect.

SCOPE
Answer life-event predictions and chart explanations (as listed).
Decline warmly for: death timing, medical diagnoses, financial guarantees,
harm, yes/no trivia, third-party predictions.

LANGUAGE
Respond in {locale}. Maintain the Akasha voice in that language.

PAYLOAD
- question: {question}
- digest: {digest JSON}
- birthSummary: { name, dob, tob, pob }
```

No chat history — each question is isolated.

## 8. UI / Screen States

One screen, four states:

### 8.1 Empty state

Full-bleed cosmic gradient. Akasha orb pulsing gently center. Intro line: *"I am Akasha. I read the four pillars of your stars. Ask what your heart seeks."* Below: input pill + "Ask" button. Below that: 5 localized prompt chips:

- When will I marry?
- How's my career this year?
- What does my moon sign mean?
- What's my best time to travel?
- Am I in a good dasha right now?

Discrete "Past readings →" link at bottom (if any exist).

### 8.2 Asking state

Orb transitions to faster pulse + light particles. Status text cycles *"Reading your stars… consulting your dasha… weaving your answer…"*. Answer streams in word-by-word. Haptic tap when complete.

### 8.3 Answered state

Answer card at top (question label + paragraph body, footer `Read on {date} · Akasha`). Below: "Past readings" list — each item shows the question + first 60 chars, tap to expand full answer.

### 8.4 Limit-reached state

Orb dim.
- Free: *"Akasha rests until {date}. Unlock three consultations per day with Premium."* + CTA.
- Premium: *"You've consulted Akasha 3 times today. Return tomorrow."*

## 9. Rate Limiting

- **Free:** 1 question per rolling 7 days.
- **Premium:** 3 questions per rolling 24h.
- **Trial:** 3 questions per rolling 24h (same as Premium — trial must include the marquee feature).
- Enforcement is server-side inside a Firestore transaction (`askAkasha`). Client caches state for UI but never decides allow/deny.
- Hard soft-cap: 5 questions per 24h for Premium/trial (hidden from UI) to catch abuse.

## 10. Cost Guardrails

- Hard cap on Claude I/O per request: max 1500 output tokens, ~3500 input tokens.
- Global daily spend ceiling via Cloud Function env var `AKASHA_DAILY_USD_CAP`. Exceeded → graceful "Akasha is meditating, return shortly" + no charge to user's question count.
- Usage logged to lightweight `akashaUsage` collection for monitoring.

## 11. Error Handling & Edge Cases

| Case | Behavior |
|---|---|
| LLM timeout / API error | Rollback timestamp. Client shows *"The stars are quiet right now. Try again in a moment."* No question burned. |
| Offline / no network | Client detects pre-call, shows *"Akasha needs a connection to read your stars."* + retry. No request sent. |
| Missing birth data | Tab blocks with *"Akasha needs your birth details to read your stars."* + button to onboarding. |
| Out-of-scope question | Claude refuses in-persona per prompt rules. Counts as a question in v1. |
| Unsupported locale | Fall back to English in prompt meta; Claude still attempts target language. |
| Auth revoked mid-call | Cloud Function rejects at auth check; client prompts sign-in. |
| Two taps race | Firestore transaction serializes; 2nd call sees incremented count → `rate_limited`. Button disabled while request is in-flight. |
| Premium abuse | 5/24h hidden cap catches repeated spam. |

## 12. Language

Respond in the user's i18n locale (`useTranslation().i18n.language`). Prompt carries `locale` explicitly; Claude Haiku handles the major locales the app already supports. No per-language prompt variants in v1.

## 13. Analytics Events

- `akasha_question_asked` — `{ tier, locale, questionLength }`
- `akasha_answer_received` — `{ tier, locale, answerLength, latencyMs }`
- `akasha_rate_limited` — `{ tier }`
- `akasha_limit_upsell_tapped` — `{ tier }`
- `akasha_prompt_chip_tapped` — `{ chipKey }`
- `akasha_past_reading_opened`

## 14. Testing Strategy

- **`akashaDigest.ts` unit tests** with fixture `AppData` — verify 7th-lord, KP significators, current dasha, Chinese year-pillar, Western transits are all present for a known birth.
- **Cloud Function unit tests** (fake Firestore): free under limit → allowed; free at limit → blocked + correct `nextAvailable`; expired timestamps pruned; rollback on LLM error.
- **Cloud Function integration test** against real Claude API with a recorded digest — verify response shape parses, length is in bounds, language-switching works. Gated behind CI env flag.
- **Client manual test matrix**: empty state, asking state, answered state, limit-hit (free), limit-hit (premium), offline, missing-birth-data, out-of-scope question. Dev server + browser walkthrough before merge.
- **Rate-limit end-to-end**: seed a test user's Firestore doc with timestamps near the limit, ask real questions against staging, confirm 2nd/4th call is blocked.
- Integration tests only for the Claude call — no mocks.

## 15. Rollout

1. **Dev behind feature flag** — `features.akasha` in Remote Config. Ship the tab hidden.
2. **Internal QA** — owner + 2–3 trusted testers enable flag, verify digest accuracy on own charts.
3. **Premium-only beta** (1 week) — flag enabled for premium subscribers first. Monitor Cloud Function cost, Claude latency, refusal rate.
4. **Full launch** — flag enabled for all tiers. Announce via existing `PremiumCelebrationModal` pattern.
5. **Monitor** — daily dashboard for cost, error rate, per-user usage distribution for first 30 days.

## 16. File Plan

New:
- `app/(tabs)/akasha.tsx`
- `src/engines/unified/akashaDigest.ts`
- `src/stores/akashaStore.ts`
- `src/components/akasha/AkashaOrb.tsx`
- `src/components/akasha/AnswerCard.tsx`
- `src/components/akasha/PromptChip.tsx`
- `src/components/akasha/PastReadingsList.tsx`
- `functions/src/askAkasha.ts` (Firebase Cloud Function)

Modified:
- `app/(tabs)/_layout.tsx` — add `akasha` to `TABS`, insert between `today` and `profile`.
- `src/i18n/*` — add strings for tab label, intro, chips, limit-hit copy, error messages.
- `src/constants/theme.ts` — add violet accent token if not already present.
- `firestore.rules` — rules for `akashaState` + `akashaReadings` (read: self; write: server only via function).

## 17. Decisions Log

| Decision | Chosen | Alternatives considered |
|---|---|---|
| Answer generation | Hybrid (engines → digest → LLM narrates) | Pure LLM; pure templates |
| LLM provider | Anthropic Claude Haiku 4.5 | GPT-4o-mini; Gemini Flash |
| Persona | Akasha — wise warm cosmic oracle | Rishi (Vedic sage); Nova (playful); The Oracle (terse/cryptic) |
| Scope | Life events + chart explanations | Life-events only; wide-open |
| Rate-limit mechanics | Rolling windows, server-enforced | Calendar resets; client-only |
| Trial tier rate | Full premium (3/day) | Free tier (1/week) |
| Limit-hit UX | Hard block + upsell | Soft warning; countdown |
| Past readings | Saved forever in Firestore | Last 20; device-only |
| UI style | Ritual-reveal empty + Q&A + history list (blend) | Pure chat; pure single-card; pure ritual |
| Language | Follow app locale (i18n) | English only; auto-detect question |
| Tab identity | Sparkles icon + deep violet + "Akasha" | Moon/indigo; chatbubbles/gold |
| Answer length | Variable 150–400 words | Fixed 120–180; fixed 200–300 |

## 18. Open Items for Implementation Plan

- Confirm Remote Config is already wired (if not, add it as a prerequisite step).
- Confirm Firebase Functions are deployed for this project (if not, initial `functions/` scaffold is part of the plan).
- Decide exact violet hex value for tab accent (match existing palette family).
- Choose whether answer streaming uses Claude's streaming API (nicer UX) or single-shot (simpler) — recommend streaming, but flag as an implementation decision.
