import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { StarField } from '../../src/components/ui/StarField';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { calculateCosmicProfile } from '../../src/engines/unified';
import { useUserStore } from '../../src/store/userStore';
import type { BirthDetails } from '../../src/types/user';
import { geocodePlace } from '../../src/utils/geocoding';

function getDateParts(value: Date) {
  return {
    day: String(value.getDate()).padStart(2, '0'),
    month: String(value.getMonth() + 1).padStart(2, '0'),
    year: String(value.getFullYear()),
  };
}

export default function EditBirthDetailsScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const updateBirthDetails = useUserStore((s) => s.updateBirthDetails);
  const setWesternProfile = useUserStore((s) => s.setWesternProfile);
  const setVedicProfile = useUserStore((s) => s.setVedicProfile);
  const setChineseProfile = useUserStore((s) => s.setChineseProfile);
  const setKPProfile = useUserStore((s) => s.setKPProfile);
  const { showAlert, alertModal } = useCosmicAlert();

  const initialDate = useMemo(() => {
    const raw = user?.birthDetails.date;
    const parsed = raw instanceof Date ? raw : new Date(raw ?? Date.now());
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [user?.birthDetails.date]);
  const initialParts = useMemo(() => getDateParts(initialDate), [initialDate]);
  const [day, setDay] = useState(initialParts.day);
  const [month, setMonth] = useState(initialParts.month);
  const [year, setYear] = useState(initialParts.year);
  const [hour, setHour] = useState(user?.birthDetails.time?.split(':')[0] ?? '');
  const [minute, setMinute] = useState(user?.birthDetails.time?.split(':')[1] ?? '');
  const [place, setPlace] = useState(user?.birthDetails.place?.name ?? '');
  const [saving, setSaving] = useState(false);

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

  const isValid = dateValidation.valid && timeValidation.valid;

  const handleSave = useCallback(async () => {
    if (!user || saving) return;
    if (!isValid) {
      showAlert('Check birth details', dateValidation.error || timeValidation.error);
      return;
    }

    setSaving(true);
    try {
      const birthDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      const birthTime = hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : undefined;
      const trimmedPlace = place.trim();
      const existingPlace = user.birthDetails.place;
      const resolvedPlace = trimmedPlace
        ? existingPlace?.name === trimmedPlace
          ? existingPlace
          : await geocodePlace(trimmedPlace)
        : undefined;

      if (trimmedPlace && !resolvedPlace) {
        showAlert('Place not found', 'Try a city and country, or leave place blank to save without location-specific rising details.');
        return;
      }

      const details: BirthDetails = {
        date: birthDate,
        time: birthTime,
        place: resolvedPlace ?? undefined,
      };
      const profile = calculateCosmicProfile(birthDate, birthTime, resolvedPlace?.lat, resolvedPlace?.lng);

      updateBirthDetails(details);
      setWesternProfile(profile.western);
      setVedicProfile(profile.vedic);
      setChineseProfile(profile.chinese);
      if (profile.kp) setKPProfile(profile.kp);

      showAlert('Birth details updated', 'Your chart has been recalculated with the new details.', [
        { text: 'Stay' },
        { text: 'Back to profile', onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  }, [
    dateValidation.error,
    day,
    hour,
    isValid,
    minute,
    month,
    place,
    router,
    saving,
    setChineseProfile,
    setKPProfile,
    setVedicProfile,
    setWesternProfile,
    showAlert,
    timeValidation.error,
    updateBirthDetails,
    user,
    year,
  ]);

  if (!user) return null;

  return (
    <StarField>
      <ScreenHeader title="Birth details" accentColor={COLORS.iris} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ResetScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.headline}>Tune the chart at its source.</Text>
          <Text style={styles.copy}>Birth time and place sharpen rising sign, house emphasis, and timing details.</Text>

          <GradientCard style={styles.card} accentColor={COLORS.iris}>
            <Text style={styles.label}>Birth date</Text>
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

            <Text style={styles.label}>Birth time</Text>
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
          </GradientCard>

          <CosmicButton
            title={saving ? 'Updating chart' : 'Save and recalculate'}
            onPress={() => void handleSave()}
            disabled={!isValid || saving}
            loading={saving}
          />
        </ResetScrollView>
      </KeyboardAvoidingView>
      {alertModal}
    </StarField>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  card: {
    gap: SPACING.sm,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
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
});
