import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { StarField } from '../../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { getCosmicDNASummary } from '../../src/engines/unified';
import { useConnectionsStore } from '../../src/store/connectionsStore';
import { useJournalStore } from '../../src/store/journalStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';

function ActionRow({
  label,
  value,
  onPress,
  accent,
  icon,
  secondary,
}: {
  label: string;
  value: string;
  onPress: () => void;
  accent: string;
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  secondary: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84}>
      <View style={styles.actionRow}>
        <OrbIcon icon={icon} size={34} accentColor={accent} secondaryColor={secondary} />
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const savedProfiles = useConnectionsStore((state) => state.savedProfiles);
  const entries = useJournalStore((state) => state.entries);
  const archiveCount = useReadingStore((state) => Object.keys(state.cachedReadings).length);

  const cosmicDNA = useMemo(() => {
    if (!user?.western || !user?.vedic || !user?.chinese) return '';
    return getCosmicDNASummary({
      western: user.western,
      vedic: user.vedic,
      chinese: user.chinese,
      kp: user.kp,
    });
  }, [user?.western, user?.vedic, user?.chinese, user?.kp]);

  if (!user) return null;

  const birthDate = user.birthDetails.date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Profile</Text>

        <AnimatedCard index={0}>
          <View style={styles.posterWrap}>
            <LinearGradient colors={COLORS.gradientInkSoft} style={styles.poster}>
              <Text style={styles.posterLabel}>Your chart archive</Text>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.birthMeta}>
                {birthDate}
                {user.birthDetails.place?.name ? ` - ${user.birthDetails.place.name}` : ''}
              </Text>
            </LinearGradient>
            <View style={styles.posterOrb}>
              <CosmicOrb size={156} />
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <LinearGradient colors={COLORS.gradientInkSoft} style={styles.archiveBoard}>
            <Text style={styles.sectionLabel}>Cosmic DNA</Text>
            <Text style={styles.summary}>{cosmicDNA}</Text>

            <View style={styles.boardDivider} />

            <View style={styles.boardRow}>
              <View style={styles.signatureChip}>
                <Text style={styles.signatureLabel}>Sun</Text>
                <Text style={styles.signatureValue}>{user.western?.sun ?? 'Unknown'}</Text>
              </View>
              <View style={styles.signatureChip}>
                <Text style={styles.signatureLabel}>Rashi</Text>
                <Text style={styles.signatureValue}>{user.vedic?.rashi ?? 'Unknown'}</Text>
              </View>
              <View style={styles.signatureChip}>
                <Text style={styles.signatureLabel}>Animal</Text>
                <Text style={styles.signatureValue}>{user.chinese?.animal ?? 'Unknown'}</Text>
              </View>
            </View>

            <View style={styles.boardDivider} />

            <View style={styles.boardRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{user.cosmicPoints}</Text>
                <Text style={styles.metricLabel}>Cosmic points</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{user.streak}</Text>
                <Text style={styles.metricLabel}>Reading streak</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{user.subscription.tier}</Text>
                <Text style={styles.metricLabel}>Plan</Text>
              </View>
            </View>
          </LinearGradient>
        </AnimatedCard>

        <AnimatedCard index={2}>
          <GradientCard style={styles.actionsCard} colors={COLORS.gradientSilver} accentColor={COLORS.gold}>
            <Text style={styles.actionsLabel}>Open next</Text>
            <ActionRow label="Connections" value={`${savedProfiles.length} saved people`} onPress={() => router.push('/(tabs)/compatibility')} accent={COLORS.coral} icon="people" secondary="#ffdbe6" />
            <ActionRow label="Journal" value={`${entries.length} notes, ${archiveCount} archive days`} onPress={() => router.push('/(tabs)/cosmos')} accent={COLORS.iris} icon="book" secondary="#ece6ff" />
            <ActionRow label="Share card" value="Create a social card" onPress={() => router.push('/share/card')} accent={COLORS.gold} icon="share-social" secondary="#fff4cf" />
            <ActionRow label="My QR code" value="Swap your profile instantly" onPress={() => router.push('/qr/my-code')} accent={COLORS.tide} icon="qr-code" secondary="#e1f5ef" />
            <ActionRow label="Settings" value="Language, reminders, and logout" onPress={() => router.push('/settings')} accent={COLORS.plum} icon="settings" secondary="#f2e2ea" />
            {user.subscription.tier === 'free' ? (
              <ActionRow label="Upgrade" value="Unlock premium readings" onPress={() => router.push('/subscription')} accent={COLORS.sunOrange} icon="sparkles" secondary="#ffe9c7" />
            ) : null}
          </GradientCard>
        </AnimatedCard>
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  posterWrap: {
    position: 'relative',
    minHeight: 220,
  },
  poster: {
    minHeight: 194,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  posterOrb: {
    position: 'absolute',
    right: -2,
    top: 28,
  },
  posterLabel: {
    color: 'rgba(255,250,241,0.72)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  name: {
    color: '#fffaf1',
    fontSize: 40,
    lineHeight: 46,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
    maxWidth: 200,
  },
  birthMeta: {
    color: 'rgba(255,250,241,0.80)',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 200,
  },
  sectionLabel: {
    color: 'rgba(255,250,241,0.72)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  archiveBoard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.ruleLight,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.deep,
  },
  summary: {
    color: '#fffaf1',
    fontSize: 24,
    lineHeight: 32,
    fontFamily: FONTS.heading,
  },
  boardDivider: {
    height: 1,
    backgroundColor: COLORS.ruleLight,
  },
  boardRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  signatureChip: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 4,
  },
  signatureLabel: {
    color: 'rgba(255,250,241,0.62)',
    fontSize: 11,
    fontFamily: FONTS.accent,
  },
  signatureValue: {
    color: '#fffaf1',
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  metric: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 4,
  },
  metricValue: {
    color: '#fffaf1',
    fontSize: 22,
    lineHeight: 26,
    fontFamily: FONTS.heading,
    textTransform: 'capitalize',
  },
  metricLabel: {
    color: 'rgba(255,250,241,0.62)',
    fontSize: 11,
    fontFamily: FONTS.accent,
  },
  actionsCard: {
    gap: SPACING.sm,
  },
  actionsLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  actionLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
  actionValue: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 120,
    textAlign: 'right',
  },
});
