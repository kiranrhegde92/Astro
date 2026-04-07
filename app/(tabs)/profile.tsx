import React, { useMemo, useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { calculateCosmicProfile, getCosmicDNASummary } from '../../src/engines/unified';
import { useAuthStore } from '../../src/store/authStore';
import { useConnectionsStore } from '../../src/store/connectionsStore';
import { useJournalStore } from '../../src/store/journalStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import i18n from '../../src/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese' },
  { code: 'kn', name: 'Kannada' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const logout = useAuthStore((s) => s.logout);
  const clearReadings = useReadingStore((s) => s.clearReadings);
  const clearConnections = useConnectionsStore((s) => s.clearConnections);
  const clearJournal = useJournalStore((s) => s.clearJournal);
  const savedProfiles = useConnectionsStore((s) => s.savedProfiles);
  const entries = useJournalStore((s) => s.entries);
  const archiveCount = useReadingStore((s) => Object.keys(s.cachedReadings).length);

  const setWesternProfile = useUserStore((s) => s.setWesternProfile);
  const setVedicProfile = useUserStore((s) => s.setVedicProfile);
  const setChineseProfile = useUserStore((s) => s.setChineseProfile);
  const setKPProfile = useUserStore((s) => s.setKPProfile);

  const [currentLang, setCurrentLang] = useState(i18n.language?.split('-')[0] ?? 'en');
  const [recalculating, setRecalculating] = useState(false);

  const cosmicDNA = useMemo(() => {
    if (!user?.western || !user?.vedic || !user?.chinese) return '';
    return getCosmicDNASummary({ western: user.western, vedic: user.vedic, chinese: user.chinese, kp: user.kp });
  }, [user?.western, user?.vedic, user?.chinese, user?.kp]);

  if (!user) return null;

  const birthDate = new Date(user.birthDetails.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const handleLanguage = (code: string) => {
    setCurrentLang(code);
    i18n.changeLanguage(code);
  };

  const handleRecalculate = async () => {
    const bd = user.birthDetails as any;
    const rawDate = bd.date;
    const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
    const birthTime: string | undefined = bd.birthTimeStr ?? bd.time ?? undefined;

    setRecalculating(true);
    try {
      // Try cloud function first
      const { calculateUserChart } = await import('../../src/services/functionsService');
      const birthDateStr = bd.birthDateStr ?? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const birthTimeStr = birthTime ?? '12:00';
      const birthPlace = bd.birthPlace ?? bd.place?.name ?? 'Unknown';

      try {
        const result = await calculateUserChart({ birthDate: birthDateStr, birthTime: birthTimeStr, birthPlace });
        const c = result.chart;
        if (c.western) setWesternProfile({ sun: c.western.sun, moon: c.western.moon, rising: c.western.rising, element: c.western.dominantElement, modality: c.western.dominantModality, planets: [], houses: c.western.houses });
        if (c.vedic) setVedicProfile({ rashi: c.vedic.rashi, nakshatra: c.vedic.nakshatra, nakshatraPada: c.vedic.nakshatraPada, moonSign: c.vedic.rashi, dashas: [], currentDasha: { planet: c.vedic.currentDasha?.planet, startDate: new Date(c.vedic.currentDasha?.startDate), endDate: new Date(c.vedic.currentDasha?.endDate) }, remedies: [] });
        if (c.chinese) setChineseProfile({ animal: c.chinese.animal, element: c.chinese.element, yinYang: c.chinese.yinYang, pillars: undefined, luckyNumbers: [], luckyColors: c.chinese.luckyColors, compatibleAnimals: [], incompatibleAnimals: [] });
        Alert.alert('Chart updated', `Rashi: ${c.vedic?.rashi ?? '—'}  ·  Nakshatra: ${c.vedic?.nakshatra ?? '—'}`);
        return;
      } catch {
        // Cloud failed — fall through to local
      }

      // Local engine fallback (uses birth time for accurate Rashi)
      const local = calculateCosmicProfile(new Date(d.getFullYear(), d.getMonth(), d.getDate()), birthTime);
      if (local.western) setWesternProfile(local.western);
      if (local.vedic)   setVedicProfile(local.vedic);
      if (local.chinese) setChineseProfile(local.chinese);
      if (local.kp)      setKPProfile(local.kp);
      Alert.alert('Chart recalculated', `Rashi: ${local.vedic?.rashi ?? '—'}  ·  Nakshatra: ${local.vedic?.nakshatra ?? '—'}`);
    } catch (err) {
      Alert.alert('Recalculation failed', 'Could not recalculate your chart. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'This signs you out and clears the local chart on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out', style: 'destructive',
          onPress: async () => {
            await Promise.all([logout(), clearUser(), clearReadings(), clearConnections(), clearJournal()]);
            router.dismissAll();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <AnimatedCard index={0}>
          <View style={styles.posterWrap}>
            <LinearGradient colors={COLORS.gradientInk} style={styles.poster}>
              <Text style={styles.posterLabel}>Your chart</Text>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.birthMeta}>
                {birthDate}
                {user.birthDetails.place?.name ? `  ·  ${user.birthDetails.place.name}` : ''}
              </Text>
              {user.birthDetails.time ? (
                <Text style={styles.birthMeta}>{user.birthDetails.time}</Text>
              ) : null}
            </LinearGradient>
            <View style={styles.posterOrb}>
              <CosmicOrb size={152} />
            </View>
          </View>
        </AnimatedCard>

        {/* ── Cosmic DNA ────────────────────────────────────────────────── */}
        {cosmicDNA ? (
          <AnimatedCard index={1}>
            <LinearGradient colors={COLORS.gradientInkSoft} style={styles.card}>
              <Text style={styles.sectionLabel}>Cosmic DNA</Text>
              <Text style={styles.dnaText}>{cosmicDNA}</Text>
              <View style={styles.divider} />
              <View style={styles.row3}>
                {[
                  { label: 'Sun', value: user.western?.sun },
                  { label: 'Rashi', value: user.vedic?.rashi },
                  { label: 'Animal', value: user.chinese?.animal },
                ].map((chip) => (
                  <View key={chip.label} style={styles.chip}>
                    <Text style={styles.chipLabel}>{chip.label}</Text>
                    <Text style={styles.chipValue}>{chip.value ?? '—'}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </AnimatedCard>
        ) : null}

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <AnimatedCard index={2}>
          <LinearGradient colors={COLORS.gradientInkSoft} style={styles.card}>
            <Text style={styles.sectionLabel}>Activity</Text>
            <View style={styles.row3}>
              {[
                { value: String(user.streak), label: 'Day streak' },
                { value: String(user.cosmicPoints), label: 'Points' },
                { value: String(entries.length), label: 'Journal notes' },
              ].map((m) => (
                <View key={m.label} style={styles.chip}>
                  <Text style={styles.chipValue}>{m.value}</Text>
                  <Text style={styles.chipLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.row3}>
              {[
                { value: String(savedProfiles.length), label: 'Connections' },
                { value: String(archiveCount), label: 'Archive days' },
                { value: user.subscription.tier, label: 'Plan' },
              ].map((m) => (
                <View key={m.label} style={styles.chip}>
                  <Text style={[styles.chipValue, { textTransform: 'capitalize' }]}>{m.value}</Text>
                  <Text style={styles.chipLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </AnimatedCard>

        {/* ── Quick links ───────────────────────────────────────────────── */}
        <AnimatedCard index={3}>
          <GradientCard style={styles.card} colors={COLORS.gradientSilver}>
            <Text style={styles.sectionLabel}>Navigate</Text>
            {[
              { label: 'Compatibility', icon: 'people-outline' as const, path: '/(tabs)/compatibility' as const },
              { label: 'Journal & Cosmos', icon: 'book-outline' as const, path: '/(tabs)/cosmos' as const },
              { label: 'Share card', icon: 'share-social-outline' as const, path: '/share/card' as const },
              { label: 'My QR code', icon: 'qr-code-outline' as const, path: '/qr/my-code' as const },
              { label: 'Notifications & more', icon: 'notifications-outline' as const, path: '/settings' as const },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.linkRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => router.push(item.path)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={20} color={COLORS.textSecondary} />
                <Text style={styles.linkLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </GradientCard>
        </AnimatedCard>

        {/* ── Language ──────────────────────────────────────────────────── */}
        <AnimatedCard index={4}>
          <GradientCard style={styles.card} colors={COLORS.gradientSilver}>
            <Text style={styles.sectionLabel}>Language</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => {
                const active = currentLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langChip, active && styles.langChipActive]}
                    onPress={() => handleLanguage(lang.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langText, active && styles.langTextActive]}>{lang.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GradientCard>
        </AnimatedCard>

        {/* ── Recalculate ───────────────────────────────────────────────── */}
        <AnimatedCard index={5}>
          <TouchableOpacity style={styles.recalcBtn} onPress={handleRecalculate} activeOpacity={0.8} disabled={recalculating}>
            {recalculating
              ? <ActivityIndicator size="small" color={COLORS.vedic} />
              : <Ionicons name="refresh-outline" size={20} color={COLORS.vedic} />
            }
            <Text style={styles.recalcText}>{recalculating ? 'Recalculating…' : 'Recalculate my chart'}</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* ── Logout ────────────────────────────────────────────────────── */}
        <AnimatedCard index={6}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.coral} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
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
  posterWrap: { position: 'relative', minHeight: 200 },
  poster: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    minHeight: 180,
    overflow: 'hidden',
    gap: 4,
  },
  posterOrb: { position: 'absolute', right: -2, top: 24 },
  posterLabel: {
    color: 'rgba(255,250,241,0.62)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  name: {
    color: '#fffaf1',
    fontSize: 38,
    lineHeight: 44,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
    maxWidth: 200,
  },
  birthMeta: {
    color: 'rgba(255,250,241,0.78)',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 200,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.ruleLight,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.deep,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  dnaText: {
    color: '#fffaf1',
    fontSize: 22,
    lineHeight: 30,
    fontFamily: FONTS.heading,
  },
  divider: { height: 1, backgroundColor: COLORS.ruleLight },
  row3: { flexDirection: 'row', gap: SPACING.sm },
  chip: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  chipLabel: {
    color: 'rgba(255,250,241,0.55)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
  },
  chipValue: {
    color: '#fffaf1',
    fontSize: 15,
    fontFamily: FONTS.heading,
    textTransform: 'capitalize',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  linkLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.heading,
  },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  langChip: {
    minWidth: '47%',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 13,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  langChipActive: {
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.bgMuted,
  },
  langText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  langTextActive: { color: COLORS.textPrimary },
  recalcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: `${COLORS.vedic}44`,
    backgroundColor: `${COLORS.vedic}10`,
  },
  recalcText: {
    color: COLORS.vedic,
    fontSize: 17,
    fontFamily: FONTS.heading,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: `${COLORS.coral}44`,
    backgroundColor: `${COLORS.coral}10`,
  },
  logoutText: {
    color: COLORS.coral,
    fontSize: 17,
    fontFamily: FONTS.heading,
  },
});
