import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { SectionLabel } from '../../src/components/ui/SectionLabel';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { NatalWheel } from '../../src/components/chart/NatalWheel';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  SHADOWS,
  SPACING,
  TYPE,
} from '../../src/constants/theme';
import { getEarnedBadges, getNextBadge } from '../../src/constants/badges';
import { calculateCosmicProfile, getCosmicDNASummary } from '../../src/engines/unified';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { useConnectionsStore } from '../../src/store/connectionsStore';
import { useJournalStore } from '../../src/store/journalStore';
import { useManagedProfilesStore } from '../../src/store/managedProfilesStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { exportMyPredictionDataset } from '../../src/services/functionsService';
import i18n from '../../src/i18n';
import { buildProfilesFromServerChart } from '../../src/utils/serverChartAdapter';
import { LANGUAGE_OPTIONS, normalizeLanguage } from '../../src/i18n/language';

export default function ProfileScreen() {
  const router = useRouter();
  const accountUser = useUserStore((s) => s.user);
  const user = useActiveProfile();
  const managedProfiles = useManagedProfilesStore((s) => s.managedProfiles);
  const updateManagedProfile = useManagedProfilesStore((s) => s.updateManagedProfile);
  const savedProfiles = useConnectionsStore((s) => s.savedProfiles);
  const compatibilityHistory = useConnectionsStore((s) => s.compatibilityHistory);
  const entries = useJournalStore((s) => s.entries);
  const archiveCount = useReadingStore((s) => Object.keys(s.cachedReadings).length);

  const setWesternProfile = useUserStore((s) => s.setWesternProfile);
  const setVedicProfile = useUserStore((s) => s.setVedicProfile);
  const setChineseProfile = useUserStore((s) => s.setChineseProfile);
  const setKPProfile = useUserStore((s) => s.setKPProfile);

  const { showAlert, alertModal } = useCosmicAlert();
  const setLanguage = useUserStore((s) => s.setLanguage);
  const setUser = useUserStore((s) => s.setUser);

  const [currentLang, setCurrentLang] = useState(normalizeLanguage(user?.language ?? i18n.language));
  const [recalculating, setRecalculating] = useState(false);
  const [exportingDataset, setExportingDataset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);

  useEffect(() => {
    setCurrentLang(normalizeLanguage(user?.language ?? i18n.language));
  }, [user?.language]);

  const cosmicDNA = useMemo(() => {
    if (!user?.western || !user?.vedic || !user?.chinese) return '';
    return getCosmicDNASummary({
      western: user.western,
      vedic: user.vedic,
      chinese: user.chinese,
      kp: user.kp,
    });
  }, [user?.western, user?.vedic, user?.chinese, user?.kp]);

  const earnedBadges = useMemo(() => {
    if (!accountUser) return [];
    return getEarnedBadges(
      accountUser.streak,
      accountUser.cosmicPoints,
      accountUser.activeSystems,
      compatibilityHistory.length,
      false,
    );
  }, [accountUser?.streak, accountUser?.cosmicPoints, accountUser?.activeSystems, compatibilityHistory.length]);

  const nextBadge = useMemo(() => {
    if (!accountUser) return null;
    return getNextBadge(accountUser.streak, accountUser.cosmicPoints);
  }, [accountUser?.streak, accountUser?.cosmicPoints]);

  const streakProgress = useMemo(() => {
    if (!accountUser) return 0;
    const targets = [3, 7, 14, 30, 90, 365];
    const next = targets.find((tg) => tg > accountUser.streak) ?? 365;
    return Math.min(accountUser.streak / next, 1);
  }, [accountUser?.streak]);

  const handleCommitName = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && user && accountUser) {
      if (user.isManagedProfile && user.managedProfileId) {
        void updateManagedProfile(user.managedProfileId, { name: trimmed });
      } else {
        setUser({ ...accountUser, name: trimmed });
      }
    }
    setEditingName(false);
  }, [editName, user, accountUser, setUser, updateManagedProfile]);

  const handleLanguage = (code: string) => {
    const normalized = normalizeLanguage(code);
    setCurrentLang(normalized);
    i18n.changeLanguage(normalized);
    setLanguage(normalized);
  };

  const handleRecalculate = async () => {
    if (!user) return;
    const bd = user.birthDetails as any;
    const rawDate = bd.date;
    const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
    const birthTime: string | undefined = bd.birthTimeStr ?? bd.time ?? undefined;

    setRecalculating(true);
    try {
      if (user.isManagedProfile && user.managedProfileId) {
        const local = calculateCosmicProfile(
          new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          birthTime,
          bd.place?.lat,
          bd.place?.lng,
        );
        await updateManagedProfile(user.managedProfileId, {
          activeSystems: user.activeSystems,
          profile: local,
          cosmicDNA: getCosmicDNASummary(local),
        });
        showAlert('Chart recalculated', `Updated ${user.name}'s local profile.`);
        return;
      }

      const { calculateUserChart } = await import('../../src/services/functionsService');
      const birthDateStr =
        bd.birthDateStr ??
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const birthTimeStr = birthTime ?? '12:00';
      const birthPlace = bd.birthPlace ?? bd.place?.name ?? 'Unknown';

      try {
        const result = await calculateUserChart({
          birthDate: birthDateStr,
          birthTime: birthTimeStr,
          birthPlace,
        });
        const c = result.chart;
        const mapped = buildProfilesFromServerChart(c);
        if (mapped.western) setWesternProfile(mapped.western);
        if (mapped.vedic) setVedicProfile(mapped.vedic);
        if (mapped.chinese) setChineseProfile(mapped.chinese);
        if (mapped.kp) setKPProfile(mapped.kp);
        showAlert('Chart updated', `Rashi: ${c.vedic?.rashi ?? '-'} · Nakshatra: ${c.vedic?.nakshatra ?? '-'}`);
        return;
      } catch {
        // fall through to local
      }

      const local = calculateCosmicProfile(
        new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        birthTime,
        bd.place?.lat,
        bd.place?.lng,
      );
      if (local.western) setWesternProfile(local.western);
      if (local.vedic) setVedicProfile(local.vedic);
      if (local.chinese) setChineseProfile(local.chinese);
      if (local.kp) setKPProfile(local.kp);
      showAlert('Chart recalculated', `Rashi: ${local.vedic?.rashi ?? '-'} · Nakshatra: ${local.vedic?.nakshatra ?? '-'}`);
    } catch {
      showAlert('Recalculation failed', 'Could not recalculate your chart. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleExportDataset = async () => {
    setExportingDataset(true);
    try {
      const result = await exportMyPredictionDataset(250);
      showAlert(
        'Dataset summary',
        `Runs: ${result.summary.totalRuns}\nLabeled: ${result.summary.labeledRuns}\nLabel rate: ${Math.round(
          result.summary.labelRate * 100,
        )}%`,
      );
    } catch {
      showAlert('Export failed', 'Could not load your prediction dataset summary right now.');
    } finally {
      setExportingDataset(false);
    }
  };

  if (!user || !accountUser) return null;

  const birthDate = new Date(user.birthDetails.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <StarField>
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Identity ─────────────────────────────────────────── */}
        <AnimatedCard index={0}>
          <View style={styles.posterWrap}>
            <LinearGradient colors={COLORS.gradientInk} style={styles.poster}>
              <View style={styles.posterTopHighlight} pointerEvents="none" />
              <SectionLabel accent={COLORS.gold}>Your chart</SectionLabel>
              {user.isManagedProfile ? (
                <Pressable
                  onPress={() => router.push('/profile/family-profiles')}
                  style={({ pressed }) => [styles.profileModePill, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Viewing family profile, change"
                >
                  <Ionicons name="people-outline" size={12} color="rgba(255,250,241,0.8)" />
                  <Text style={styles.profileModeText}>Viewing family profile</Text>
                </Pressable>
              ) : null}

              {editingName ? (
                <View style={styles.editNameRow}>
                  <TextInput
                    style={styles.editNameInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                    placeholderTextColor="rgba(255,250,241,0.4)"
                    selectionColor={COLORS.gold}
                    onSubmitEditing={handleCommitName}
                    accessibilityLabel="Edit display name"
                  />
                  <Pressable
                    onPress={handleCommitName}
                    accessibilityRole="button"
                    accessibilityLabel="Save name"
                    style={({ pressed }) => pressed && { opacity: 0.85 }}
                  >
                    <Ionicons name="checkmark-circle" size={32} color={COLORS.gold} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setEditName(user.name);
                    setEditingName(true);
                  }}
                  style={({ pressed }) => [styles.nameRow, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Name: ${user.name}. Tap to edit.`}
                >
                  <Text style={styles.name} numberOfLines={2}>
                    {user.name}
                  </Text>
                  <Ionicons name="pencil-outline" size={16} color="rgba(255,250,241,0.5)" />
                </Pressable>
              )}

              <Text style={styles.birthMeta}>
                {birthDate}
                {user.birthDetails.place?.name ? `  ·  ${user.birthDetails.place.name}` : ''}
              </Text>
              {user.birthDetails.time ? (
                <Text style={styles.birthMeta}>{user.birthDetails.time}</Text>
              ) : null}

              <Pressable
                onPress={handleRecalculate}
                disabled={recalculating}
                style={({ pressed }) => [styles.recalcInline, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Recalculate chart"
              >
                {recalculating ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : (
                  <Ionicons name="refresh-outline" size={14} color={COLORS.gold} />
                )}
                <Text style={styles.recalcInlineText}>
                  {recalculating ? 'Recalculating…' : 'Recalculate chart'}
                </Text>
              </Pressable>
            </LinearGradient>

            <View style={styles.posterOrb}>
              {user.western?.planets?.length ? (
                <NatalWheel planets={user.western.planets} size={152} showAspects={false} />
              ) : (
                <CosmicOrb size={152} />
              )}
            </View>
          </View>
        </AnimatedCard>

        {cosmicDNA ? (
          <AnimatedCard index={1}>
            <GlassCard accentColor={COLORS.gold}>
              <SectionLabel accent={COLORS.gold}>Cosmic DNA</SectionLabel>
              <Text style={styles.dnaText}>{cosmicDNA}</Text>
              <View style={styles.dnaChipRow}>
                {[
                  { label: 'Sun', value: user.western?.sun },
                  { label: 'Rashi', value: user.vedic?.rashi },
                  { label: 'Animal', value: user.chinese?.animal },
                ].map((chip) => (
                  <View key={chip.label} style={styles.dnaChip}>
                    <Text style={styles.dnaChipLabel}>{chip.label.toUpperCase()}</Text>
                    <Text style={styles.dnaChipValue}>{chip.value ?? '—'}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </AnimatedCard>
        ) : null}

        {/* ── Stats & Achievements ───────────────────────────── */}
        <AnimatedCard index={2}>
          <GlassCard elevated accentColor={COLORS.starGold}>
            <View style={styles.sectionHead}>
              <SectionLabel accent={COLORS.starGold}>Achievements</SectionLabel>
              <Text style={styles.achieveCount}>
                {earnedBadges.length} earned
              </Text>
            </View>

            <View style={styles.badgeStreakRow}>
              <ProgressRing
                progress={streakProgress}
                size={78}
                strokeWidth={5}
                color={COLORS.starGold}
                value={`${accountUser.streak}`}
                label="Streak"
              />
              <View style={styles.badgeGrid}>
                {earnedBadges.length === 0 ? (
                  <Text style={styles.noBadgesText}>
                    Keep checking in daily to unlock badges.
                  </Text>
                ) : (
                  earnedBadges.slice(0, 4).map((badge) => (
                    <View key={badge.id} style={styles.badgeChip}>
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                      <Text style={styles.badgeName} numberOfLines={1}>
                        {badge.name}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {nextBadge ? (
              <View style={styles.nextBadgeRow}>
                <Text style={styles.nextBadgeLabel}>NEXT GOAL</Text>
                <Text style={styles.nextBadgeText}>
                  {nextBadge.emoji} {nextBadge.name} — {nextBadge.requirement}
                </Text>
              </View>
            ) : null}
          </GlassCard>
        </AnimatedCard>

        <AnimatedCard index={3}>
          <View style={styles.statsGrid}>
            <StatCell value={String(accountUser.cosmicPoints)} label="Points" />
            <StatCell
              value={String(entries.length)}
              label="Journal"
              onPress={() => router.push('/journal')}
            />
            <StatCell value={String(archiveCount)} label="Archive" />
            <StatCell value={String(savedProfiles.length)} label="Connections" />
          </View>
        </AnimatedCard>

        {/* ── Tools ───────────────────────────────────────────── */}
        <AnimatedCard index={4}>
          <View style={styles.toolsHead}>
            <SectionLabel>Tools</SectionLabel>
          </View>
          <View style={styles.toolsList}>
            <ToolRow
              icon="people-outline"
              label="Family profiles"
              meta={`${managedProfiles.length + 1}/5`}
              onPress={() => router.push('/profile/family-profiles')}
            />
            <ToolRow
              icon="star-outline"
              label="Subscription"
              meta={accountUser.subscription.tier === 'premium' ? 'Premium' : 'Free'}
              accent={accountUser.subscription.tier === 'premium' ? COLORS.gold : undefined}
              onPress={() => router.push('/subscription')}
            />
            <ToolRow
              icon="language-outline"
              label="Language"
              meta={
                LANGUAGE_OPTIONS.find((l) => l.code === currentLang)?.nativeName ?? 'English'
              }
              onPress={() => setShowLanguages((v) => !v)}
              expanded={showLanguages}
            />
            {showLanguages ? (
              <GlassCard>
                <View style={styles.langGrid}>
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const active = currentLang === lang.code;
                    return (
                      <Pressable
                        key={lang.code}
                        onPress={() => handleLanguage(lang.code)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={lang.nativeName}
                        style={({ pressed }) => [
                          styles.langChip,
                          active && styles.langChipActive,
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text style={[styles.langText, active && styles.langTextActive]}>
                          {lang.nativeName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>
            ) : null}
            <ToolRow
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push('/settings')}
            />
            <ToolRow
              icon="analytics-outline"
              label="AI dataset summary"
              loading={exportingDataset}
              onPress={handleExportDataset}
            />
          </View>
        </AnimatedCard>

        <View style={{ height: 40 }} />
      </ResetScrollView>
      {alertModal}
    </StarField>
  );
}

function StatCell({
  value,
  label,
  onPress,
}: {
  value: string;
  label: string;
  onPress?: () => void;
}) {
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${label}: ${value}` : undefined}
      style={({ pressed }: { pressed: boolean }) => [
        styles.statCell,
        onPress && pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
    </Wrap>
  );
}

function ToolRow({
  icon,
  label,
  meta,
  accent,
  onPress,
  loading,
  expanded,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  meta?: string;
  accent?: string;
  onPress: () => void;
  loading?: boolean;
  expanded?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${label}, ${meta}` : label}
      style={({ pressed }) => [styles.toolRow, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.toolIconWrap, accent ? { borderColor: `${accent}55`, backgroundColor: `${accent}14` } : null]}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.gold} />
        ) : (
          <Ionicons name={icon} size={18} color={accent ?? COLORS.textPrimary} />
        )}
      </View>
      <Text style={styles.toolLabel}>{label}</Text>
      {meta ? (
        <Text style={[styles.toolMeta, accent ? { color: accent } : null]}>{meta}</Text>
      ) : null}
      <Ionicons
        name={expanded ? 'chevron-down' : 'chevron-forward'}
        size={16}
        color={COLORS.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  posterWrap: {
    position: 'relative',
    minHeight: 220,
  },
  poster: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    minHeight: 220,
    overflow: 'hidden',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    ...SHADOWS.deep,
  },
  posterTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  posterOrb: {
    position: 'absolute',
    right: -2,
    top: 28,
  },
  profileModePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,250,241,0.22)',
    backgroundColor: 'rgba(255,250,241,0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: SPACING.xs,
  },
  profileModeText: {
    color: 'rgba(255,250,241,0.78)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    color: '#fff8ea',
    ...TYPE.hero,
    fontFamily: FONTS.display,
    maxWidth: 210,
  },
  birthMeta: {
    color: 'rgba(255,248,234,0.78)',
    ...TYPE.caption,
    fontFamily: FONTS.body,
    maxWidth: 210,
  },
  recalcInline: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.gold}55`,
    backgroundColor: `${COLORS.gold}14`,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  recalcInlineText: {
    color: COLORS.gold,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editNameInput: {
    flex: 1,
    color: '#fff8ea',
    fontSize: 34,
    fontFamily: FONTS.display,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241,183,79,0.6)',
    paddingVertical: 4,
    maxWidth: 210,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achieveCount: {
    color: COLORS.gold,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  dnaText: {
    color: COLORS.textPrimary,
    ...TYPE.heading,
    fontFamily: FONTS.heading,
    lineHeight: 30,
  },
  dnaChipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  dnaChip: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
    alignItems: 'center',
  },
  dnaChipLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  dnaChipValue: {
    color: COLORS.textPrimary,
    ...TYPE.subhead,
    fontFamily: FONTS.heading,
    textTransform: 'capitalize',
  },
  badgeStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  badgeGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeEmoji: { fontSize: 14 },
  badgeName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.4,
  },
  noBadgesText: {
    color: COLORS.textMuted,
    ...TYPE.caption,
    fontFamily: FONTS.body,
  },
  nextBadgeRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    paddingTop: SPACING.sm,
    gap: 2,
  },
  nextBadgeLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  nextBadgeText: {
    color: COLORS.starGold,
    ...TYPE.bodySmall,
    fontFamily: FONTS.heading,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCell: {
    flexGrow: 1,
    flexBasis: '22%',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: COLORS.textPrimary,
    ...TYPE.heading,
    fontFamily: FONTS.heading,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  toolsHead: {
    marginBottom: SPACING.sm,
  },
  toolsList: {
    gap: SPACING.sm,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  toolLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    ...TYPE.subhead,
    fontFamily: FONTS.heading,
  },
  toolMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  langChip: {
    minWidth: '47%',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  langChipActive: {
    borderColor: COLORS.glassBorderBright,
    backgroundColor: 'rgba(241,183,79,0.10)',
  },
  langText: {
    color: COLORS.textSecondary,
    ...TYPE.bodySmall,
    fontFamily: FONTS.heading,
  },
  langTextActive: {
    color: COLORS.textPrimary,
  },
});
