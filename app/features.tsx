import React from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../src/components/web/WebShell';
import { SEOHead } from '../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../src/constants/theme';

const FEATURES = [
  {
    kicker: 'DAILY RITUAL',
    title: 'Today Brief',
    body: 'A calm, composed morning reading that draws from four living systems — not a recycled horoscope. Each day has a real texture; Today Brief names it.',
    bullets: [
      'Western transit mood: what the sky is pressing on right now',
      'Vedic nakshatra tone: your lunar rhythm for the day',
      'Chinese element pulse: pace, energy, and instinct signal',
      'KP house signal: sharper house-level timing detail',
    ],
    accentColor: COLORS.tide,
    gradientImage:
      'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
  },
  {
    kicker: 'BIRTH PATTERN',
    title: 'Self Chart',
    body: 'Your birth chart rendered across four systems in a single coherent profile — with plain-English interpretations you can actually use, not just glyph tables.',
    bullets: [
      'Western natal: planets, aspects, and house overlays',
      'Vedic sidereal: rashi, nakshatra, and lagna with dasha timing',
      'Chinese four pillars: year, month, day, and hour stems and branches',
      'KP pillars: sub-lord detail for house-level precision',
    ],
    accentColor: COLORS.starGold,
    gradientImage:
      'radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
  },
  {
    kicker: 'AI ORACLE',
    title: 'Ask Akasha',
    body: 'Ask a real question and receive a grounded answer rooted in your actual chart — not a blog horoscope or a generic affirmation engine.',
    bullets: [
      'Answers grounded in your natal placements, not a generic prompt',
      'Understands transits, timing, and house emphasis for today',
      '1 free question per day; 3 per day on premium',
      'No spiritual bypassing — honest, clear, chart-backed',
    ],
    accentColor: COLORS.tide,
    gradientImage:
      'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
  },
  {
    kicker: 'MATCH',
    title: 'Compatibility',
    body: 'A real synastry reading between any two saved people — not a sun-sign compatibility quiz. Strengths, friction points, and the timing windows that matter.',
    bullets: [
      'Cross-system synastry: Western aspects, Vedic compatibility scores',
      'Strength zones and friction points named plainly',
      'Timing windows: when the connection runs hot or cold',
      'Works for any relationship type — friends, partners, colleagues',
    ],
    accentColor: COLORS.starGold,
    gradientImage:
      'radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
  },
  {
    kicker: 'SHARE',
    title: 'Cosmic QR',
    body: 'A private, shareable cosmic identity — a QR card that shows only what you choose. No full chart dumps. No unsolicited placements. Yours to revoke at any time.',
    bullets: [
      'Shows only Sun, Moon, and Rising — nothing more by default',
      'One-tap QR code and shareable profile link',
      'Revoke access from Settings at any time',
      'Works without the other person having the app',
    ],
    accentColor: COLORS.tide,
    gradientImage:
      'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
  },
];

export default function FeaturesPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  return (
    <WebShell>
      <SEOHead
        title="Features — CosmicSelf"
        description="Daily readings, natal chart across four systems, AI oracle, compatibility, and shareable cosmic cards — a complete mobile astrology ritual."
        canonical="https://cosmicself.app/features"
      />

      {/* Page hero */}
      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.eyebrow}>FEATURES</Text>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
          Every ritual, in one app.
        </Text>
        <Text style={[styles.heroBody, isWide && styles.heroBodyWide]}>
          CosmicSelf draws on Western, Vedic, Chinese, and KP astrology simultaneously — not as
          a novelty, but because each system illuminates something the others miss. Five quiet
          rituals, built to fit a morning.
        </Text>
      </View>

      {/* Feature cards */}
      <View style={styles.cardList}>
        {FEATURES.map((feat, i) => (
          <View
            key={feat.title}
            style={[
              styles.card,
              { borderColor: i % 2 === 0 ? 'rgba(62,224,200,0.26)' : 'rgba(241,183,79,0.26)' },
              Platform.OS === 'web' && ({ backgroundImage: feat.gradientImage } as any),
            ]}
          >
            <View style={[styles.cardInner, isWide && styles.cardInnerWide]}>
              {/* Left / top: kicker + title + body */}
              <View style={[styles.cardCopy, isWide && styles.cardCopyWide]}>
                <Text style={[styles.kicker, { color: feat.accentColor }]}>{feat.kicker}</Text>
                <Text style={[styles.cardTitle, !isWide && styles.cardTitleCompact]}>
                  {feat.title}
                </Text>
                <Text style={styles.cardBody}>{feat.body}</Text>
              </View>

              {/* Right / bottom: bullet capabilities */}
              <View style={[styles.bulletBlock, isWide && styles.bulletBlockWide]}>
                {feat.bullets.map((b) => (
                  <View key={b} style={styles.bulletRow}>
                    <Text style={[styles.bulletDot, { color: feat.accentColor }]}>—</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Philosophy strip */}
      <View style={[styles.philosophy, isWide && styles.philosophyWide]}>
        <Text style={styles.sectionKicker}>THE APPROACH</Text>
        <Text style={[styles.philosophyTitle, !isWide && styles.philosophyTitleCompact]}>
          Four systems, one honest signal.
        </Text>
        <View style={styles.systemsGrid}>
          {[
            ['Western', COLORS.tide, 'Transit mood and house emphasis. What the sky is pushing against today.'],
            ['Vedic', COLORS.starGold, 'Sidereal nakshatra, rashi, and dasha timing. Your lunar and karmic rhythm.'],
            ['Chinese', COLORS.vedic, 'Four pillars of stems and branches. Pace, element, and seasonal instinct.'],
            ['KP', COLORS.plum, 'Sub-lord precision at the house level. The sharpest timing signal we have.'],
          ].map(([name, color, desc]) => (
            <View key={name as string} style={styles.systemCard}>
              <Text style={[styles.systemName, { color: color as string }]}>{name as string}</Text>
              <Text style={styles.systemDesc}>{desc as string}</Text>
            </View>
          ))}
        </View>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 72,
    paddingBottom: 56,
    paddingHorizontal: SPACING.lg,
  },
  heroWide: {
    paddingTop: 86,
    paddingBottom: 72,
    paddingHorizontal: SPACING.xl,
  },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  heroTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1.8,
    maxWidth: 760,
    marginBottom: 22,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(120deg, #fff8f2 0%, #ffd9b8 42%, #12c8b2 78%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
        }
      : {}),
  },
  heroTitleCompact: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.2,
  },
  heroBody: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.body,
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 680,
  },
  heroBodyWide: {
    fontSize: 20,
    lineHeight: 33,
  },

  cardList: {
    gap: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 72,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(23,24,45,0.58)',
    overflow: 'hidden',
    ...SHADOWS.deep,
  },

  cardInner: {
    padding: 28,
    gap: 28,
  },
  cardInnerWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 48,
    paddingHorizontal: 36,
    paddingVertical: 36,
  },

  cardCopy: {
    gap: 10,
  },
  cardCopyWide: {
    flex: 1,
  },

  kicker: {
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.4,
  },
  cardTitleCompact: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
  },
  cardBody: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 27,
    marginTop: 4,
  },

  bulletBlock: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.12)',
    paddingTop: 20,
  },
  bulletBlockWide: {
    flex: 1,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,248,242,0.12)',
    borderTopColor: undefined as any,
    paddingTop: 0,
    paddingLeft: 36,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },

  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontFamily: FONTS.accent,
    fontSize: 13,
    lineHeight: 24,
    letterSpacing: 0,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 24,
  },

  philosophy: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 86,
    paddingTop: 16,
  },
  philosophyWide: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 100,
  },
  sectionKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  philosophyTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.6,
    marginBottom: 36,
    maxWidth: 680,
  },
  philosophyTitleCompact: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
  },

  systemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  systemCard: {
    flexGrow: 1,
    flexBasis: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.14)',
    backgroundColor: 'rgba(23,24,45,0.52)',
    padding: 20,
    gap: 8,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 12px 32px -16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,248,242,0.05)' as any,
        }
      : SHADOWS.card),
  },
  systemName: {
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  systemDesc: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
  },
});
