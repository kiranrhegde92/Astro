import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { StarField } from '../../src/components/ui/StarField';
import { SynastryWheel } from '../../src/components/chart/SynastryWheel';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { CompatibilityCard } from '../../src/components/share/ShareableCard';
import { calculateCosmicProfile } from '../../src/engines/unified';
import {
  calculateCrossCompatibility,
  calculateCompatibilityForecast,
  type CompatibilityForecast,
} from '../../src/engines/unified/crossCompatibility';
import { CompatibilityTrajectory } from '../../src/components/ui/CompatibilityTrajectory';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { showRewardedAd } from '../../src/services/rewardedAds';
import { useAdUnlockStore } from '../../src/store/adUnlockStore';
import { useConnectionsStore } from '../../src/store/connectionsStore';
import { useUserStore } from '../../src/store/userStore';
import type {
  CompatibilityHistoryEntry,
  RelationshipMode,
  SavedProfile,
} from '../../src/types/appData';
import type { CompatibilityResult, CosmicProfile } from '../../src/types/astrology';
import { getDateKey, formatDisplayDate } from '../../src/utils/dateUtils';
import { geocodePlace } from '../../src/utils/geocoding';
import { captureAndShare } from '../../src/utils/shareUtils';
import { hasPremiumEntitlement } from '../../src/utils/subscription';
import { scheduleMatchPeakNotification } from '../../src/utils/notifications';

const MODES: Array<{ value: RelationshipMode; label: string; help: string; accent: string }> = [
  { value: 'romantic', label: 'Romantic', help: 'Chemistry, tenderness, and the slow-burn kind of magic.', accent: COLORS.coral },
  { value: 'friend', label: 'Friend', help: 'Trust, rhythm, and the inside-joke chemistry.', accent: COLORS.gold },
  { value: 'work', label: 'Work', help: 'Timing, comms, and who picks up what ball.', accent: COLORS.tide },
  { value: 'family', label: 'Family', help: 'Patience, emotional fit, and day-to-day harmony.', accent: COLORS.iris },
];

function ScoreLine({
  label,
  value,
  text,
  accent = COLORS.coral,
}: {
  label: string;
  value: number;
  text: string;
  accent?: string;
}) {
  const pct = Math.max(4, Math.min(100, value));
  return (
    <View style={styles.scoreLine}>
      <View style={styles.scoreMeta}>
        <View style={styles.scoreLabelRow}>
          <View style={[styles.scoreAccentDot, { backgroundColor: accent }]} />
          <Text style={styles.scoreLabel}>{label}</Text>
        </View>
        <Text style={[styles.scoreValue, { color: accent }]}>{value}%</Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <LinearGradient
          colors={[accent, `${accent}88`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.scoreBarFill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={styles.scoreText}>{text}</Text>
    </View>
  );
}

function UpcomingHighlights({
  forecast,
  onSelectDay,
}: {
  forecast: CompatibilityForecast;
  onSelectDay?: (dateKey: string) => void;
}) {
  const todayKey = getDateKey(new Date());
  const upcoming = forecast.days.filter((d) => d.dateKey >= todayKey);
  const topPeaks = [...upcoming].sort((a, b) => b.score - a.score).slice(0, 3);
  const worstUpcoming = [...upcoming].sort((a, b) => a.score - b.score)[0] ?? null;
  const showLow = worstUpcoming && !topPeaks.some((d) => d.dateKey === worstUpcoming.dateKey);

  const formatPill = (dateKey: string) => {
    const d = new Date(dateKey);
    const diffDays = Math.round((d.getTime() - new Date(todayKey).getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.highlightsList}>
      <Text style={styles.sectionLabel}>Upcoming highlights</Text>
      {topPeaks.map((day, idx) => (
        <TouchableOpacity
          key={day.dateKey}
          activeOpacity={0.84}
          onPress={() => onSelectDay?.(day.dateKey)}
          style={[styles.highlightRow, idx === 0 && styles.highlightRowTop]}
        >
          <View style={[styles.highlightAccent, { backgroundColor: idx === 0 ? COLORS.gold : COLORS.iris }]} />
          <View style={styles.highlightMeta}>
            <Text style={styles.highlightHeader}>
              {idx === 0 ? 'Peak window' : 'Bright day'} · {formatPill(day.dateKey)}
            </Text>
            <Text style={styles.highlightNote}>{day.note}</Text>
          </View>
          <Text style={[styles.highlightScore, { color: idx === 0 ? COLORS.gold : COLORS.iris }]}>
            {day.score}%
          </Text>
        </TouchableOpacity>
      ))}
      {showLow && worstUpcoming ? (
        <TouchableOpacity
          activeOpacity={0.84}
          onPress={() => onSelectDay?.(worstUpcoming.dateKey)}
          style={styles.highlightRow}
        >
          <View style={[styles.highlightAccent, { backgroundColor: COLORS.coral }]} />
          <View style={styles.highlightMeta}>
            <Text style={styles.highlightHeader}>Go gently · {formatPill(worstUpcoming.dateKey)}</Text>
            <Text style={styles.highlightNote}>{worstUpcoming.note}</Text>
          </View>
          <Text style={[styles.highlightScore, { color: COLORS.coral }]}>{worstUpcoming.score}%</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function SavedProfileRow({
  profile,
  active,
  onPress,
  onRemove,
}: {
  profile: SavedProfile;
  active: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      accessibilityRole="button"
      accessibilityLabel={`Compare with ${profile.name}`}
      accessibilityState={{ selected: active }}
    >
      <View style={[styles.savedRow, active && styles.savedRowActive]}>
        <View style={styles.savedMeta}>
          <Text style={styles.savedName}>{profile.name}</Text>
          <Text style={styles.savedDetails}>
            {profile.relation} - {profile.cosmicDNA}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          activeOpacity={0.84}
          style={styles.removeChip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${profile.name} from saved people`}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function getModeSummary(mode: RelationshipMode, result: CompatibilityResult) {
  if (mode === 'romantic') {
    return result.overall >= 75
      ? 'The emotional and romantic chemistry here is easy to trust.'
      : 'This pairing grows through honesty, patience, and deliberate care.';
  }
  if (mode === 'friend') {
    return result.overall >= 75
      ? 'This looks like the kind of connection that restores both people.'
      : 'The friendship works best when each person respects the other rhythm.';
  }
  if (mode === 'work') {
    return result.overall >= 75
      ? 'You are likely to move quickly once roles and expectations are clear.'
      : 'This dynamic works when communication is explicit and timing is respected.';
  }
  return result.overall >= 75
    ? 'There is real emotional steadiness here when each person feels seen.'
    : 'This relationship improves when softness is paired with clear boundaries.';
}

export default function CompatibilityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ profileId?: string }>();
  const accountUser = useUserStore((state) => state.user);
  const user = useActiveProfile();
  const tokens = useAdUnlockStore((state) => state.tokens);
  const grantUnlock = useAdUnlockStore((state) => state.grantUnlock);
  const consumeUnlock = useAdUnlockStore((state) => state.consumeUnlock);
  const savedProfiles = useConnectionsStore((state) => state.savedProfiles);
  const compatibilityHistory = useConnectionsStore((state) => state.compatibilityHistory);
  const addSavedProfile = useConnectionsStore((state) => state.addSavedProfile);
  const updateSavedProfile = useConnectionsStore((state) => state.updateSavedProfile);
  const removeSavedProfile = useConnectionsStore((state) => state.removeSavedProfile);
  const addCompatibilityHistory = useConnectionsStore((state) => state.addCompatibilityHistory);

  const { showAlert, alertModal } = useCosmicAlert();
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [place, setPlace] = useState('');
  const [mode, setMode] = useState<RelationshipMode>('romantic');
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [forecast, setForecast] = useState<CompatibilityForecast | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [activeSection, setActiveSection] = useState('setup');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(params.profileId ?? null);
  const [savePartner, setSavePartner] = useState(true);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [activePartnerProfile, setActivePartnerProfile] = useState<CosmicProfile | null>(null);
  const compatCardRef = useRef<ViewShot>(null);
  const nameRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const hourRef = useRef<TextInput>(null);
  const minuteRef = useRef<TextInput>(null);
  const placeRef = useRef<TextInput>(null);

  const dateValidation = useMemo(() => {
    if (!day || !month || !year) return { valid: false, error: '' };
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (Number.isNaN(d) || d < 1 || d > 31) return { valid: false, error: 'Day must be 1-31' };
    if (Number.isNaN(m) || m < 1 || m > 12) return { valid: false, error: 'Month must be 1-12' };
    if (Number.isNaN(y) || y < 1900 || y > new Date().getFullYear()) return { valid: false, error: `Year must be 1900-${new Date().getFullYear()}` };
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) return { valid: false, error: `${month}/${year} only has ${daysInMonth} days` };
    const birthDate = new Date(y, m - 1, d);
    if (birthDate > new Date()) return { valid: false, error: 'Birth date cannot be in the future' };
    return { valid: true, error: '' };
  }, [day, month, year]);

  const timeValidation = useMemo(() => {
    if (!hour && !minute) return { valid: true, error: '' };
    if ((hour && !minute) || (!hour && minute)) return { valid: false, error: 'Enter both hour and minute, or leave both blank' };
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (hour && (isNaN(h) || h < 0 || h > 23)) return { valid: false, error: 'Hour must be 0-23' };
    if (minute && (isNaN(m) || m < 0 || m > 59)) return { valid: false, error: 'Minute must be 0-59' };
    return { valid: true, error: '' };
  }, [hour, minute]);

  const isValid = Boolean(name.trim() && day && month && year && dateValidation.valid && timeValidation.valid);
  const todayKey = getDateKey(new Date());
  const freeChecksToday = compatibilityHistory.filter((entry) => getDateKey(new Date(entry.createdAt)) === todayKey).length;
  const isPremium = hasPremiumEntitlement(accountUser?.subscription);
  const hasExtraCheckUnlock = tokens.some((token) => token.feature === 'extra_compatibility_check' && !token.consumedAt);
  const needsAdUnlock = !isPremium && freeChecksToday >= 1;
  const canRunCheck = isPremium || freeChecksToday < 1 || hasExtraCheckUnlock;
  const selectedSavedProfile = selectedProfileId
    ? savedProfiles.find((profile) => profile.id === selectedProfileId) ?? null
    : null;
  const tabs = [
    { key: 'setup', label: 'Setup' },
    { key: 'result', label: 'Result' },
    { key: 'history', label: 'History' },
  ];

  const handleDay = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 2);
    setDay(clean);
    if (clean.length === 2) monthRef.current?.focus();
  };

  const handleMonth = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 2);
    setMonth(clean);
    if (clean.length === 2) yearRef.current?.focus();
  };

  const handleYear = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    setYear(clean);
    if (clean.length === 4) hourRef.current?.focus();
  };

  const handleHour = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 2);
    setHour(clean);
    if (clean.length === 2) minuteRef.current?.focus();
  };

  const handleMinute = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 2);
    setMinute(clean);
    if (clean.length === 2) placeRef.current?.focus();
  };

  useEffect(() => {
    setSelectedProfileId(params.profileId ?? null);
  }, [params.profileId]);

  useEffect(() => {
    if (!selectedSavedProfile) return;
    setName(selectedSavedProfile.name);
    setDay(`${selectedSavedProfile.birthDetails.date.getDate()}`.padStart(2, '0'));
    setMonth(`${selectedSavedProfile.birthDetails.date.getMonth() + 1}`.padStart(2, '0'));
    setYear(`${selectedSavedProfile.birthDetails.date.getFullYear()}`);
    const [savedHour = '', savedMinute = ''] = selectedSavedProfile.birthDetails.time?.split(':') ?? [];
    setHour(savedHour);
    setMinute(savedMinute);
    setPlace(selectedSavedProfile.birthDetails.place?.name ?? '');
  }, [selectedSavedProfile]);

  const runComparison = useCallback(
    async (partnerProfile: CosmicProfile, partnerLabel: string, partnerId?: string) => {
      if (!user?.western || !user?.vedic || !user?.chinese) return;
      const myProfile: CosmicProfile = {
        western: user.western,
        vedic: user.vedic,
        chinese: user.chinese,
        kp: user.kp,
      };
      const nextResult = calculateCrossCompatibility(myProfile, partnerProfile, mode);
      const nextForecast = calculateCompatibilityForecast(myProfile, partnerProfile, mode, new Date(), 30);
      setForecast(nextForecast);
      const historyEntry: CompatibilityHistoryEntry = {
        id: `compat_${Date.now()}`,
        partnerId,
        partnerName: partnerLabel,
        mode,
        result: nextResult,
        partnerProfile,
        createdAt: new Date().toISOString(),
        forecast: nextForecast,
      };
      setResult(nextResult);
      setPartnerName(partnerLabel);
      setActivePartnerProfile(partnerProfile);
      setActiveSection('result');
      await addCompatibilityHistory(historyEntry);
      if (partnerId) {
        await updateSavedProfile(partnerId, { lastComparedAt: historyEntry.createdAt });
      }
      if (nextForecast.peak.score >= nextForecast.baseScore + 4) {
        scheduleMatchPeakNotification(
          partnerLabel,
          nextForecast.peak.dateKey,
          nextForecast.peak.score,
          nextForecast.peak.note,
        ).catch(() => {});
      }
    },
    [addCompatibilityHistory, mode, updateSavedProfile, user]
  );

  const handleCheck = useCallback(async () => {
    if (!user?.western || !user?.vedic || !user?.chinese) return;
    if (isRunningCheck) return;
    if (!isValid) {
      showAlert('Check birth details', dateValidation.error || timeValidation.error || 'Enter a valid name and birth date.');
      return;
    }
    if (!canRunCheck) {
      showAlert('Daily limit reached', 'Free includes one comparison per day. Watch an ad for one more check, or upgrade for unlimited matches.');
      return;
    }

    setIsRunningCheck(true);
    try {
      const birthDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      const birthTime = hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : undefined;
      const resolvedPlace = place.trim() ? await geocodePlace(place.trim()) : null;

      if (place.trim() && !resolvedPlace) {
        showAlert('Place not found', 'Try a city and country, or leave place blank to compare without location-specific rising details.');
        return;
      }

      if (needsAdUnlock) {
        const consumed = await consumeUnlock('extra_compatibility_check');
        if (!consumed) {
          showAlert('Unlock needed', 'Watch a rewarded ad or upgrade to run another match today.');
          return;
        }
      }

      const partnerProfile = calculateCosmicProfile(birthDate, birthTime, resolvedPlace?.lat, resolvedPlace?.lng);

      let partnerId = selectedSavedProfile?.id;
      if (savePartner) {
        const savedProfile: SavedProfile = {
          id: partnerId ?? `saved_${Date.now()}`,
          name: name.trim(),
          relation:
            mode === 'romantic'
              ? 'partner'
              : mode === 'work'
                ? 'coworker'
                : mode === 'family'
                  ? 'family'
                  : 'friend',
          birthDetails: {
            date: birthDate,
            time: birthTime,
            place: resolvedPlace ?? undefined,
          },
          activeSystems: user.activeSystems,
          profile: partnerProfile,
          source: selectedSavedProfile ? selectedSavedProfile.source : 'manual',
          cosmicDNA: `${partnerProfile.western.sun} Sun + ${partnerProfile.vedic.rashi} Rashi + ${partnerProfile.chinese.element} ${partnerProfile.chinese.animal}`,
          createdAt: selectedSavedProfile?.createdAt ?? new Date().toISOString(),
          lastComparedAt: new Date().toISOString(),
        };
        partnerId = savedProfile.id;
        await addSavedProfile(savedProfile);
        setSelectedProfileId(savedProfile.id);
      }

      await runComparison(partnerProfile, name.trim(), partnerId);
    } finally {
      setIsRunningCheck(false);
    }
  }, [
    addSavedProfile,
    canRunCheck,
    consumeUnlock,
    day,
    dateValidation.error,
    hour,
    isRunningCheck,
    isValid,
    minute,
    mode,
    month,
    name,
    needsAdUnlock,
    place,
    runComparison,
    savePartner,
    selectedSavedProfile,
    showAlert,
    timeValidation.error,
    user,
    year,
  ]);

  const handleWatchAdForCheck = useCallback(async () => {
    if (adLoading) return;
    setAdLoading(true);
    try {
      const earned = await showRewardedAd('extra_compatibility_check');
      if (!earned) {
        showAlert('Ad not completed', 'No extra check was unlocked. Try again when a rewarded ad is available.');
        return;
      }
      await grantUnlock('extra_compatibility_check');
      showAlert('Extra check unlocked', 'Run the match again and the ad unlock will be used once.');
    } finally {
      setAdLoading(false);
    }
  }, [adLoading, grantUnlock, showAlert]);

  const handleCompareSaved = useCallback(
    async (profile: SavedProfile) => {
      if (!isPremium && freeChecksToday >= 1) {
        const consumed = await consumeUnlock('extra_compatibility_check');
        if (!consumed) {
          showAlert('Daily limit reached', 'Watch an ad for one more check, or upgrade for unlimited matches.');
          return;
        }
      }
      setSelectedProfileId(profile.id);
      await runComparison(profile.profile, profile.name, profile.id);
    },
    [consumeUnlock, freeChecksToday, isPremium, runComparison, showAlert]
  );

  const handleShare = useCallback(async () => {
    try {
      await captureAndShare(compatCardRef);
    } catch {
      showAlert('Share', 'Unable to share right now.');
    }
  }, []);

  if (!accountUser || !user?.western || !user?.vedic || !user?.chinese) return null;

  return (
    <StarField>
      <ResetScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Match</Text>
        <Text style={styles.headline}>Compare charts without re-entering the same person every time.</Text>
        <Text style={styles.copy}>
          Save people, switch the relationship lens, and keep a record of what each comparison revealed.
        </Text>
        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'setup' && (
          <>
            <GradientCard style={styles.modeCard} accentColor={COLORS.coral}>
              <Text style={styles.sectionLabel}>Relationship mode</Text>
              <View style={styles.modeRow}>
                {MODES.map((item) => {
                  const active = item.value === mode;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => setMode(item.value)}
                      style={[
                        styles.modeChip,
                        active && { borderColor: `${item.accent}aa` },
                      ]}
                      activeOpacity={0.84}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.label} compatibility mode`}
                      accessibilityState={{ selected: active }}
                    >
                      {active ? (
                        <LinearGradient
                          colors={[item.accent, `${item.accent}55`]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />
                      ) : null}
                      <View style={styles.modeDotRow}>
                        <View style={[styles.modeDot, { backgroundColor: active ? '#fff' : item.accent }]} />
                        <Text style={[styles.modeText, active && { color: '#fff', fontWeight: '700' }]}>{item.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.modeHelp}>{MODES.find((item) => item.value === mode)?.help}</Text>
              {!isPremium ? (
                <Text style={styles.limitNote}>
                  Free plan: {Math.max(0, 1 - freeChecksToday)} comparison left today{hasExtraCheckUnlock ? ' + 1 ad unlock ready' : ''}.
                </Text>
              ) : null}
            </GradientCard>

            <GradientCard style={styles.formCard} accentColor={COLORS.iris}>
              <Text style={styles.sectionLabel}>Enter details manually</Text>
              <TextInput
                ref={nameRef}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Their name"
                placeholderTextColor={COLORS.textMuted}
                returnKeyType="next"
                onSubmitEditing={() => dayRef.current?.focus()}
              />
              <View style={styles.dateRow}>
                <TextInput
                  ref={dayRef}
                  style={[styles.input, styles.small]}
                  value={day}
                  onChangeText={handleDay}
                  placeholder="DD"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TextInput
                  ref={monthRef}
                  style={[styles.input, styles.small]}
                  value={month}
                  onChangeText={handleMonth}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TextInput
                  ref={yearRef}
                  style={[styles.input, styles.year]}
                  value={year}
                  onChangeText={handleYear}
                  placeholder="YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  selectTextOnFocus
                />
              </View>
              {dateValidation.error ? (
                <Text style={styles.validationError}>{dateValidation.error}</Text>
              ) : null}
              <View style={styles.dateRow}>
                <TextInput
                  ref={hourRef}
                  style={[styles.input, styles.small]}
                  value={hour}
                  onChangeText={handleHour}
                  placeholder="HH"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TextInput
                  ref={minuteRef}
                  style={[styles.input, styles.small]}
                  value={minute}
                  onChangeText={handleMinute}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TextInput
                  ref={placeRef}
                  style={[styles.input, styles.place]}
                  value={place}
                  onChangeText={setPlace}
                  placeholder="Place"
                  placeholderTextColor={COLORS.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={() => void handleCheck()}
                />
              </View>
              {timeValidation.error ? (
                <Text style={styles.validationError}>{timeValidation.error}</Text>
              ) : null}
              <TouchableOpacity
                onPress={() => setSavePartner((value) => !value)}
                activeOpacity={0.84}
                style={[
                  styles.saveToggle,
                  savePartner && { borderColor: `${COLORS.gold}aa` },
                ]}
                accessibilityRole="switch"
                accessibilityLabel="Save partner after comparing"
                accessibilityState={{ checked: savePartner }}
              >
                {savePartner ? (
                  <LinearGradient
                    colors={[COLORS.gold, `${COLORS.gold}66`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <View style={styles.saveToggleInner}>
                  <View style={[styles.saveToggleDot, { backgroundColor: savePartner ? '#fff' : COLORS.gold }]} />
                  <Text style={[styles.saveToggleText, savePartner && { color: '#1b1430' }]}>
                    {savePartner ? 'Saved after compare' : 'Compare once only'}
                  </Text>
                </View>
              </TouchableOpacity>
            </GradientCard>

            <View style={styles.actions}>
              <CosmicButton
                title={canRunCheck ? (isRunningCheck ? 'Checking the match' : needsAdUnlock ? 'Use ad unlock for match' : 'Run the match') : 'Upgrade for more checks'}
                onPress={canRunCheck ? () => void handleCheck() : () => router.push('/subscription')}
                disabled={!canRunCheck && !isPremium ? false : !isValid || isRunningCheck}
                loading={isRunningCheck}
                colors={[COLORS.coral, COLORS.iris]}
              />
              {!isPremium && freeChecksToday >= 1 && !hasExtraCheckUnlock ? (
                <CosmicButton
                  title={adLoading ? 'Loading ad' : 'Watch ad for one more check'}
                  onPress={() => void handleWatchAdForCheck()}
                  loading={adLoading}
                  variant="outline"
                />
              ) : null}
              <CosmicButton title="Scan or paste a shared profile" onPress={() => router.push('/qr/scan')} variant="outline" />
            </View>

            {savedProfiles.length ? (
              <GradientCard style={styles.savedCard} accentColor={COLORS.tide}>
                <Text style={styles.sectionLabel}>Saved people - tap to compare</Text>
                {savedProfiles.map((profile) => (
                  <SavedProfileRow
                    key={profile.id}
                    profile={profile}
                    active={profile.id === selectedProfileId}
                    onPress={() => void handleCompareSaved(profile)}
                    onRemove={() => void removeSavedProfile(profile.id)}
                  />
                ))}
              </GradientCard>
            ) : null}
          </>
        )}

        {activeSection === 'result' && result && activePartnerProfile ? (
          <>
            <View style={[styles.matchHero, { shadowColor: COLORS.coral }]}>
              <LinearGradient
                colors={[
                  result.overall >= 75 ? '#ff7896' : result.overall >= 55 ? '#9b91ff' : '#6f7ae0',
                  result.overall >= 75 ? '#9b91ff' : result.overall >= 55 ? '#3ee0c8' : '#3ee0c8',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.matchHeroHighlight} pointerEvents="none" />
              <View style={styles.resultHero}>
                <View style={styles.resultCopy}>
                  <Text style={styles.matchHeroLabel}>{mode} compatibility • today</Text>
                  <Text style={styles.matchHeroScore}>{result.overall}%</Text>
                  <Text style={styles.matchHeroNames}>{user.name} and {partnerName}</Text>
                  <Text style={styles.matchHeroSummary}>{getModeSummary(mode, result)}</Text>
                  {forecast ? (
                    <View style={styles.matchForecastPill}>
                      <Text style={styles.matchForecastText}>
                        30-day avg <Text style={styles.matchForecastStrong}>{forecast.average}%</Text> · peak <Text style={styles.matchForecastStrong}>{forecast.peak.score}%</Text> · low <Text style={styles.matchForecastStrong}>{forecast.low.score}%</Text>
                      </Text>
                    </View>
                  ) : null}
                </View>
                <CosmicOrb size={128} primaryColor="#fff" secondaryColor={COLORS.gold} />
              </View>
            </View>

            <GradientCard style={styles.scoreCard}>
              <Text style={styles.sectionLabel}>How the systems compare</Text>
              <ScoreLine label="Western" value={result.western.score} text={result.western.details} accent={COLORS.iris} />
              <ScoreLine label="Vedic" value={result.vedic.score} text={result.vedic.details} accent={COLORS.coral} />
              <ScoreLine label="Chinese" value={result.chinese.score} text={result.chinese.details} accent={COLORS.tide} />
            </GradientCard>

            {forecast ? (
              <GradientCard style={styles.scoreCard} accentColor={COLORS.iris}>
                <CompatibilityTrajectory forecast={forecast} name1={user.name} name2={partnerName} />
              </GradientCard>
            ) : null}

            {forecast ? (
              <GradientCard style={styles.scoreCard} accentColor={COLORS.gold}>
                <UpcomingHighlights forecast={forecast} />
              </GradientCard>
            ) : null}

            {user.western?.planets?.length && activePartnerProfile.western?.planets?.length ? (
              <GradientCard>
                <Text style={styles.sectionLabel}>Synastry chart</Text>
                <SynastryWheel
                  userPlanets={user.western.planets}
                  partnerPlanets={activePartnerProfile.western.planets}
                  userName={user.name}
                  partnerName={partnerName}
                  size={300}
                />
              </GradientCard>
            ) : null}

            <View style={styles.resultActions}>
              <CosmicButton title="Share this result" onPress={handleShare} colors={[COLORS.gold, COLORS.coral]} />
              <CosmicButton title="Start over" onPress={() => { setResult(null); setForecast(null); }} variant="outline" />
            </View>

            <View style={styles.hiddenCard}>
              <CompatibilityCard
                name1={user.name}
                name2={partnerName}
                score={result.overall}
                westernScore={result.western.score}
                vedicScore={result.vedic.score}
                chineseScore={result.chinese.score}
                viewShotRef={compatCardRef}
                showWatermark={!isPremium}
              />
            </View>
          </>
        ) : null}

        {activeSection === 'history' && (
          <GradientCard style={styles.historyCard}>
            <Text style={styles.sectionLabel}>Recent comparisons</Text>
            {compatibilityHistory.length ? (
              compatibilityHistory.slice(0, 6).map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={0.84}
                  onPress={() => {
                    setResult(entry.result);
                    setForecast(entry.forecast ?? null);
                    setPartnerName(entry.partnerName);
                    setActivePartnerProfile(entry.partnerProfile);
                    setMode(entry.mode);
                    setActiveSection('result');
                  }}
                  style={styles.historyRow}
                  accessibilityRole="button"
                  accessibilityLabel={`Reopen match with ${entry.partnerName}`}
                >
                  <View style={styles.historyTop}>
                    <Text style={styles.historyName}>{entry.partnerName}</Text>
                    <Text style={styles.historyScore}>{entry.result.overall}%</Text>
                  </View>
                  <Text style={styles.historyMeta}>
                    {entry.mode} - {formatDisplayDate(entry.createdAt.slice(0, 10))}
                    {entry.forecast ? ` - 30d avg ${entry.forecast.average}% · peak ${entry.forecast.peak.score}%` : ''}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.historyEmpty}>
                No comparisons yet. Run a match and the result will appear here.
              </Text>
            )}
          </GradientCard>
        )}
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
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 38,
    lineHeight: 44,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 320,
  },
  modeCard: {
    gap: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modeChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 9,
    paddingHorizontal: 14,
    minHeight: 38,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  modeDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  modeText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
    fontWeight: '600',
  },
  modeHelp: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  limitNote: {
    color: COLORS.coral,
    fontSize: 12,
    lineHeight: 18,
  },
  hero: {
    alignItems: 'center',
  },
  formCard: {
    gap: SPACING.sm,
  },
  input: {
    minHeight: 52,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.glassBg,
    fontSize: 16,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  small: {
    flex: 1,
    textAlign: 'center',
  },
  year: {
    flex: 1.2,
    textAlign: 'center',
  },
  place: {
    flex: 1.6,
  },
  saveToggle: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  saveToggleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  saveToggleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  saveToggleText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
    fontWeight: '600',
  },
  savedCard: {
    gap: SPACING.sm,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  savedRowActive: {
    backgroundColor: COLORS.glassHighlight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
  },
  savedMeta: {
    flex: 1,
    gap: 4,
  },
  savedName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
  savedDetails: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  removeChip: {
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.coral}66`,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: `${COLORS.coral}15`,
  },
  removeText: {
    color: COLORS.coral,
    fontSize: 11,
    fontFamily: FONTS.accent,
    fontWeight: '700',
  },
  resultHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.9,
    textTransform: 'capitalize',
  },
  resultScore: {
    color: COLORS.textPrimary,
    fontSize: 40,
    lineHeight: 46,
    fontFamily: FONTS.display,
  },
  resultNames: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: FONTS.heading,
  },
  resultSummary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  resultForecastLine: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 0.4,
    marginTop: 6,
    fontFamily: FONTS.accent,
  },
  matchHero: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  matchHeroHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  matchHeroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  matchHeroScore: {
    color: '#fff',
    fontSize: 54,
    lineHeight: 60,
    fontFamily: FONTS.display,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
  matchHeroNames: {
    color: '#fff8ea',
    fontSize: 16,
    lineHeight: 23,
    fontFamily: FONTS.heading,
  },
  matchHeroSummary: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  matchForecastPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  matchForecastText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    letterSpacing: 0.3,
    fontFamily: FONTS.accent,
  },
  matchForecastStrong: {
    color: COLORS.gold,
    fontFamily: FONTS.heading,
  },
  scoreCard: {
    gap: SPACING.sm,
  },
  scoreLine: {
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  scoreMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreAccentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreLabel: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.heading,
  },
  scoreValue: {
    fontSize: 18,
    fontFamily: FONTS.heading,
  },
  scoreBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  highlightsList: {
    gap: SPACING.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  highlightRowTop: {
    borderColor: `${COLORS.gold}55`,
    backgroundColor: `${COLORS.gold}12`,
  },
  highlightAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  highlightMeta: {
    flex: 1,
    gap: 3,
  },
  highlightHeader: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  highlightNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  highlightScore: {
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  actions: {
    gap: SPACING.md,
  },
  resultActions: {
    gap: SPACING.md,
  },
  historyCard: {
    gap: SPACING.sm,
  },
  historyRow: {
    gap: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  historyName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  historyScore: {
    color: COLORS.coral,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  historyMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
    textTransform: 'capitalize',
  },
  historyEmpty: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  validationError: {
    color: COLORS.coral,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.accent,
  },
  hiddenCard: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
});
