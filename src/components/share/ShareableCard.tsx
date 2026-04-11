import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { OrbIcon } from '../ui/OrbIcon';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants/theme';
import type { CosmicProfile } from '../../types/astrology';
import { getCosmicDNASummary } from '../../engines/unified';

interface ShareableCardProps {
  userName: string;
  profile: CosmicProfile;
  type: 'cosmic-dna' | 'daily-vibe' | 'compatibility';
  onCapture?: (uri: string) => void;
  viewShotRef?: React.RefObject<ViewShot | null>;
  showWatermark?: boolean;
}

function CardShell({
  children,
  colors,
  viewShotRef,
  showWatermark = true,
}: {
  children: React.ReactNode;
  colors: [string, string, ...string[]];
  viewShotRef?: React.RefObject<ViewShot | null>;
  showWatermark?: boolean;
}) {
  return (
    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.cardGlow} />
        <View style={styles.cardContent}>
          {children}
          {showWatermark ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>cosmicself.app</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

export function ShareableCard({
  userName,
  profile,
  viewShotRef,
  showWatermark = true,
}: ShareableCardProps) {
  const cosmicDNA = getCosmicDNASummary(profile);

  return (
    <CardShell colors={['#fffaf1', '#f7efe0', '#eddcc1']} viewShotRef={viewShotRef} showWatermark={showWatermark}>
      <Text style={styles.appName}>COSMICSELF</Text>
      <Text style={styles.userName}>{userName}</Text>

      <View style={styles.heroOrbWrap}>
        <OrbIcon icon="sparkles" size={86} accentColor={COLORS.gold} secondaryColor="#fff3cf" active />
      </View>

      <View style={styles.dnaContainer}>
        <Text style={styles.dnaLabel}>MY COSMIC DNA</Text>
        <Text style={styles.dnaValue}>{cosmicDNA}</Text>
      </View>

      <View style={styles.systemsGrid}>
        <SystemBadge
          icon="sunny"
          accent={COLORS.western}
          secondary="#ece6ff"
          label="Western"
          value={`${profile.western.sun} Sun`}
          detail={`${profile.western.moon} Moon${profile.western.rising ? ` - ${profile.western.rising} Rising` : ''}`}
        />
        <SystemBadge
          icon="moon"
          accent={COLORS.vedic}
          secondary="#ffe6d8"
          label="Vedic"
          value={profile.vedic.rashi}
          detail={profile.vedic.nakshatra}
        />
        <SystemBadge
          icon="leaf"
          accent={COLORS.chinese}
          secondary="#ffe7db"
          label="Chinese"
          value={profile.chinese.element}
          detail={profile.chinese.animal}
        />
        {profile.kp ? (
          <SystemBadge
            icon="sparkles"
            accent={COLORS.kp}
            secondary="#e1f5ef"
            label="KP"
            value={`${profile.kp.predictions?.length ?? 0} insights`}
            detail="timing lens"
          />
        ) : null}
      </View>

    </CardShell>
  );
}

export function CompatibilityCard({
  name1,
  name2,
  score,
  westernScore,
  vedicScore,
  chineseScore,
  viewShotRef,
  showWatermark = true,
}: {
  name1: string;
  name2: string;
  score: number;
  westernScore: number;
  vedicScore: number;
  chineseScore: number;
  viewShotRef?: React.RefObject<ViewShot | null>;
  showWatermark?: boolean;
}) {
  return (
    <CardShell colors={['#fff3ec', '#ffe0d4', '#ffd2c4']} viewShotRef={viewShotRef} showWatermark={showWatermark}>
      <Text style={styles.appName}>COSMICSELF</Text>
      <Text style={styles.compatTitle}>Cosmic compatibility</Text>

      <View style={styles.namesRow}>
        <View style={styles.nameStack}>
          <OrbIcon icon="person" size={56} accentColor={COLORS.sunOrange} secondaryColor="#ffe9c7" active />
          <Text style={styles.compatName}>{name1}</Text>
        </View>
        <OrbIcon icon="heart" size={52} accentColor={COLORS.coral} secondaryColor="#ffe3da" active />
        <View style={styles.nameStack}>
          <OrbIcon icon="person" size={56} accentColor={COLORS.iris} secondaryColor="#ece6ff" active />
          <Text style={styles.compatName}>{name2}</Text>
        </View>
      </View>

      <Text style={styles.compatScore}>{score}%</Text>
      <Text style={styles.compatLabel}>overall match</Text>

      <View style={styles.breakdownRow}>
        <ScoreBadge icon="sunny" label="Western" score={westernScore} accent={COLORS.western} secondary="#ece6ff" />
        <ScoreBadge icon="moon" label="Vedic" score={vedicScore} accent={COLORS.vedic} secondary="#ffe6d8" />
        <ScoreBadge icon="leaf" label="Chinese" score={chineseScore} accent={COLORS.chinese} secondary="#ffe7db" />
      </View>

    </CardShell>
  );
}

function ScoreBadge({
  icon,
  label,
  score,
  accent,
  secondary,
}: {
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  label: string;
  score: number;
  accent: string;
  secondary: string;
}) {
  return (
    <View style={styles.scoreBadge}>
      <OrbIcon icon={icon} size={40} accentColor={accent} secondaryColor={secondary} />
      <Text style={styles.scoreBadgeValue}>{score}%</Text>
      <Text style={styles.scoreBadgeLabel}>{label}</Text>
    </View>
  );
}

function SystemBadge({
  icon,
  accent,
  secondary,
  label,
  value,
  detail,
}: {
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  accent: string;
  secondary: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={[styles.systemBadge, { borderColor: accent }]}>
      <OrbIcon icon={icon} size={42} accentColor={accent} secondaryColor={secondary} />
      <Text style={styles.systemLabel}>{label}</Text>
      <Text style={styles.systemValue}>{value}</Text>
      <Text style={styles.systemDetail}>{detail}</Text>
    </View>
  );
}

export function DailyVibeCard({
  sunSign,
  vibe,
  affirmation,
  date,
  viewShotRef,
  showWatermark = true,
}: {
  userName: string;
  sunSign: string;
  vibe: string;
  affirmation: string;
  date: string;
  viewShotRef?: React.RefObject<ViewShot | null>;
  showWatermark?: boolean;
}) {
  return (
    <CardShell colors={['#fffaf1', '#f8e8d6', '#f2d3b0']} viewShotRef={viewShotRef} showWatermark={showWatermark}>
      <Text style={styles.appName}>COSMICSELF</Text>
      <Text style={styles.vibeDate}>{date}</Text>

      <OrbIcon icon="sunny" size={84} accentColor={COLORS.sunOrange} secondaryColor="#ffe9c7" active />
      <Text style={styles.vibeSign}>{sunSign}</Text>
      <Text style={styles.vibeTitle}>Today's cosmic vibe</Text>
      <Text style={styles.vibeText}>{vibe}</Text>

      <View style={styles.affirmationBox}>
        <Text style={styles.affirmationLabel}>AFFIRMATION</Text>
        <Text style={styles.affirmationText}>"{affirmation}"</Text>
      </View>

    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  cardContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  appName: {
    color: COLORS.goldMid,
    fontSize: 13,
    fontFamily: FONTS.accent,
    letterSpacing: 2.4,
    marginBottom: SPACING.md,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontFamily: FONTS.display,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroOrbWrap: {
    marginBottom: SPACING.md,
  },
  dnaContainer: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  dnaLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  dnaValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  systemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  systemBadge: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  systemLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.9,
    marginTop: 6,
  },
  systemValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.heading,
    marginTop: 2,
    textAlign: 'center',
  },
  systemDetail: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
  },
  compatTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.heading,
    marginBottom: SPACING.md,
  },
  namesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  nameStack: {
    alignItems: 'center',
    gap: 6,
    width: 110,
  },
  compatName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  compatScore: {
    color: COLORS.textPrimary,
    fontSize: 64,
    fontFamily: FONTS.display,
  },
  compatLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    width: 82,
    ...SHADOWS.glass,
  },
  scoreBadgeValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.heading,
    marginTop: 6,
  },
  scoreBadgeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
  },
  vibeDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.md,
  },
  vibeSign: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontFamily: FONTS.heading,
    marginTop: SPACING.sm,
  },
  vibeTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.heading,
    marginBottom: SPACING.sm,
  },
  vibeText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  affirmationBox: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  affirmationLabel: {
    color: COLORS.goldMid,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  affirmationText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
