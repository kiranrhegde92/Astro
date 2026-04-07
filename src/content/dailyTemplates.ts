import type { WesternSign, Rashi, ChineseAnimal, DailyReading, PredictionReference } from '../types/astrology';
import { getDateKey } from '../utils/dateUtils';
import { getDailyOpener, getDailyAffirmation, getGrowthFraming } from './positiveFraming';

/**
 * Daily reading template generator.
 * Produces daily readings for all 4 systems with 80-85% positive framing.
 */

// Western daily reading templates per sign
const WESTERN_TEMPLATES: Record<WesternSign, { love: string[]; career: string[]; wellness: string[] }> = {
  Aries: {
    love: ['Your passionate energy attracts admiration today. Let your confidence shine in connections.', 'Bold romantic energy flows your way. Don\'t be afraid to make the first move.', 'Your natural charisma is magnetic today - hearts are drawn to your fire.'],
    career: ['Your leadership energy is at peak levels. Projects you initiate today carry cosmic momentum.', 'The stars favor bold career moves. Your pioneering spirit opens unexpected doors.', 'Your determination is cosmically supercharged. Tackle that big goal with confidence.'],
    wellness: ['Channel your abundant energy into movement - your body craves action today.', 'Your vitality is strong. A morning workout sets the perfect cosmic rhythm for your day.', 'Your fire element is blazing - stay hydrated and let your energy flow freely.'],
  },
  Taurus: {
    love: ['Steady, beautiful energy surrounds your heart today. Existing bonds deepen naturally.', 'Your sensual side is highlighted - create beauty in your relationships.', 'Comfort and connection blend beautifully. Share a meal or quiet moment with someone you love.'],
    career: ['Your practical wisdom is your superpower today. Financial decisions are cosmically supported.', 'Patience pays off beautifully - that project you\'ve been nurturing is about to bloom.', 'Your reliability shines. Others trust your judgment, opening doors to new opportunities.'],
    wellness: ['Treat yourself to sensory pleasures - good food, nature walks, gentle self-care.', 'Your earth energy craves grounding. A walk in nature recharges your cosmic batteries.', 'Focus on comfort and stability - your body responds beautifully to routine today.'],
  },
  Gemini: {
    love: ['Your words carry extra charm today. Express your feelings - they\'ll be well received.', 'Social connections sparkle with possibility. A conversation could change everything.', 'Your wit and intelligence are irresistible today. Flirtatious energy flows naturally.'],
    career: ['Your communication skills are cosmically enhanced. Presentations and pitches shine.', 'Multiple opportunities emerge simultaneously. Trust your ability to juggle brilliantly.', 'Networking brings unexpected gifts. Your curiosity opens doors others miss.'],
    wellness: ['Mental stimulation is your medicine today. Read, learn, or try something new.', 'Your air element needs variety - switch up your routine for an energy boost.', 'Balance mental activity with moments of stillness. Your mind needs both.'],
  },
  Cancer: {
    love: ['Your nurturing energy creates deep, meaningful connections today. Love flows abundantly.', 'Emotional intimacy reaches beautiful depths. Trust the vulnerability.', 'Home and heart align perfectly. Create a cozy sanctuary for love to flourish.'],
    career: ['Your intuition guides you to the right decisions. Trust your gut feelings at work.', 'Your caring nature wins loyalty from colleagues. Your emotional intelligence is your edge.', 'Creative projects born from feeling carry special cosmic power today.'],
    wellness: ['Honor your emotional needs today. Water element activities soothe and restore.', 'Your sensitivity is a gift - create peaceful spaces that nurture your spirit.', 'Comfort food and cozy environments recharge your cosmic energy perfectly.'],
  },
  Leo: {
    love: ['Your radiant energy is absolutely magnetic today. Hearts gravitate toward your warmth.', 'Romance is cosmically highlighted. Express your love boldly and beautifully.', 'Your generosity of spirit attracts equally warm-hearted connections.'],
    career: ['You were born to shine, and today the spotlight finds you naturally. Lead with heart.', 'Creative expression brings professional recognition. Your unique talents are in demand.', 'Your confidence inspires others. Leadership opportunities arise organically.'],
    wellness: ['Your fire energy is glorious today. Express yourself physically and creatively.', 'Joy is your best medicine. Do what makes your heart sing.', 'Your vitality is contagious. Share your positive energy generously.'],
  },
  Virgo: {
    love: ['Your thoughtful attention to detail makes loved ones feel truly seen and valued.', 'Acts of service speak louder than words today. Your care creates lasting bonds.', 'Gentle, meaningful gestures carry tremendous romantic power right now.'],
    career: ['Your analytical brilliance solves what others can\'t. Precision is your superpower.', 'Organization and efficiency earn you recognition. Your standards elevate everything.', 'Health, wellness, or service-oriented projects carry special cosmic blessing today.'],
    wellness: ['Your body responds beautifully to healthy routines today. Nourish yourself well.', 'Detailed self-care rituals recharge you. Your earth element loves structure.', 'A clean, organized space clears your mind and lifts your spirit.'],
  },
  Libra: {
    love: ['Harmony and beauty flow through your relationships today. Balance creates bliss.', 'Your natural grace makes every interaction feel special. Partnership energy glows.', 'Aesthetic pleasures shared with someone special create unforgettable moments.'],
    career: ['Your diplomatic skills resolve situations others find impossible. Peace is powerful.', 'Collaborations and partnerships are cosmically blessed. Two minds shine brighter today.', 'Your sense of fairness and beauty elevates everything you touch professionally.'],
    wellness: ['Balance is your cosmic medicine. Equal parts rest and activity create harmony.', 'Beauty feeds your soul. Surround yourself with art, music, and lovely spaces.', 'Social connection is healing for you today. Meaningful conversations restore energy.'],
  },
  Scorpio: {
    love: ['Deep emotional currents carry profound connection today. Intensity is your gift.', 'Transformation in love brings you closer to authentic intimacy. Trust the depth.', 'Your magnetic presence draws exactly the connection you need right now.'],
    career: ['Your investigative instincts uncover hidden opportunities. Research pays off big.', 'Strategic thinking gives you an edge. Your ability to see beneath the surface is unmatched.', 'Financial instincts are razor-sharp today. Trust your deeper knowing.'],
    wellness: ['Emotional release brings physical relief. Let go of what no longer serves you.', 'Your water element craves depth - meditation or journaling unlocks inner peace.', 'Regeneration is your superpower. Your body\'s healing ability is enhanced today.'],
  },
  Sagittarius: {
    love: ['Adventure and romance intertwine beautifully. Share your enthusiasm with open hearts.', 'Your optimism is absolutely contagious. Love expands when you share your vision.', 'Philosophical conversations create surprising sparks of attraction today.'],
    career: ['Your visionary thinking opens expansive possibilities. Dream big - the cosmos supports it.', 'International or educational opportunities shine. Your quest for knowledge attracts success.', 'Teaching, publishing, or travel-related ventures carry special cosmic momentum.'],
    wellness: ['Your fire needs freedom. Outdoor activities and exploration recharge your spirit.', 'Philosophical or spiritual practice brings deep inner peace today.', 'Your natural optimism IS your wellness routine. Keep that beautiful perspective alive.'],
  },
  Capricorn: {
    love: ['Your steady devotion creates unshakeable bonds. Commitment is cosmically beautiful today.', 'Mature, meaningful love deepens. Your reliability is your most attractive quality.', 'Long-term relationship goals receive cosmic support. Build love that lasts.'],
    career: ['Your ambition meets opportunity today. Hard work crystallizes into tangible results.', 'Authority figures notice your dedication. Your career path ascends naturally.', 'Structure and discipline are your superpowers. What you build today lasts.'],
    wellness: ['Your earth energy responds to structure. Disciplined routines yield beautiful results.', 'Bone and joint health benefit from attention today. Strengthen your foundation.', 'Rest is productive too. Allow yourself the recovery that powers your ambition.'],
  },
  Aquarius: {
    love: ['Your uniqueness is exactly what attracts the right people. Be unapologetically you.', 'Friendship-based connections carry romantic potential. Your mind attracts hearts.', 'Innovation in how you love creates exciting new relationship dynamics.'],
    career: ['Your innovative ideas are ahead of their time - and the world is catching up.', 'Technology, humanitarian, or progressive projects carry special cosmic blessing.', 'Your ability to see the future gives you an incredible professional advantage today.'],
    wellness: ['Your air element needs mental stimulation AND social connection for optimal health.', 'Group activities or community involvement recharges your unique energy signature.', 'Your nervous system benefits from grounding practices. Balance innovation with stillness.'],
  },
  Pisces: {
    love: ['Your empathic gifts create soul-deep connections today. Love transcends the ordinary.', 'Artistic expression of love carries extraordinary power. Create beauty together.', 'Your compassion draws kindred spirits. Spiritual connection enriches every bond.'],
    career: ['Your creative intuition guides you to inspired solutions others can\'t imagine.', 'Artistic, spiritual, or healing professions receive extraordinary cosmic support.', 'Your ability to sense what others need gives you a unique professional gift.'],
    wellness: ['Water element healing is powerful today. Baths, swimming, or rain walks restore you.', 'Creative expression IS medicine for your soul. Paint, write, sing, or dance.', 'Protect your beautiful sensitivity. Set gentle boundaries that honor your energy.'],
  },
};

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Generate a daily reading for all active systems
 */
export function generateDailyReading(
  date: Date,
  sunSign: WesternSign,
  rashi: Rashi,
  animal: ChineseAnimal,
): DailyReading {
  const dayIndex = date.getDate() % 3;
  const templates = WESTERN_TEMPLATES[sunSign];

  const westernReading = {
    overall: getDailyOpener(date),
    love: templates.love[dayIndex],
    career: templates.career[dayIndex],
    wellness: templates.wellness[dayIndex],
    luckyNumber: ((date.getDate() + date.getMonth()) % 9) + 1,
  };

  const vedicReading = {
    dasha: `Your current planetary period amplifies your ${rashi} energy beautifully. This is a time of cosmic alignment and inner growth.`,
    nakshatra: `The lunar energy today supports your creative expression and spiritual connection. Trust the flow.`,
    remedy: {
      type: 'mantra' as const,
      name: 'Om Namah Shivaya',
      description: 'Chant this mantra 108 times to align with cosmic vibrations and attract positive energy throughout your day.',
      source: 'Brihat Parashara Hora Shastra',
    },
    mantra: 'Om Namah Shivaya - for cosmic alignment and inner peace',
  };

  const kpReading = {
    eventTiming: 'The current sub-lord period favors new initiatives and creative expression.',
    significatorInsight: 'Your house significators indicate positive movement in career and relationships.',
    sublordGuidance: 'Trust your timing - the cosmos is arranging beautiful synchronicities for you.',
  };

  const chineseReading = {
    element: `Your ${animal} energy is harmonized with today's elemental flow. Natural abundance surrounds you.`,
    animal: `The ${animal}'s innate strengths are amplified today. Your natural gifts shine brighter than usual.`,
    luckyDirection: ['East', 'South', 'West', 'North', 'Southeast', 'Northeast'][date.getDay()],
  };

  const references: PredictionReference[] = [
    { source: 'Ptolemy\'s Tetrabiblos', type: 'book', tradition: 'western' },
    { source: 'Brihat Parashara Hora Shastra', type: 'scripture', tradition: 'vedic', chapter: 'Chapter on Daily Transits' },
    { source: 'The Handbook of Chinese Horoscopes', type: 'book', tradition: 'chinese' },
    { source: 'Krishnamurti Paddhati Reader', type: 'book', tradition: 'kp', chapter: 'Daily Significator Analysis' },
  ];

  return {
    date: getDateKey(date),
    western: westernReading,
    vedic: vedicReading,
    kp: kpReading,
    chinese: chineseReading,
    unified: {
      cosmicVibe: getDailyOpener(date),
      affirmation: getDailyAffirmation(date),
      shareText: `${getDailyOpener(date)} | ${sunSign} + ${rashi} + ${animal} | CosmicSelf`,
    },
    references,
    positivityScore: 0.83,
  };
}
