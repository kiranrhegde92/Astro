import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { NatalWheel } from '../../src/components/chart/NatalWheel';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { getEarnedBadges, getNextBadge } from '../../src/constants/badges';
import { calculateCosmicProfile, getCosmicDNASummary } from '../../src/engines/unified';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { useAdUnlockStore } from '../../src/store/adUnlockStore';
import { useAuthStore } from '../../src/store/authStore';
import { useConnectionsStore } from '../../src/store/connectionsStore';
import { useJournalStore } from '../../src/store/journalStore';
import { useManagedProfilesStore } from '../../src/store/managedProfilesStore';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { exportMyPredictionDataset } from '../../src/services/functionsService';
import i18n from '../../src/i18n';
import { buildProfilesFromServerChart } from '../../src/utils/serverChartAdapter';
import { LANGUAGE_OPTIONS, normalizeLanguage } from '../../src/i18n/language';

export default function ProfileScreen() {
  const router = useRouter();
  const accountUser = useUserStore((s) => s.user);
  const user = useActiveProfile();
  const clearUser = useUserStore((s) => s.clearUser);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const clearReadings = useReadingStore((s) => s.clearReadings);
  const clearConnections = useConnectionsStore((s) => s.clearConnections);
  const clearJournal = useJournalStore((s) => s.clearJournal);
  const clearAdUnlocks = useAdUnlockStore((s) => s.clearAdUnlocks);
  const clearManagedProfiles = useManagedProfilesStore((s) => s.clearManagedProfiles);
  const managedProfiles = useManagedProfilesStore((s) => s.managedProfiles);
  const updateManagedProfile = useManagedProfilesStore((s) => s.updateManagedProfile);
  const clearSettings = useSettingsStore((s) => s.clearSettings);
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
  const [currentLang, setCurrentLang] = useState(normalizeLanguage(user?.language ?? i18n.language));
  const [recalculating, setRecalculating] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingDataset, setExportingDataset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setCurrentLang(normalizeLanguage(user?.language ?? i18n.language));
  }, [user?.language]);

  const cosmicDNA = useMemo(() => {
    if (!user?.western || !user?.vedic || !user?.chinese) return '';
    return getCosmicDNASummary({ western: user.western, vedic: user.vedic, chinese: user.chinese, kp: user.kp });
  }, [user?.western, user?.vedic, user?.chinese, user?.kp]);

  const earnedBadges = useMemo(() => {
    if (!accountUser) return [];
    return getEarnedBadges(
      accountUser.streak,
      accountUser.cosmicPoints,
      accountUser.activeSystems,
      compatibilityHistory.length,
      false, // hasShared — tracked elsewhere
    );
  }, [accountUser?.streak, accountUser?.cosmicPoints, accountUser?.activeSystems, compatibilityHistory.length]);

  const nextBadge = useMemo(() => {
    if (!accountUser) return null;
    return getNextBadge(accountUser.streak, accountUser.cosmicPoints);
  }, [accountUser?.streak, accountUser?.cosmicPoints]);

  const streakProgress = useMemo(() => {
    if (!accountUser) return 0;
    const targets = [3, 7, 14, 30, 90, 365];
    const next = targets.find((t) => t > accountUser.streak) ?? 365;
    return Math.min(accountUser.streak / next, 1);
  }, [accountUser?.streak]);

  if (!user || !accountUser) return null;

  const birthDate = new Date(user.birthDetails.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const handleLanguage = (code: string) => {
    const normalized = normalizeLanguage(code);
    setCurrentLang(normalized);
    i18n.changeLanguage(normalized);
    setLanguage(normalized); // persist to user store + Firestore
  };

  const handleCommitName = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      if (user.isManagedProfile && user.managedProfileId) {
        void updateManagedProfile(user.managedProfileId, { name: trimmed });
      } else {
        setUser({ ...accountUser, name: trimmed });
      }
    }
    setEditingName(false);
  };

  const handleRecalculate = async () => {
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

      // Try cloud function first
      const { calculateUserChart } = await import('../../src/services/functionsService');
      const birthDateStr = bd.birthDateStr ?? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const birthTimeStr = birthTime ?? '12:00';
      const birthPlace = bd.birthPlace ?? bd.place?.name ?? 'Unknown';

      try {
        const result = await calculateUserChart({ birthDate: birthDateStr, birthTime: birthTimeStr, birthPlace });
        const c = result.chart;
        const mappedProfiles = buildProfilesFromServerChart(c);
        if (mappedProfiles.western) setWesternProfile(mappedProfiles.western);
        if (mappedProfiles.vedic) setVedicProfile(mappedProfiles.vedic);
        if (mappedProfiles.chinese) setChineseProfile(mappedProfiles.chinese);
        if (mappedProfiles.kp) setKPProfile(mappedProfiles.kp);
        showAlert('Chart updated', `Rashi: ${c.vedic?.rashi ?? '-'} | Nakshatra: ${c.vedic?.nakshatra ?? '-'}`);
        return;
      } catch {
        // Cloud failed, fall through to local
      }

      // Local engine fallback.
      const local = calculateCosmicProfile(
        new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        birthTime,
        bd.place?.lat,
        bd.place?.lng,
      );
      if (local.western) setWesternProfile(local.western);
      if (local.vedic)   setVedicProfile(local.vedic);
      if (local.chinese) setChineseProfile(local.chinese);
      if (local.kp)      setKPProfile(local.kp);
      showAlert('Chart recalculated', `Rashi: ${local.vedic?.rashi ?? '-'} | Nakshatra: ${local.vedic?.nakshatra ?? '-'}`);
    } catch (err) {
      showAlert('Recalculation failed', 'Could not recalculate your chart. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      'Log out',
      'This signs you out and clears the local chart on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out', style: 'destructive',
          onPress: async () => {
            await Promise.all([logout(), clearUser(), clearReadings(), clearConnections(), clearJournal(), clearAdUnlocks(), clearManagedProfiles()]);
            await clearSettings();
            router.dismissAll();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    showAlert(
      'Delete account',
      'This permanently deletes your profile, charts, readings, connections, and device data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              await deleteAccount();
              router.dismissAll();
              router.replace('/(auth)/login');
            } catch (error: any) {
              const message =
                error?.message && typeof error.message === 'string'
                  ? error.message
                  : 'We could not delete your account right now. Please try again.';
              showAlert('Deletion failed', message);
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const handleExportDataset = async () => {
    setExportingDataset(true);
    try {
      const result = await exportMyPredictionDataset(250);
      showAlert(
        'Dataset summary',
        `Runs: ${result.summary.totalRuns}\nLabeled: ${result.summary.labeledRuns}\nLabel rate: ${Math.round(result.summary.labelRate * 100)}%`
      );
    } catch {
      showAlert('Export failed', 'Could not load your prediction dataset summary right now.');
    } finally {
      setExportingDataset(false);
    }
  };

  return (
    <StarField>
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <AnimatedCard index={0}>
          <View style={styles.posterWrap}>
            <LinearGradient colors={COLORS.gradientInk} style={styles.poster}>
              <Text style={styles.posterLabel}>Your chart</Text>
              {user.isManagedProfile ? (
                <TouchableOpacity style={styles.profileModePill} onPress={() => router.push('/profile/family-profiles')} activeOpacity={0.84}>
                  <Text style={styles.profileModeText}>Viewing family profile</Text>
                </TouchableOpacity>
              ) : null}
              {editingName ? (
                <View style={styles.editNameRow}>
                  <TextInput
                    style={styles.editNameInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                    placeholderTextColor="rgba(255,250,241,0.4)"
                    onSubmitEditing={handleCommitName}
                  />
                  <TouchableOpacity
                    onPress={handleCommitName}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={28} color={COLORS.tide} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => { setEditName(user.name); setEditingName(true); }}
                  activeOpacity={0.84}
                  style={styles.nameRow}
                >
                  <Text style={styles.name}>{user.name}</Text>
                  <Ionicons name="pencil-outline" size={16} color="rgba(255,250,241,0.5)" />
                </TouchableOpacity>
              )}
              <Text style={styles.birthMeta}>
                {birthDate}
                {user.birthDetails.place?.name ? `  ·  ${user.birthDetails.place.name}` : ''}
              </Text>
              {user.birthDetails.time ? (
                <Text style={styles.birthMeta}>{user.birthDetails.time}</Text>
              ) : null}
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
                { value: String(accountUser.streak), label: 'Day streak', onPress: undefined },
                { value: String(accountUser.cosmicPoints), label: 'Points', onPress: undefined },
                { value: String(entries.length), label: 'Journal notes', onPress: () => router.push('/journal') },
              ].map((m) => (
                <TouchableOpacity key={m.label} style={styles.chip} onPress={m.onPress} activeOpacity={m.onPress ? 0.8 : 1} disabled={!m.onPress}>
                  <Text style={styles.chipValue}>{m.value}</Text>
                  <Text style={styles.chipLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.row3}>
              {[
                { value: String(savedProfiles.length), label: 'Connections' },
                { value: String(archiveCount), label: 'Archive days' },
                { value: accountUser.subscription.tier, label: 'Plan' },
              ].map((m) => (
                <View key={m.label} style={styles.chip}>
                  <Text style={styles.chipValue}>{m.value}</Text>
                  <Text style={styles.chipLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </AnimatedCard>

        <AnimatedCard index={3}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/profile/family-profiles')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingsLabel}>Profiles ({managedProfiles.length + 1}/5)</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AnimatedCard>

        <AnimatedCard index={4}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingsLabel}>Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AnimatedCard>

        <AnimatedCard index={5}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setShowProfileDetails((value) => !value)}
            activeOpacity={0.8}
          >
            <Ionicons name={showProfileDetails ? 'chevron-up' : 'ellipsis-horizontal'} size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingsLabel}>{showProfileDetails ? 'Hide profile tools' : 'More profile tools'}</Text>
            <Ionicons name={showProfileDetails ? 'chevron-up' : 'chevron-forward'} size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </AnimatedCard>

        {showProfileDetails ? (
          <>
        {/* ── Badges & Streak ──────────────────────────────────────────── */}
        <AnimatedCard index={6}>
          <LinearGradient colors={COLORS.gradientInkSoft} style={styles.card}>
            <Text style={styles.sectionLabel}>Badges</Text>
            <View style={styles.badgeStreakRow}>
              <ProgressRing
                progress={streakProgress}
                size={72}
                strokeWidth={5}
                color={COLORS.starGold}
                value={`${accountUser.streak}`}
                label="Streak"
              />
              <View style={styles.badgeGrid}>
                {earnedBadges.slice(0, 6).map((badge) => (
                  <View key={badge.id} style={styles.badgeChip}>
                    <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                  </View>
                ))}
                {earnedBadges.length === 0 && (
                  <Text style={styles.noBadgesText}>Keep checking in to unlock badges</Text>
                )}
              </View>
            </View>
            {earnedBadges.length > 6 && (
              <Text style={styles.moreBadgesText}>+{earnedBadges.length - 6} more earned</Text>
            )}
            {nextBadge && (
              <View style={styles.nextBadgeRow}>
                <Text style={styles.nextBadgeLabel}>Next goal</Text>
                <Text style={styles.nextBadgeText}>{nextBadge.emoji} {nextBadge.name} — {nextBadge.requirement}</Text>
              </View>
            )}
          </LinearGradient>
        </AnimatedCard>

        {/* ── Referral ──────────────────────────────────────────────────── */}
        {accountUser.referralCode ? (
          <AnimatedCard index={7}>
            <LinearGradient colors={COLORS.gradientInkSoft} style={styles.card}>
              <Text style={styles.sectionLabel}>Invite Friends</Text>
              <Text style={styles.referralSubtitle}>Share your code — each friend who joins counts toward your 3 invites.</Text>
              <View style={styles.referralCodeRow}>
                <Text style={styles.referralCode}>{accountUser.referralCode}</Text>
                <TouchableOpacity
                  style={styles.referralShareBtn}
                  activeOpacity={0.75}
                  onPress={() => {
                    Share.share({
                      message: `Join me on CosmicSelf — use my referral code ${accountUser.referralCode} to get started!`,
                    }).catch(() => {});
                  }}
                >
                  <Ionicons name="share-outline" size={18} color={COLORS.western} />
                  <Text style={styles.referralShareText}>Share</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.referralSlots}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.referralSlot,
                      i < (accountUser.referralCount ?? 0) && styles.referralSlotUsed,
                    ]}
                  >
                    <Ionicons
                      name={i < (accountUser.referralCount ?? 0) ? 'person' : 'person-outline'}
                      size={16}
                      color={i < (accountUser.referralCount ?? 0) ? COLORS.western : COLORS.textMuted}
                    />
                  </View>
                ))}
                <Text style={styles.referralSlotsLabel}>
                  {accountUser.referralCount ?? 0}/3 invites used
                </Text>
              </View>
            </LinearGradient>
          </AnimatedCard>
        ) : null}

        {/* ── Language ───────────────────────────────────────────────── */}
        <AnimatedCard index={8}>
          <GradientCard style={styles.card} colors={COLORS.gradientSilver}>
            <Text style={styles.sectionLabel}>Language</Text>
            <Text style={styles.langNote}>Changes navigation and rewrites the Today reading in a natural spoken style where supported.</Text>
            <View style={styles.langGrid}>
              {LANGUAGE_OPTIONS.map((lang) => {
                const active = currentLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langChip, active && styles.langChipActive]}
                    onPress={() => handleLanguage(lang.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langText, active && styles.langTextActive]}>{lang.nativeName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GradientCard>
        </AnimatedCard>

        {/* ── Recalculate ───────────────────────────────────────────────── */}
        <AnimatedCard index={9}>
          <View style={styles.profileActionStack}>
            <TouchableOpacity style={styles.recalcBtn} onPress={handleRecalculate} activeOpacity={0.8} disabled={recalculating}>
              {recalculating
                ? <ActivityIndicator size="small" color={COLORS.vedic} />
                : <Ionicons name="refresh-outline" size={20} color={COLORS.vedic} />
              }
              <Text style={styles.recalcText}>{recalculating ? 'Recalculating...' : 'Recalculate my chart'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.requestBirthBtn}
              onPress={() => {
                if (user.isManagedProfile) {
                  showAlert('Birth details locked', 'Family profile birth details are locked after creation. Remove and add that profile again if those details were entered wrong.');
                } else {
                  router.push('/profile/birth-details');
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.iris} />
              <Text style={styles.requestBirthText}>Request birth detail correction</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <AnimatedCard index={10}>
          <TouchableOpacity
            style={styles.datasetBtn}
            onPress={handleExportDataset}
            activeOpacity={0.8}
            disabled={exportingDataset}
          >
            {exportingDataset
              ? <ActivityIndicator size="small" color={COLORS.iris} />
              : <Ionicons name="analytics-outline" size={20} color={COLORS.iris} />
            }
            <Text style={styles.datasetText}>{exportingDataset ? 'Loading dataset...' : 'AI dataset summary'}</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* ── Logout / Delete ────────────────────────────────────────────── */}
        <AnimatedCard index={11}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.coral} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </AnimatedCard>

        <AnimatedCard index={12}>
          <TouchableOpacity
            style={[styles.deleteBtn, deletingAccount && styles.deleteBtnDisabled]}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
            disabled={deletingAccount}
          >
            {deletingAccount
              ? <ActivityIndicator size="small" color={COLORS.textPrimary} />
              : <Ionicons name="trash-outline" size={20} color={COLORS.textPrimary} />
            }
            <Text style={styles.deleteText}>{deletingAccount ? 'Deleting account...' : 'Delete my account'}</Text>
          </TouchableOpacity>
        </AnimatedCard>

          </>
        ) : null}

      </ResetScrollView>
      {alertModal}
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
  profileModePill: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,250,241,0.22)',
    backgroundColor: 'rgba(255,250,241,0.10)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: SPACING.xs,
  },
  profileModeText: {
    color: 'rgba(255,250,241,0.78)',
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
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
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgElevated,
  },
  settingsLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  langNote: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
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
  profileActionStack: {
    gap: SPACING.sm,
  },
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
  requestBirthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: `${COLORS.iris}44`,
    backgroundColor: `${COLORS.iris}10`,
  },
  requestBirthText: {
    color: COLORS.iris,
    fontSize: 17,
    fontFamily: FONTS.heading,
  },
  datasetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: `${COLORS.iris}44`,
    backgroundColor: `${COLORS.iris}10`,
  },
  datasetText: {
    color: COLORS.iris,
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
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,250,241,0.16)',
    backgroundColor: COLORS.coral,
  },
  deleteBtnDisabled: {
    opacity: 0.72,
  },
  deleteText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.heading,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.3,
  },
  noBadgesText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  moreBadgesText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.5,
  },
  nextBadgeRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.ruleLight,
    paddingTop: SPACING.sm,
    gap: 2,
  },
  nextBadgeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  nextBadgeText: {
    color: COLORS.starGold,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  referralSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  referralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  referralCode: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  referralShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  referralShareText: {
    color: COLORS.western,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  referralSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  referralSlot: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralSlotUsed: {
    borderColor: COLORS.western,
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  referralSlotsLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginLeft: SPACING.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editNameInput: {
    flex: 1,
    color: '#fffaf1',
    fontSize: 32,
    fontFamily: FONTS.display,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,250,241,0.3)',
    paddingVertical: 4,
    maxWidth: 200,
  },
});
