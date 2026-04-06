import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { getCosmicDNASummary } from '../../src/engines/unified';

export default function ProfileScreen() {
  const { t } = useTranslation();
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

        <GlowText size="xl" align="center">
          {t('profile.title')}
        </GlowText>

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

        {/* Western Profile */}
        {user.western && user.activeSystems.includes('western') && (
          <GradientCard colors={COLORS.gradientWestern as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u2648'} Western Astrology</Text>
            <ProfileRow label="Sun Sign" value={user.western.sun} />
            <ProfileRow label="Moon Sign" value={user.western.moon} />
            {user.western.rising && <ProfileRow label="Rising Sign" value={user.western.rising} />}
            <ProfileRow label="Element" value={user.western.element} />
            <ProfileRow label="Modality" value={user.western.modality} />
          </GradientCard>
        )}

        {/* Vedic Profile */}
        {user.vedic && user.activeSystems.includes('vedic') && (
          <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u{1F549}\uFE0F'} Vedic Astrology</Text>
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
        )}

        {/* Chinese Profile */}
        {user.chinese && user.activeSystems.includes('chinese') && (
          <GradientCard colors={COLORS.gradientChinese as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u{1F409}'} Chinese Astrology</Text>
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
        )}

        {/* KP Profile */}
        {user.kp && user.activeSystems.includes('kp') && (
          <GradientCard colors={COLORS.gradientKP as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>{'\u{1F52D}'} KP System</Text>
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
        )}

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
  premiumTitle: { color: COLORS.starGold, fontSize: 18, fontWeight: '700', marginBottom: SPACING.xs },
  premiumDesc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: SPACING.md },
  premiumButton: { alignSelf: 'center' },
  bottomPad: { height: 20 },
});
