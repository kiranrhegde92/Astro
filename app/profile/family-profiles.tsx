import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { StarField } from '../../src/components/ui/StarField';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { calculateCosmicProfile, getCosmicDNASummary } from '../../src/engines/unified';
import {
  MAX_EXTRA_MANAGED_PROFILES,
  MAX_TOTAL_MANAGED_PROFILES,
  useManagedProfilesStore,
} from '../../src/store/managedProfilesStore';
import { useUserStore } from '../../src/store/userStore';
import type { ManagedProfile } from '../../src/types/appData';
import type { BirthDetails } from '../../src/types/user';
import { geocodePlace } from '../../src/utils/geocoding';
import { hasPremiumEntitlement } from '../../src/utils/subscription';

function getDateParts(value: Date) {
  return {
    day: String(value.getDate()).padStart(2, '0'),
    month: String(value.getMonth() + 1).padStart(2, '0'),
    year: String(value.getFullYear()),
  };
}

export default function FamilyProfilesScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const managedProfiles = useManagedProfilesStore((state) => state.managedProfiles);
  const activeProfileId = useManagedProfilesStore((state) => state.activeProfileId);
  const addManagedProfile = useManagedProfilesStore((state) => state.addManagedProfile);
  const removeManagedProfile = useManagedProfilesStore((state) => state.removeManagedProfile);
  const setActiveProfileId = useManagedProfilesStore((state) => state.setActiveProfileId);
  const { showAlert, alertModal } = useCosmicAlert();

  const todayParts = useMemo(() => getDateParts(new Date()), []);
  const [name, setName] = useState('');
  const [day, setDay] = useState(todayParts.day);
  const [month, setMonth] = useState(todayParts.month);
  const [year, setYear] = useState(todayParts.year);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [place, setPlace] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const premium = hasPremiumEntitlement(user?.subscription);
  const canAddMore = managedProfiles.length < MAX_EXTRA_MANAGED_PROFILES;

  const dateValidation = useMemo(() => {
    if (!day || !month || !year) return { valid: false, error: 'Birth date is required' };
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(d) || d < 1 || d > 31) return { valid: false, error: 'Day must be 1-31' };
    if (Number.isNaN(m) || m < 1 || m > 12) return { valid: false, error: 'Month must be 1-12' };
    if (Number.isNaN(y) || y < 1900 || y > currentYear) return { valid: false, error: `Year must be 1900-${currentYear}` };
    const birthDate = new Date(y, m - 1, d);
    if (birthDate.getFullYear() !== y || birthDate.getMonth() !== m - 1 || birthDate.getDate() !== d) {
      return { valid: false, error: 'That day does not exist in this month' };
    }
    if (birthDate > new Date()) return { valid: false, error: 'Birth date cannot be in the future' };
    return { valid: true, error: '' };
  }, [day, month, year]);

  const timeValidation = useMemo(() => {
    if (!hour && !minute) return { valid: true, error: '' };
    if ((hour && !minute) || (!hour && minute)) return { valid: false, error: 'Enter both hour and minute, or leave both blank' };
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (Number.isNaN(h) || h < 0 || h > 23) return { valid: false, error: 'Hour must be 0-23' };
    if (Number.isNaN(m) || m < 0 || m > 59) return { valid: false, error: 'Minute must be 0-59' };
    return { valid: true, error: '' };
  }, [hour, minute]);

  const isValid = Boolean(name.trim()) && dateValidation.valid && timeValidation.valid;

  const resetForm = () => {
    setName('');
    setDay(todayParts.day);
    setMonth(todayParts.month);
    setYear(todayParts.year);
    setHour('');
    setMinute('');
    setPlace('');
    setShowAddForm(false);
  };

  const handleAddProfile = useCallback(async () => {
    if (!user || saving) return;
    if (!premium) {
      router.push('/subscription');
      return;
    }
    if (!canAddMore) {
      showAlert('Profile limit reached', `Premium includes ${MAX_TOTAL_MANAGED_PROFILES} profiles total: you plus ${MAX_EXTRA_MANAGED_PROFILES} family profiles.`);
      return;
    }
    if (!isValid) {
      showAlert('Check birth details', dateValidation.error || timeValidation.error || 'Enter a valid name and birth date.');
      return;
    }

    setSaving(true);
    try {
      const birthDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      const birthTime = hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : undefined;
      const resolvedPlace = place.trim() ? await geocodePlace(place.trim()) : null;

      if (place.trim() && !resolvedPlace) {
        showAlert('Place not found', 'Try a city and country, or leave place blank to save without location-specific rising details.');
        return;
      }

      const birthDetails: BirthDetails = {
        date: birthDate,
        time: birthTime,
        place: resolvedPlace ?? undefined,
      };
      const profile = calculateCosmicProfile(birthDate, birthTime, resolvedPlace?.lat, resolvedPlace?.lng);
      const now = new Date().toISOString();
      const managedProfile: ManagedProfile = {
        id: `managed_${Date.now()}`,
        name: name.trim(),
        relation: 'family',
        birthDetails,
        activeSystems: user.activeSystems,
        profile,
        cosmicDNA: getCosmicDNASummary(profile),
        createdAt: now,
        updatedAt: now,
      };

      await addManagedProfile(managedProfile);
      await setActiveProfileId(managedProfile.id);
      resetForm();
      showAlert('Profile added', `${managedProfile.name} is now the active profile.`);
    } finally {
      setSaving(false);
    }
  }, [
    addManagedProfile,
    canAddMore,
    dateValidation.error,
    day,
    hour,
    isValid,
    minute,
    month,
    name,
    place,
    premium,
    router,
    saving,
    setActiveProfileId,
    showAlert,
    timeValidation.error,
    todayParts.day,
    todayParts.month,
    todayParts.year,
    user,
    year,
  ]);

  if (!user) return null;

  return (
    <StarField>
      <ScreenHeader title="Profiles" accentColor={COLORS.iris} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ResetScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.headline}>Switch the chart before you read.</Text>
          <Text style={styles.copy}>
            Premium keeps {MAX_TOTAL_MANAGED_PROFILES} profiles total on this device: your main chart plus {MAX_EXTRA_MANAGED_PROFILES} family charts.
          </Text>

          <GradientCard style={styles.section} accentColor={COLORS.iris}>
            <Text style={styles.sectionLabel}>Active profile</Text>
            <ProfileRow
              title={user.name}
              subtitle="Main account profile"
              active={!activeProfileId}
              onSelect={() => void setActiveProfileId(null)}
            />
            {managedProfiles.map((profile) => (
              <ProfileRow
                key={profile.id}
                title={profile.name}
                subtitle={profile.cosmicDNA}
                active={activeProfileId === profile.id}
                onSelect={() => void setActiveProfileId(profile.id)}
                onRemove={() => {
                  showAlert('Remove profile', `Remove ${profile.name} from this device?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeManagedProfile(profile.id) },
                  ]);
                }}
              />
            ))}
          </GradientCard>

          {!premium ? (
            <GradientCard style={styles.section} accentColor={COLORS.starGold}>
              <Text style={styles.sectionLabel}>Premium profiles</Text>
              <Text style={styles.copy}>Upgrade to create and switch between family profiles.</Text>
              <CosmicButton title="See Premium" onPress={() => router.push('/subscription')} />
            </GradientCard>
          ) : canAddMore ? (
            <GradientCard style={styles.section} accentColor={COLORS.tide}>
              <Text style={styles.sectionLabel}>Add family profile</Text>
              {!showAddForm ? (
                <>
                  <Text style={styles.copy}>Add another chart only when you need to switch the daily reading to someone else.</Text>
                  <CosmicButton title="Add profile" onPress={() => setShowAddForm(true)} />
                </>
              ) : (
                <>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor={COLORS.textMuted}
              />
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={day}
                  onChangeText={(value) => setDay(value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="DD"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={month}
                  onChangeText={(value) => setMonth(value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.yearInput]}
                  value={year}
                  onChangeText={(value) => setYear(value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              {dateValidation.error ? <Text style={styles.errorText}>{dateValidation.error}</Text> : null}

              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={hour}
                  onChangeText={(value) => setHour(value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="HH"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={minute}
                  onChangeText={(value) => setMinute(value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.placeInput]}
                  value={place}
                  onChangeText={setPlace}
                  placeholder="City, country"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              {timeValidation.error ? <Text style={styles.errorText}>{timeValidation.error}</Text> : null}

              <CosmicButton
                title={saving ? 'Adding profile' : 'Add and switch'}
                onPress={() => void handleAddProfile()}
                disabled={!isValid || saving}
                loading={saving}
              />
              <TouchableOpacity style={styles.cancelAddBtn} onPress={() => setShowAddForm(false)} activeOpacity={0.84}>
                <Text style={styles.cancelAddText}>Cancel</Text>
              </TouchableOpacity>
                </>
              )}
            </GradientCard>
          ) : (
            <GradientCard style={styles.section} accentColor={COLORS.starGold}>
              <Text style={styles.sectionLabel}>Profile limit reached</Text>
              <Text style={styles.copy}>Premium includes your main profile plus {MAX_EXTRA_MANAGED_PROFILES} family profiles.</Text>
            </GradientCard>
          )}

          <View style={styles.bottomPad} />
        </ResetScrollView>
      </KeyboardAvoidingView>
      {alertModal}
    </StarField>
  );
}

function ProfileRow({
  title,
  subtitle,
  active,
  onSelect,
  onRemove,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  return (
    <View style={[styles.profileRow, active && styles.profileRowActive]}>
      <TouchableOpacity style={styles.profileBody} onPress={onSelect} activeOpacity={0.84}>
        <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={20} color={active ? COLORS.tide : COLORS.textMuted} />
        <View style={styles.profileText}>
          <Text style={styles.profileTitle}>{title}</Text>
          <Text style={styles.profileSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
      {onRemove ? (
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.84}>
          <Ionicons name="trash-outline" size={17} color={COLORS.coral} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  section: { gap: SPACING.sm },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  profileRowActive: {
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.bgMuted,
  },
  profileBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  profileText: { flex: 1 },
  profileTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  profileSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  removeBtn: {
    padding: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row',
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
    backgroundColor: 'rgba(255,255,255,0.74)',
    fontSize: 16,
    fontWeight: '700',
  },
  dateInput: {
    flex: 1,
    textAlign: 'center',
  },
  yearInput: {
    flex: 1.2,
    textAlign: 'center',
  },
  placeInput: {
    flex: 1.8,
  },
  errorText: {
    color: COLORS.coral,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: FONTS.accent,
  },
  cancelAddBtn: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelAddText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  bottomPad: { height: 20 },
});
