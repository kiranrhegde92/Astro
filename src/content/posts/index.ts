export type PostBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: ReadonlyArray<string> }
  | { type: 'quote'; text: string; attribution?: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  author: string;
  readMinutes: number;
  tag: string;
  body: ReadonlyArray<PostBlock>;
};

export const POSTS: ReadonlyArray<Post> = [
  {
    slug: 'why-four-systems',
    title: 'Why four systems, and not just one?',
    description:
      'Western, Vedic, Chinese, and KP astrology came from different civilizations with different premises. When they agree the signal is real — and when they disagree, that is also worth knowing.',
    date: '2026-04-12',
    author: 'CosmicSelf',
    readMinutes: 6,
    tag: 'APPROACH',
    body: [
      {
        type: 'p',
        text: 'Most astrology apps pick one tradition and stop there. CosmicSelf runs four in parallel, and we get asked often whether that is excessive or genuinely useful. The honest answer is that each system illuminates something the others obscure.',
      },
      { type: 'h2', text: 'Four traditions, four questions' },
      {
        type: 'p',
        text: 'Each of the classical systems we draw on answers a slightly different question about the same day:',
      },
      {
        type: 'ul',
        items: [
          'Western astrology asks: what is the mood of the sky right now?',
          'Vedic astrology asks: what chapter of your life are you in?',
          'Chinese astrology asks: what is the element and pace of this season?',
          'KP astrology asks: which specific life area will this timing touch?',
        ],
      },
      {
        type: 'p',
        text: 'These are not competing claims. They are complementary vantage points. A Mercury transit in Western terms, viewed through a KP sub-lord, will land on a specific house. Viewed through your Vedic dasha, it arrives in a particular chapter. Together, the reading goes from ambient to actionable.',
      },
      { type: 'h2', text: 'When the systems agree' },
      {
        type: 'p',
        text: 'The most useful days are the ones where all four systems point at the same texture. A tense Western transit that also lands in a sensitive Vedic dasha period and a volatile Chinese element day is a real signal — not an artifact of one chart-reading method. Those days get foregrounded in your Today Brief.',
      },
      { type: 'h2', text: 'When they disagree' },
      {
        type: 'p',
        text: 'Disagreement is information, not noise. A Western placement might suggest expansiveness while a KP sub-lord flags a specific friction. We tell you where the systems diverge, because that tension often maps to real life — an external opportunity landing on a private strain.',
      },
      {
        type: 'quote',
        text: 'Four readings that agree are a small miracle. Four readings that disagree tell you exactly where the complexity lives.',
      },
      {
        type: 'p',
        text: 'The goal is never to hand you four separate horoscopes. It is to render one honest reading that is the distillation of all four, with the seams visible when they matter.',
      },
    ],
  },
  {
    slug: 'daily-ritual-design',
    title: 'Designing a quiet daily ritual',
    description:
      'Notifications off by default. No banner ads. No streaks. We wanted an astrology app you would open because you wanted to — not because it buzzed at you.',
    date: '2026-03-18',
    author: 'CosmicSelf',
    readMinutes: 5,
    tag: 'CRAFT',
    body: [
      {
        type: 'p',
        text: 'When we started designing the daily reading, the market research was depressing. Most astrology apps treat attention as the commodity. Push notifications every morning, streak counters, anxious urgency copy. We wanted the opposite.',
      },
      { type: 'h2', text: 'Three rules we imposed on ourselves' },
      {
        type: 'ul',
        items: [
          'No push notifications by default. You have to opt in, explicitly, in settings.',
          'No streak mechanics. Missing a day is fine. Life is not a workout app.',
          'No urgency copy. No "Mercury retrograde destroys your relationship — read now."',
        ],
      },
      { type: 'h2', text: 'What we built instead' },
      {
        type: 'p',
        text: 'The daily reading is a piece of writing, targeted at a three-minute read. It names the texture of the day — what the sky is pressing on, what chapter you are in, what element is dominant — and then says plainly what that might mean for you. No theatrics, no cliffhangers.',
      },
      {
        type: 'p',
        text: 'If you miss a week, nothing bad happens. The archive is there when you return. The signal is in the writing, not in the frequency.',
      },
      { type: 'h2', text: 'What users told us' },
      {
        type: 'p',
        text: 'The feedback loop was clarifying. People do not want to be pestered by their astrology app. They want it to be there when they want it, and quiet when they do not. That is the whole design philosophy in a sentence.',
      },
    ],
  },
  {
    slug: 'astrology-without-theatre',
    title: 'Astrology without the theatre',
    description:
      'You do not need mystical jargon to take astrology seriously. We write in plain English — because the ideas are interesting enough without the fog.',
    date: '2026-02-24',
    author: 'CosmicSelf',
    readMinutes: 4,
    tag: 'VOICE',
    body: [
      {
        type: 'p',
        text: 'There is a style of writing in astrology that sounds like it was translated from another language — "the cosmic vibrations of your natal Venus in divine communion with transiting Saturn," and so on. We find it exhausting. It also hides real ideas behind a fog of adjectives.',
      },
      { type: 'h2', text: 'Plain English is not dumbed-down' },
      {
        type: 'p',
        text: 'A Saturn transit to your Venus is, astrologically, a real thing — a period where the way you relate to people gets pressure-tested and restructured. That is interesting! We can say it like that. We do not need to say it is a divine reckoning of karmic love-bonds.',
      },
      { type: 'h2', text: 'Honest writing names friction' },
      {
        type: 'p',
        text: 'Plain writing also makes it harder to fake. If your reading says "this is a week of expansive growth and luminous abundance" every week, you notice. If it says "the transit this week presses on your work life — expect slower responses and some reassessment," you can check it against reality. The reading becomes falsifiable, which is where any honest practice starts.',
      },
      { type: 'h2', text: 'What voice we use' },
      {
        type: 'ul',
        items: [
          'Short sentences when the point is clear',
          'Longer sentences when complexity deserves air',
          'No adjectives we cannot defend',
          'No mystical hedging',
        ],
      },
      {
        type: 'p',
        text: 'We would rather a reading be too plain than too ornate. The ideas can carry themselves.',
      },
    ],
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function listPostSlugs(): ReadonlyArray<string> {
  return POSTS.map((p) => p.slug);
}
