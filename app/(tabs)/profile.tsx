import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { getCosmicDNASummary } from '../../src/engines/unified';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.78;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  const cosmicDNA = user.western && user.vedic && user.chinese
    ? getCosmicDNASummary({ western: user.western, vedic: user.vedic, chinese: user.chinese, kp: user.kp })
    : '';

  const pointsProgress = Math.min(user.cosmicPoints / 1000, 1);
  const streakProgress = Math.min(user.streak / 30, 1);

  const quickActions = [
    { icon: 'share-outline' as const,    label: 'Share',    onPress: () => router.push('/share/card') },
    { icon: 'qr-code-outline' as const,  label: 'My QR',   onPress: () => router.push('/qr/my-code') },
    { icon: 'camera-outline' as const,   label: 'Scan',    onPress: () => router.push('/qr/scan') },
    { icon: 'settings-outline' as const, label: 'Settings',onPress: () => router.push('/settings') },
  ];

  const SYSTEMS = [
    user.western && user.activeSystems.includes('western') && {
      key: 'western',
      icon: 'planet-outline' as const,
      title: 'Western Astrology',
      gradient: COLORS.gradientWestern,
      color: COLORS.western,
      route: '/reading/western',
      rows: [
        ['Sun Sign', user.western.sun],
        ['Moon Sign', user.western.moon],
        user.western.rising ? ['Rising', user.western.rising] : null,
        ['Element', user.western.element],
      ].filter(Boolean) as [string, string][],
    },
    user.vedic && user.activeSystems.includes('vedic') && {
      key: 'vedic',
      icon: 'flame-outline' as const,
      title: 'Vedic Astrology',
      gradient: COLORS.gradientVedic,
      color: COLORS.vedic,
      route: '/reading/vedic',
      rows: [
        ['Rashi', user.vedic.rashi],
        ['Nakshatra', `${user.vedic.nakshatra} (Pada ${user.vedic.nakshatraPada})`],
        ['Dasha', `${user.vedic.currentDasha.planet} Mahadasha`],
      ],
    },
    user.chinese && user.activeSystems.includes('chinese') && {
      key: 'chinese',
      icon: 'navigate-outline' as const,
      title: 'Chinese Astrology',
      gradient: COLORS.gradientChinese,
      color: COLORS.chinese,
      route: '/reading/chinese',
      rows: [
        ['Animal', user.chinese.animal],
        ['Element', user.chinese.element],
        ['Yin/Yang', user.chinese.yinYang],
      ],
    },
    user.kp && user.activeSystems.includes('kp') && {
      key: 'kp',
      icon: 'telescope-outline' as const,
      title: 'KP System',
      gradient: COLORS.gradientKP,
      color: COLORS.kp,
      route: '/reading/kp',
      rows: [
        ['Cusps', `${user.kp.cusps.length} analyzed`],
        ['Significators', `${user.kp.significators.length} active`],
      ],
    },
  ].filter(Boolean) as Array<{
    key: string; icon: any; title: string;
    gradient: readonly string[]; color: string; route: string; rows: [string, string][];
  }>;

  const badges = [
    { icon: 'star-outline' as const,        name: 'Star Gazer',    earned: user.streak >= 3,             color: COLORS.gold },
    { icon: 'moon-outline' as const,         name: 'Moon Child',    earned: user.streak >= 7,             color: COLORS.silver },
    { icon: 'telescope-outline' as const,    name: 'Explorer',      earned: user.activeSystems.length>=4,  color: COLORS.western },
    { icon: 'sparkles-outline' as const,     name: 'Rising Star',   earned: user.cosmicPoints >= 100,     color: COLORS.vedic },
    { icon: 'planet-outline' as const,       name: 'Constellation', earned: user.cosmicPoints >= 500,     color: COLORS.kp },
    { icon: 'infinite-outline' as const,     name: 'Galaxy',        earned: user.cosmicPoints >= 1000,    color: COLORS.chinese },
  ];

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <CosmicOrb size={100} primaryColor={COLORS.western} secondaryColor={COLORS.kp} />
          <Text style={styles.nameLabel}>COSMIC PROFILE</Text>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.ringsRow}>
            <View style={styles.ringWrap}>
              <ProgressRing progress={pointsProgress} size={66} strokeWidth={4}
                color={COLORS.gold} value={`${user.cosmicPoints}`} label="POINTS" />
            </View>
            <View style={styles.ringDivider} />
            <View style={styles.ringWrap}>
              <ProgressRing progress={streakProgress} size={66} strokeWidth={4}
                color={COLORS.vedic} value={`${user.streak}`} label="STREAK" />
            </View>
          </View>
        </View>

        {/* ── Cosmic DNA ── */}
        {cosmicDNA !== '' && (
          <GradientCard accentColor={COLORS.gold}>
            <Text style={styles.dnaLabel}>MY COSMIC DNA</Text>
            <Text style={styles.dnaValue}>{cosmicDNA}</Text>
          </GradientCard>
        )}

        {/* ── Quick Actions ── */}
        <View style={styles.actionsRow}>
          {quickActions.map((a, i) => (
            <AnimatedPressable key={i} onPress={a.onPress} style={styles.actionItem}>
              <View style={styles.actionCircle}>
                <Ionicons name={a.icon} size={20} color="rgba(255,255,255,0.75)" />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </AnimatedPressable>
          ))}
        </View>

        {/* ── System Profiles ── */}
        <Text style={styles.sectionTitle}>YOUR PROFILES</Text>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
          snapToInterval={CARD_W + SPACING.md}
          decelerationRate="fast"
        >
          {SYSTEMS.map((sys) => (
            <AnimatedPressable key={sys.key} onPress={() => router.push(sys.route as any)} style={{ width: CARD_W }}>
              <View style={[styles.profileCardShadow, { shadowColor: sys.color }]}>
                <LinearGradient
                  colors={sys.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profileCard}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
                    pointerEvents="none"
                  />
                  <View style={styles.profileHeader}>
                    <Ionicons name={sys.icon} size={26} color="rgba(255,255,255,0.90)" />
                    <Text style={styles.profileTitle}>{sys.title}</Text>
                  </View>
                  {sys.rows.map(([label, value], j) => (
                    <View key={j} style={styles.profileRow}>
                      <Text style={styles.profileLabel}>{label}</Text>
                      <Text style={styles.profileValue}>{value}</Text>
                    </View>
                  ))}
                  <View style={styles.profileReadMoreRow}>
                    <Text style={styles.profileReadMore}>View details</Text>
                    <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.45)" />
                  </View>
                </LinearGradient>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>

        {/* ── Badges ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>COSMIC BADGES</Text>
          <Text style={styles.sectionSub}>{badges.filter(b => b.earned).length}/{badges.length} earned</Text>
        </View>
        <GradientCard>
          <View style={styles.badgeGrid}>
            {badges.map((b, i) => (
              <View key={i} style={[styles.badge, !b.earned && styles.badgeLocked]}>
                <Ionicons name={b.icon} size={26} color={b.earned ? b.color : 'rgba(255,255,255,0.22)'} />
                <Text style={[styles.badgeName, !b.earned && styles.badgeNameLocked]}>{b.name}</Text>
                {!b.earned && <Ionicons name="lock-closed" size={10} color="rgba(255,255,255,0.22)" />}
              </View>
            ))}
          </View>
        </GradientCard>

        {/* ── Premium ── */}
        {user.subscription.tier === 'free' && (
          <AnimatedPressable onPress={() => router.push('/subscription')}>
            <View style={styles.premiumShadow}>
              <LinearGradient
                colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumCard}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
                  pointerEvents="none"
                />
                <Ionicons name="star" size={26} color={COLORS.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumTitle}>Unlock Premium</Text>
                  <Text style={styles.premiumSub}>Full charts, compatibility & remedies</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.40)" />
              </LinearGradient>
            </View>
          </AnimatedPressable>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: 58, gap: SPACING.lg },

  hero: { alignItems: 'center', gap: SPACING.sm },
  nameLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 2.5,
    marginTop: 4,
  },
  name: {
    fontFamily: 'Cinzel_900Black',
    fontSize: 26,
    color: COLORS.white,
    textShadowColor: 'rgba(255,255,255,0.15)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
    letterSpacing: 2,
  },
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.xs,
  },
  ringWrap: { alignItems: 'center' },
  ringDivider: {
    width: 1, height: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  dnaLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 2,
    marginBottom: 4,
  },
  dnaValue: {
    color: COLORS.gold,
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 0.5,
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionSub: { color: COLORS.textMuted, fontSize: 11 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionItem: { alignItems: 'center', gap: 5 },
  actionCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { color: COLORS.textSecondary, fontSize: 11, fontFamily: 'Cinzel_400Regular', letterSpacing: 0.5 },

  sectionTitle: {
    fontFamily: 'Cinzel_400Regular',
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 2.5,
  },
  hScroll: { gap: SPACING.md, paddingRight: SPACING.lg },

  profileCardShadow: {
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 16,
  },
  profileCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: 2,
    overflow: 'hidden',
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  profileTitle: { color: '#fff', fontSize: 15, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.3 },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  profileLabel: { color: 'rgba(255,255,255,0.50)', fontSize: 12 },
  profileValue: { color: '#fff', fontSize: 12, fontWeight: '700' },
  profileReadMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  profileReadMore: { color: 'rgba(255,255,255,0.40)', fontSize: 11 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  badge: {
    alignItems: 'center',
    width: '28%' as any,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  badgeLocked: { opacity: 0.30 },
  badgeName: { color: COLORS.white, fontSize: 11, fontFamily: 'Cinzel_400Regular', textAlign: 'center', letterSpacing: 0.3 },
  badgeNameLocked: { color: COLORS.textMuted },

  premiumShadow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  premiumTitle: { color: '#fff', fontSize: 15, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.3 },
  premiumSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
});
