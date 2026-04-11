import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { StarField } from '../../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import { formatDisplayDate } from '../../src/utils/dateUtils';
import { hasPremiumEntitlement } from '../../src/utils/subscription';

export default function ShareScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const getRecentReadings = useReadingStore((s) => s.getRecentReadings);
  const isPremium = hasPremiumEntitlement(user?.subscription);
  const archive = getRecentReadings(isPremium ? 30 : 3);

  if (!user) return null;

  return (
    <StarField>
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Share</Text>
        <Text style={styles.headline}>Spread your cosmic energy</Text>

        {/* ── QR Code Quick Access ─────────────────────────────────── */}
        <AnimatedCard index={0}>
          <LinearGradient colors={COLORS.gradientInk} style={styles.qrCard}>
            <View style={styles.qrTop}>
              <View style={styles.qrIcon}>
                <Ionicons name="qr-code" size={32} color="#fffaf1" />
              </View>
              <View style={styles.qrContent}>
                <Text style={styles.qrTitle}>My Cosmic QR</Text>
                <Text style={styles.qrSubtitle}>
                  Let others scan your chart instantly
                </Text>
              </View>
            </View>
            <View style={styles.qrActions}>
              <CosmicButton
                title="Open QR Code"
                onPress={() => router.push('/qr/my-code')}
              />
              <CosmicButton
                title="Scan a Code"
                onPress={() => router.push('/qr/scan')}
                variant="outline"
              />
            </View>
          </LinearGradient>
        </AnimatedCard>

        {/* ── Share Today's Reading ────────────────────────────────── */}
        <AnimatedCard index={1}>
          <TouchableOpacity activeOpacity={0.84} onPress={() => router.push('/share/card')}>
            <GradientCard accentColor={COLORS.sunOrange} colors={COLORS.gradientDawn}>
              <View style={styles.shareRow}>
                <OrbIcon icon="sunny" size={42} accentColor={COLORS.sunOrange} secondaryColor="#ffe9c7" />
                <View style={styles.shareText}>
                  <Text style={styles.shareTitle}>Share today's reading</Text>
                  <Text style={styles.shareCopy}>Create a beautiful card to post or send</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={COLORS.textMuted} />
              </View>
            </GradientCard>
          </TouchableOpacity>
        </AnimatedCard>

        {/* ── Reading Archive ──────────────────────────────────────── */}
        <AnimatedCard index={2}>
          <View style={styles.archiveHeader}>
            <Text style={styles.archiveTitle}>Recent readings</Text>
            <Text style={styles.archiveSubtitle}>Your last few days at a glance</Text>
            {!isPremium ? (
              <TouchableOpacity style={styles.archiveUpgrade} onPress={() => router.push('/subscription')} activeOpacity={0.84}>
                <Text style={styles.archiveUpgradeText}>Free archive shows 3 readings. Premium opens the full archive.</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.starGold} />
              </TouchableOpacity>
            ) : null}
          </View>
          {archive.length > 0 ? (
            <View style={styles.archiveList}>
              {archive.map((reading) => (
                <TouchableOpacity
                  key={reading.date}
                  activeOpacity={0.84}
                  onPress={() => router.push({ pathname: '/reading/archive', params: { date: reading.date } })}
                >
                  <GradientCard accentColor={COLORS.gold} style={styles.archiveItem}>
                    <Text style={styles.archiveDate}>{formatDisplayDate(reading.date)}</Text>
                    <Text style={styles.archiveVibe} numberOfLines={2}>{reading.unified.cosmicVibe}</Text>
                    <Text style={styles.archiveAffirmation} numberOfLines={1}>"{reading.unified.affirmation}"</Text>
                  </GradientCard>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <GradientCard accentColor={COLORS.textMuted}>
              <Text style={styles.emptyText}>Your reading archive will appear here as you use the app each day.</Text>
            </GradientCard>
          )}
        </AnimatedCard>

        <View style={styles.bottomPad} />
      </ResetScrollView>
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
  headline: {
    color: COLORS.textPrimary,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: FONTS.display,
    letterSpacing: -0.6,
  },
  // QR Card
  qrCard: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    gap: SPACING.lg,
    ...SHADOWS.deep,
  },
  qrTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  qrIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContent: {
    flex: 1,
  },
  qrTitle: {
    color: '#fffaf1',
    fontSize: 20,
    fontFamily: FONTS.heading,
  },
  qrSubtitle: {
    color: 'rgba(255,250,241,0.72)',
    fontSize: 13,
    marginTop: 2,
  },
  qrActions: {
    gap: SPACING.sm,
  },
  // Share Reading
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  shareText: {
    flex: 1,
  },
  shareTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  shareCopy: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  // Archive
  archiveHeader: {
    gap: SPACING.xs,
  },
  archiveTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.heading,
  },
  archiveSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  archiveUpgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: `${COLORS.starGold}44`,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.starGold}12`,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  archiveUpgradeText: {
    flex: 1,
    color: COLORS.starGoldDeep,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: FONTS.heading,
  },
  archiveList: {
    gap: SPACING.sm,
  },
  archiveItem: {
    marginTop: 0,
  },
  archiveDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  archiveVibe: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.body,
  },
  archiveAffirmation: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bottomPad: {
    height: 40,
  },
});
