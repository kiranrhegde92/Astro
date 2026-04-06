import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { getCosmicDNASummary } from '../../src/engines/unified';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  if (!user) return null;

  const cosmicDNA = user.western && user.vedic && user.chinese
    ? getCosmicDNASummary({
        western: user.western,
        vedic: user.vedic,
        chinese: user.chinese,
        kp: user.kp,
      })
    : '';

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <View style={styles.titleRow}>
          <View style={styles.titleSpacer} />
          <GlowText size="xl" align="center">
            {t('profile.title')}
          </GlowText>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>{'\u2699\uFE0F'}</Text>
          </TouchableOpacity>
        </View>

        {/* Name & Points */}
        <View style={styles.header}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.statsRow}>
            <StatBadge label={t('profile.points')} value={user.cosmicPoints.toString()} emoji={'\u{1F31F}'} />
            <StatBadge label={t('profile.streak')} value={`${user.streak}`} emoji={'\u{1F525}'} />
          </View>
        </View>

        {/* Cosmic DNA */}
        {cosmicDNA && (
          <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
            <Text style={styles.dnaLabel}>{t('profile.cosmicDNA')}</Text>
            <Text style={styles.dnaValue}>{cosmicDNA}</Text>
          </GradientCard>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/share/card')}
          >
            <Text style={styles.actionEmoji}>{'\u{1F4E4}'}</Text>
            <Text style={styles.actionLabel}>Share Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/qr/my-code')}
          >
            <Text style={styles.actionEmoji}>{'\u{1F4F1}'}</Text>
            <Text style={styles.actionLabel}>My QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/qr/scan')}
          >
            <Text style={styles.actionEmoji}>{'\u{1F4F7}'}</Text>
            <Text style={styles.actionLabel}>Scan QR</Text>
          </TouchableOpacity>
        </View>

        {/* Western Profile */}
        {user.western && user.activeSystems.includes('western') && (
          <TouchableOpacity onPress={() => router.push('/reading/western')} activeOpacity={0.8}>
          <GradientCard colors={COLORS.gradientWestern as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u2648'} Western Astrology <Text style={styles.tapHint}>Tap for details {'\u2192'}</Text></Text>
            <ProfileRow label="Sun Sign" value={user.western.sun} />
            <ProfileRow label="Moon Sign" value={user.western.moon} />
            {user.western.rising && <ProfileRow label="Rising Sign" value={user.western.rising} />}
            <ProfileRow label="Element" value={user.western.element} />
            <ProfileRow label="Modality" value={user.western.modality} />
          </GradientCard>
          </TouchableOpacity>
        )}

        {/* Vedic Profile */}
        {user.vedic && user.activeSystems.includes('vedic') && (
          <TouchableOpacity onPress={() => router.push('/reading/vedic')} activeOpacity={0.8}>
          <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u{1F549}\uFE0F'} Vedic Astrology <Text style={styles.tapHint}>Tap for details {'\u2192'}</Text></Text>
            <ProfileRow label="Rashi (Moon Sign)" value={user.vedic.rashi} />
            <ProfileRow label="Nakshatra" value={`${user.vedic.nakshatra} (Pada ${user.vedic.nakshatraPada})`} />
            <ProfileRow label="Current Dasha" value={`${user.vedic.currentDasha.planet} Mahadasha`} />
            {user.vedic.remedies.length > 0 && (
              <View style={styles.remedySection}>
                <Text style={styles.remedyTitle}>{'\u{1F48E}'} Your Cosmic Enhancements</Text>
                {user.vedic.remedies.slice(0, 3).map((r, i) => (
                  <Text key={i} style={styles.remedyText}>
                    {r.type === 'gemstone' ? '\u{1F48E}' : r.type === 'mantra' ? '\u{1F3B5}' : '\u{1F308}'} {r.name}: {r.description}
                  </Text>
                ))}
              </View>
            )}
          </GradientCard>
          </TouchableOpacity>
        )}

        {/* Chinese Profile */}
        {user.chinese && user.activeSystems.includes('chinese') && (
          <TouchableOpacity onPress={() => router.push('/reading/chinese')} activeOpacity={0.8}>
          <GradientCard colors={COLORS.gradientChinese as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u{1F409}'} Chinese Astrology <Text style={styles.tapHint}>Tap for details {'\u2192'}</Text></Text>
            <ProfileRow label="Zodiac Animal" value={user.chinese.animal} />
            <ProfileRow label="Element" value={user.chinese.element} />
            <ProfileRow label="Yin/Yang" value={user.chinese.yinYang} />
            {user.chinese.luckyNumbers.length > 0 && (
              <ProfileRow label="Lucky Numbers" value={user.chinese.luckyNumbers.join(', ')} />
            )}
            {user.chinese.luckyColors.length > 0 && (
              <ProfileRow label="Lucky Colors" value={user.chinese.luckyColors.join(', ')} />
            )}
            {user.chinese.compatibleAnimals.length > 0 && (
              <ProfileRow label="Compatible Animals" value={user.chinese.compatibleAnimals.join(', ')} />
            )}
          </GradientCard>
          </TouchableOpacity>
        )}

        {/* KP Profile */}
        {user.kp && user.activeSystems.includes('kp') && (
          <TouchableOpacity onPress={() => router.push('/reading/kp')} activeOpacity={0.8}>
          <GradientCard colors={COLORS.gradientKP as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u{1F52D}'} KP System <Text style={styles.tapHint}>Tap for details {'\u2192'}</Text></Text>
            <ProfileRow label="Cusps Analyzed" value={`${user.kp.cusps.length}`} />
            <ProfileRow label="Active Significators" value={`${user.kp.significators.length}`} />
            {user.kp.predictions.length > 0 && (
              <View style={styles.predictionsSection}>
                <Text style={styles.predictionsTitle}>Cosmic Insights</Text>
                {user.kp.predictions.slice(0, 3).map((p, i) => (
                  <View key={i} style={styles.predictionItem}>
                    <Text style={styles.predictionArea}>{p.area.toUpperCase()}</Text>
                    <Text style={styles.predictionText}>{p.prediction}</Text>
                    <Text style={styles.predictionSource}>{p.source}</Text>
                  </View>
                ))}
              </View>
            )}
          </GradientCard>
          </TouchableOpacity>
        )}

        {/* Badges */}
        <GradientCard>
          <Text style={styles.systemHeader}>{'\u{1F3C6}'} Cosmic Badges</Text>
          <View style={styles.badgesGrid}>
            {[
              { emoji: '\u{1F31F}', name: 'Star Gazer', earned: user.streak >= 3 },
              { emoji: '\u{1F319}', name: 'Moon Child', earned: user.streak >= 7 },
              { emoji: '\u{1F52D}', name: 'Explorer', earned: user.activeSystems.length >= 4 },
              { emoji: '\u{2728}', name: 'Rising Star', earned: user.cosmicPoints >= 100 },
              { emoji: '\u{1F320}', name: 'Constellation', earned: user.cosmicPoints >= 500 },
              { emoji: '\u{1F30C}', name: 'Galaxy', earned: user.cosmicPoints >= 1000 },
            ].map((badge, i) => (
              <View key={i} style={[styles.badgeItem, !badge.earned && styles.badgeLocked]}>
                <Text style={[styles.badgeEmoji, !badge.earned && styles.badgeEmojiLocked]}>
                  {badge.emoji}
                </Text>
                <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </GradientCard>

        {/* Premium Upsell */}
        {user.subscription.tier === 'free' && (
          <GradientCard>
            <Text style={styles.premiumTitle}>{'\u2728'} {t('profile.premium')}</Text>
            <Text style={styles.premiumDesc}>
              Unlock unlimited compatibility checks, full natal charts, Dasha timelines,
              remedies, premium shareable cards, and more!
            </Text>
            <CosmicButton
              title={t('subscription.trial')}
              onPress={() => {}}
              colors={[COLORS.starGold, COLORS.sunOrange]}
              style={styles.premiumButton}
            />
          </GradientCard>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

function StatBadge({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  spacer: { height: 60 },
  header: { alignItems: 'center', marginBottom: SPACING.sm },
  name: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  statsRow: { flexDirection: 'row', gap: SPACING.lg },
  statBadge: { alignItems: 'center' },
  statEmoji: { fontSize: 24 },
  statValue: { color: COLORS.starGold, fontSize: 20, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  actionEmoji: { fontSize: 24 },
  actionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dnaLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  dnaValue: { color: COLORS.starGold, fontSize: 17, fontWeight: '700' },
  systemHeader: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  profileLabel: { color: COLORS.textSecondary, fontSize: 14 },
  profileValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  remedySection: { marginTop: SPACING.md },
  remedyTitle: { color: COLORS.starGold, fontSize: 14, fontWeight: '600', marginBottom: SPACING.xs },
  remedyText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 4 },
  predictionsSection: { marginTop: SPACING.md },
  predictionsTitle: { color: COLORS.white, fontSize: 14, fontWeight: '600', marginBottom: SPACING.xs },
  predictionItem: { marginBottom: SPACING.sm },
  predictionArea: { color: COLORS.aurora, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  predictionText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  predictionSource: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  tapHint: { color: COLORS.textMuted, fontSize: 11, fontWeight: '400' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  badgeItem: {
    alignItems: 'center', width: '30%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
  },
  badgeLocked: { opacity: 0.35 },
  badgeEmoji: { fontSize: 28 },
  badgeEmojiLocked: { filter: 'grayscale(1)' as any },
  badgeName: { color: COLORS.white, fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  badgeNameLocked: { color: COLORS.textMuted },
  premiumTitle: { color: COLORS.starGold, fontSize: 18, fontWeight: '700', marginBottom: SPACING.xs },
  premiumDesc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: SPACING.md },
  premiumButton: { alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  titleSpacer: { width: 36 },
  settingsBtn: { width: 36, alignItems: 'center' },
  settingsIcon: { fontSize: 24 },
  bottomPad: { height: 20 },
});
