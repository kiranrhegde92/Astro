import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

/**
 * Instagram/TikTok Story format (9:16 aspect ratio).
 * Designed for vertical full-screen sharing on social platforms.
 */

interface StoryTemplateProps {
  variant: 'daily-vibe' | 'cosmic-dna' | 'compatibility';
  viewShotRef?: React.RefObject<ViewShot | null>;
}

interface DailyVibeStoryProps extends StoryTemplateProps {
  variant: 'daily-vibe';
  userName: string;
  sunSign: string;
  vibe: string;
  affirmation: string;
  date: string;
}

interface CosmicDNAStoryProps extends StoryTemplateProps {
  variant: 'cosmic-dna';
  userName: string;
  westernSign: string;
  moonSign: string;
  rashi: string;
  nakshatra: string;
  animal: string;
  element: string;
  cosmicDNA: string;
}

interface CompatibilityStoryProps extends StoryTemplateProps {
  variant: 'compatibility';
  name1: string;
  name2: string;
  score: number;
  westernScore: number;
  vedicScore: number;
  chineseScore: number;
}

type StoryProps = DailyVibeStoryProps | CosmicDNAStoryProps | CompatibilityStoryProps;

const STORY_GRADIENTS: Record<string, [string, string, ...string[]]> = {
  'daily-vibe': ['#0a0a2e', '#1a0533', '#7b2fbe', '#00d2ff'],
  'cosmic-dna': ['#0a0a2e', '#1a1a4e', '#2d1b69', '#4a00e0'],
  'compatibility': ['#2d0a0a', '#4a0e0e', '#ff6b6b', '#ffd32a'],
};

export function StoryTemplate(props: StoryProps) {
  const { variant, viewShotRef } = props;

  return (
    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
      <LinearGradient
        colors={STORY_GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={styles.story}
      >
        {/* App Branding */}
        <Text style={styles.brand}>CosmicSelf</Text>

        {/* Content */}
        <View style={styles.content}>
          {variant === 'daily-vibe' && <DailyVibeContent {...props as DailyVibeStoryProps} />}
          {variant === 'cosmic-dna' && <CosmicDNAContent {...props as CosmicDNAStoryProps} />}
          {variant === 'compatibility' && <CompatibilityContent {...props as CompatibilityStoryProps} />}
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <View style={styles.ctaBadge}>
            <Text style={styles.ctaText}>Discover Your Cosmic DNA</Text>
          </View>
          <Text style={styles.footerUrl}>{'\u2728'} cosmicself.app</Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

function DailyVibeContent({ userName, sunSign, vibe, affirmation, date }: DailyVibeStoryProps) {
  return (
    <>
      <Text style={styles.storyDate}>{date}</Text>
      <Text style={styles.heroEmoji}>{getZodiacEmoji(sunSign)}</Text>
      <Text style={styles.heroTitle}>{sunSign}</Text>
      <Text style={styles.userName}>{userName}'s Cosmic Vibe</Text>

      <View style={styles.vibeBox}>
        <Text style={styles.vibeText}>{vibe}</Text>
      </View>

      <View style={styles.affirmationBox}>
        <Text style={styles.affirmationLabel}>TODAY'S AFFIRMATION</Text>
        <Text style={styles.affirmationText}>"{affirmation}"</Text>
      </View>
    </>
  );
}

function CosmicDNAContent({ userName, westernSign, moonSign, rashi, nakshatra, animal, element, cosmicDNA }: CosmicDNAStoryProps) {
  return (
    <>
      <Text style={styles.heroEmoji}>{'\u{1F30C}'}</Text>
      <Text style={styles.heroTitle}>My Cosmic DNA</Text>
      <Text style={styles.userName}>{userName}</Text>

      <View style={styles.dnaBox}>
        <Text style={styles.dnaText}>{cosmicDNA}</Text>
      </View>

      <View style={styles.systemGrid}>
        <SystemChip emoji={'\u2648'} label="Sun" value={westernSign} color={COLORS.western} />
        <SystemChip emoji={'\u{1F319}'} label="Moon" value={moonSign} color={COLORS.western} />
        <SystemChip emoji={'\u{1F549}\uFE0F'} label="Rashi" value={rashi} color={COLORS.vedic} />
        <SystemChip emoji={'\u{2B50}'} label="Nakshatra" value={nakshatra} color={COLORS.vedic} />
        <SystemChip emoji={'\u{1F409}'} label="Animal" value={animal} color={COLORS.chinese} />
        <SystemChip emoji={'\u{1F525}'} label="Element" value={element} color={COLORS.chinese} />
      </View>
    </>
  );
}

function CompatibilityContent({ name1, name2, score, westernScore, vedicScore, chineseScore }: CompatibilityStoryProps) {
  return (
    <>
      <Text style={styles.heroEmoji}>{'\u{1F496}'}</Text>
      <Text style={styles.heroTitle}>Cosmic Compatibility</Text>

      <View style={styles.namesColumn}>
        <Text style={styles.compatName}>{name1}</Text>
        <Text style={styles.compatAnd}>&</Text>
        <Text style={styles.compatName}>{name2}</Text>
      </View>

      <Text style={styles.bigScore}>{score}%</Text>
      <Text style={styles.matchLabel}>Cosmic Match</Text>

      <View style={styles.scoreRow}>
        <ScoreChip emoji={'\u2648'} label="Western" score={westernScore} />
        <ScoreChip emoji={'\u{1F549}\uFE0F'} label="Vedic" score={vedicScore} />
        <ScoreChip emoji={'\u{1F409}'} label="Chinese" score={chineseScore} />
      </View>
    </>
  );
}

function SystemChip({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <View style={[styles.systemChip, { borderColor: color }]}>
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function ScoreChip({ emoji, label, score }: { emoji: string; label: string; score: number }) {
  return (
    <View style={styles.scoreChip}>
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Text style={styles.scoreChipValue}>{score}%</Text>
      <Text style={styles.scoreChipLabel}>{label}</Text>
    </View>
  );
}

function getZodiacEmoji(sign: string): string {
  const map: Record<string, string> = {
    Aries: '\u2648', Taurus: '\u2649', Gemini: '\u264A', Cancer: '\u264B',
    Leo: '\u264C', Virgo: '\u264D', Libra: '\u264E', Scorpio: '\u264F',
    Sagittarius: '\u2650', Capricorn: '\u2651', Aquarius: '\u2652', Pisces: '\u2653',
  };
  return map[sign] ?? '\u2728';
}

const styles = StyleSheet.create({
  // 9:16 story format (360x640 for capture, scales well)
  story: {
    width: 360,
    height: 640,
    padding: SPACING.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: COLORS.starGold,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  storyDate: { color: COLORS.textSecondary, fontSize: 13, marginBottom: SPACING.md },
  heroEmoji: { fontSize: 64, marginBottom: SPACING.sm },
  heroTitle: { color: COLORS.white, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  userName: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600', marginTop: 4, marginBottom: SPACING.lg },
  vibeBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.md,
  },
  vibeText: { color: COLORS.white, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  affirmationBox: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
  },
  affirmationLabel: { color: COLORS.starGold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  affirmationText: { color: COLORS.starGold, fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  dnaBox: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dnaText: { color: COLORS.starGold, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  systemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    width: '100%',
  },
  systemChip: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    width: '45%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  chipEmoji: { fontSize: 20 },
  chipLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  chipValue: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginTop: 2 },
  namesColumn: { alignItems: 'center', marginVertical: SPACING.md },
  compatName: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  compatAnd: { color: COLORS.starGold, fontSize: 18, fontWeight: '600', marginVertical: 4 },
  bigScore: {
    color: COLORS.white,
    fontSize: 72,
    fontWeight: '900',
    textShadowColor: 'rgba(255,255,255,0.4)',
    textShadowRadius: 30,
    textShadowOffset: { width: 0, height: 0 },
  },
  matchLabel: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600', marginBottom: SPACING.lg },
  scoreRow: { flexDirection: 'row', gap: SPACING.md },
  scoreChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    width: 85,
  },
  scoreChipValue: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  scoreChipLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  footer: { alignItems: 'center', gap: SPACING.sm },
  ctaBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
  ctaText: { color: COLORS.starGold, fontSize: 13, fontWeight: '700' },
  footerUrl: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
});
