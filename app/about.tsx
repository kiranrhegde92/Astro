import React from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../src/components/web/WebShell';
import { SEOHead } from '../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../src/constants/theme';

const PRINCIPLES = [
  {
    kicker: 'HONEST READINGS',
    title: 'No spiritual bypassing.',
    body: 'Astrology should help you see yourself more clearly, not hand you a comforting story. Our readings name the friction, the timing, and the tension — alongside what supports you.',
  },
  {
    kicker: 'YOUR DATA, QUIET',
    title: 'Minimum viable telemetry.',
    body: 'We store what we need for the reading — birth details, chart snapshots, your chosen profiles. No ad networks on the mobile app. No behavioral tracking. Shareable cards show only what you approve.',
  },
  {
    kicker: 'NO DARK PATTERNS',
    title: 'Free is actually useful.',
    body: 'The free tier is not a demo. A real daily reading, a real chart summary, a real compatibility check. Premium is for people who want forecasts, archive, and unlimited depth — not people trying to unlock basic function.',
  },
  {
    kicker: 'FOUR LIVING SYSTEMS',
    title: 'One honest signal.',
    body: 'Western, Vedic, Chinese, and KP astrology come from different civilizations, different calendars, different premises. When they agree, the signal is real. When they disagree, we tell you where and why.',
  },
];

const NUMBERS: Array<{ value: string; label: string; desc: string }> = [
  { value: '4', label: 'SYSTEMS', desc: 'Western, Vedic, Chinese, KP — running side by side every day.' },
  { value: '1', label: 'DAILY RITUAL', desc: 'One calm morning reading, not a stream of notifications.' },
  { value: '0', label: 'ADS IN APP', desc: 'Rewarded ads are opt-in. No banner ads, no interstitials.' },
];

export default function AboutPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <WebShell>
      <SEOHead
        title="About — CosmicSelf"
        description="CosmicSelf is an astrology app built around four living systems — Western, Vedic, Chinese, and KP — with honest readings, quiet privacy, and a free tier that actually works."
        canonical="https://cosmicself.app/about"
      />

      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.eyebrow}>ABOUT</Text>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
          Astrology without the theatre.
        </Text>
        <Text style={[styles.heroBody, isWide && styles.heroBodyWide]}>
          CosmicSelf exists because the astrology we found online was either too glib — sun-sign
          horoscopes written by people who skim Wikipedia — or too opaque, locked behind
          jargon-heavy glyph tables. Neither felt honest. We wanted a reading that respects you
          as an adult: plain English, real signal, and four classical systems working together
          instead of competing.
        </Text>
      </View>

      <View style={[styles.numbersStrip, isWide && styles.numbersStripWide]}>
        {NUMBERS.map((n) => (
          <View key={n.label} style={[styles.numberCard, isWide && styles.numberCardWide]}>
            <Text style={styles.numberValue}>{n.value}</Text>
            <Text style={styles.numberLabel}>{n.label}</Text>
            <Text style={styles.numberDesc}>{n.desc}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.principles, isWide && styles.principlesWide]}>
        <Text style={styles.sectionKicker}>WHAT WE BELIEVE</Text>
        <Text style={[styles.sectionTitle, !isWide && styles.sectionTitleCompact]}>
          Four principles that shape the app.
        </Text>

        <View style={styles.principleList}>
          {PRINCIPLES.map((p, i) => (
            <View
              key={p.title}
              style={[
                styles.principleCard,
                { borderColor: i % 2 === 0 ? 'rgba(62,224,200,0.26)' : 'rgba(241,183,79,0.26)' },
                Platform.OS === 'web' &&
                  ({
                    backgroundImage:
                      i % 2 === 0
                        ? 'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)'
                        : 'radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
                  } as any),
              ]}
            >
              <Text style={[styles.principleKicker, { color: i % 2 === 0 ? COLORS.tide : COLORS.starGold }]}>
                {p.kicker}
              </Text>
              <Text style={[styles.principleTitle, !isWide && styles.principleTitleCompact]}>{p.title}</Text>
              <Text style={styles.principleBody}>{p.body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.storyBand, isWide && styles.storyBandWide]}>
        <Text style={styles.sectionKicker}>THE APPROACH</Text>
        <Text style={[styles.storyTitle, !isWide && styles.storyTitleCompact]}>
          A small team, an editorial voice.
        </Text>
        <Text style={[styles.storyBody, isWide && styles.storyBodyWide]}>
          CosmicSelf is built by a small team that cares more about prose than pageviews. The
          daily reading is a piece of writing first — then validated against the charts, transits,
          and timing windows. We would rather ship a quieter app that you actually read than a
          louder one you dismiss.
        </Text>
        <Text style={[styles.storyBody, isWide && styles.storyBodyWide, { marginTop: 16 }]}>
          Questions, feedback, or reading corrections are genuinely welcome — the app gets better
          because real people notice when a phrasing is off. Reach us at{' '}
          <Text style={styles.email}>admin@cosmicself.app</Text>.
        </Text>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: SPACING.lg,
  },
  heroWide: { paddingTop: 86, paddingBottom: 60, paddingHorizontal: SPACING.xl },
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
    maxWidth: 780,
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
  heroTitleCompact: { fontSize: 38, lineHeight: 42, letterSpacing: -1.2 },
  heroBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 720,
  },
  heroBodyWide: { fontSize: 19, lineHeight: 32 },

  numbersStrip: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 56,
    gap: 16,
  },
  numbersStripWide: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 72,
    gap: 20,
  },
  numberCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.14)',
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 24,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 18px 44px -22px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,248,242,0.05)' as any }
      : SHADOWS.card),
  },
  numberCardWide: { padding: 28 },
  numberValue: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 58,
    lineHeight: 60,
    letterSpacing: -2,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage: 'linear-gradient(140deg, #ffd9b8 0%, #f1b74f 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
        }
      : {}),
  },
  numberLabel: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 10,
  },
  numberDesc: {
    color: 'rgba(255,248,242,0.66)',
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
  },

  principles: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 72,
  },
  principlesWide: { paddingHorizontal: SPACING.xl, paddingBottom: 86 },
  sectionKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.4,
    marginBottom: 32,
    maxWidth: 680,
  },
  sectionTitleCompact: { fontSize: 32, lineHeight: 36, letterSpacing: -1 },

  principleList: { gap: 18 },
  principleCard: {
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 28,
    gap: 10,
    ...SHADOWS.deep,
  },
  principleKicker: {
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  principleTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.1,
  },
  principleTitleCompact: { fontSize: 26, lineHeight: 30, letterSpacing: -0.8 },
  principleBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 27,
    marginTop: 4,
  },

  storyBand: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
    paddingBottom: 100,
  },
  storyBandWide: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  storyTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.4,
    marginBottom: 28,
    maxWidth: 680,
  },
  storyTitleCompact: { fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  storyBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 720,
  },
  storyBodyWide: { fontSize: 18, lineHeight: 30 },
  email: { color: COLORS.starGold, fontFamily: FONTS.accentBold },
});
