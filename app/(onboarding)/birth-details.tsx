import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { updateUserProfile } from '../../src/services/firestoreService';
import type { BirthDetails } from '../../src/types/user';

export default function BirthDetailsScreen() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const emailRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const hourRef = useRef<TextInput>(null);
  const minuteRef = useRef<TextInput>(null);
  const placeRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) {
      e.name = 'Name is required';
    }
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const currentYear = new Date().getFullYear();

    if (!day) e.day = 'Required';
    else if (isNaN(d) || d < 1 || d > 31) e.day = 'Invalid (1–31)';

    if (!month) e.month = 'Required';
    else if (isNaN(m) || m < 1 || m > 12) e.month = 'Invalid (1–12)';

    if (!year) e.year = 'Required';
    else if (isNaN(y) || y < 1900 || y > currentYear) e.year = `Invalid (1900–${currentYear})`;

    if (!e.day && !e.month && !e.year) {
      // Validate day exists in that month/year
      const testDate = new Date(y, m - 1, d);
      if (testDate.getFullYear() !== y || testDate.getMonth() !== m - 1 || testDate.getDate() !== d) {
        e.day = `Day ${d} doesn't exist in that month`;
      }
      // Can't be in the future
      if (testDate > new Date()) {
        e.year = 'Birth date cannot be in the future';
      }
    }

    if (hour) {
      const h = parseInt(hour, 10);
      if (isNaN(h) || h < 0 || h > 23) e.hour = 'Invalid (0–23)';
    }
    if (minute) {
      const min = parseInt(minute, 10);
      if (isNaN(min) || min < 0 || min > 59) e.minute = 'Invalid (0–59)';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const birthDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const birthTimeStr = hour && minute
      ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
      : '12:00';

    const birthDate = new Date(y, m - 1, d);
    const birthDetails: BirthDetails = {
      date: birthDate,
      time: birthTimeStr,
      place: place.trim() ? { name: place.trim(), lat: 0, lng: 0, timezone: 'UTC' } : undefined,
      birthDateStr,
      birthTimeStr,
      birthPlace: place.trim() || 'Unknown',
    } as any;

    const uid = firebaseUser?.uid ?? `local_${Date.now()}`;
    const profile = {
      id: uid,
      name: name.trim(),
      language: 'en',
      birthDetails,
      activeSystems: [] as any[],
      subscription: { tier: 'free' as const, status: 'active' as const, purchasedItems: [] },
      cosmicPoints: 0,
      streak: 0,
      onboardingComplete: false,
      createdAt: new Date(),
    };

    setUser(profile);

    if (firebaseUser) {
      updateUserProfile(firebaseUser.uid, { name: name.trim(), birthDetails } as any).catch(() => {});
    }

    setLoading(false);
    router.push('/(onboarding)/system-picker');
  };

  // Auto-advance helpers
  const handleDay = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setDay(clean);
    setErrors(p => ({ ...p, day: undefined as any }));
    if (clean.length === 2) monthRef.current?.focus();
  };
  const handleMonth = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setMonth(clean);
    setErrors(p => ({ ...p, month: undefined as any }));
    if (clean.length === 2) yearRef.current?.focus();
  };
  const handleYear = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    setYear(clean);
    setErrors(p => ({ ...p, year: undefined as any }));
    if (clean.length === 4) hourRef.current?.focus();
  };
  const handleHour = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setHour(clean);
    setErrors(p => ({ ...p, hour: undefined as any }));
    if (clean.length === 2) minuteRef.current?.focus();
  };
  const handleMinute = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setMinute(clean);
    setErrors(p => ({ ...p, minute: undefined as any }));
    if (clean.length === 2) placeRef.current?.focus();
  };

  return (
    <StarField>
      <ScreenHeader title="Birth ritual" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.step}>Step 1 of 3</Text>
          <Text style={styles.headline}>Tell the chart where{'\n'}your story began.</Text>
          <Text style={styles.copy}>Name and birth date are enough to start. Time and place sharpen the details.</Text>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your name</Text>
            <View style={[styles.inputWrap, errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={t => { setName(t); setErrors(p => ({ ...p, name: undefined as any })); }}
                placeholder="A name to place in the stars"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => dayRef.current?.focus()}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Birth date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Birth date</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateCell}>
                <TextInput
                  ref={dayRef}
                  style={[styles.input, styles.dateInput, errors.day && styles.inputError]}
                  value={day}
                  onChangeText={handleDay}
                  placeholder="DD"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                {errors.day && <Text style={styles.errorText}>{errors.day}</Text>}
              </View>
              <Text style={styles.dateSep}>/</Text>
              <View style={styles.dateCell}>
                <TextInput
                  ref={monthRef}
                  style={[styles.input, styles.dateInput, errors.month && styles.inputError]}
                  value={month}
                  onChangeText={handleMonth}
                  placeholder="MM"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                {errors.month && <Text style={styles.errorText}>{errors.month}</Text>}
              </View>
              <Text style={styles.dateSep}>/</Text>
              <View style={[styles.dateCell, { flex: 1.6 }]}>
                <TextInput
                  ref={yearRef}
                  style={[styles.input, styles.dateInput, errors.year && styles.inputError]}
                  value={year}
                  onChangeText={handleYear}
                  placeholder="YYYY"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="number-pad"
                  maxLength={4}
                  textAlign="center"
                />
                {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
              </View>
            </View>
          </View>

          {/* Birth time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Birth time <Text style={styles.optionalTag}>(optional)</Text></Text>
            <View style={styles.dateRow}>
              <View style={styles.dateCell}>
                <TextInput
                  ref={hourRef}
                  style={[styles.input, styles.dateInput, errors.hour && styles.inputError]}
                  value={hour}
                  onChangeText={handleHour}
                  placeholder="HH"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                {errors.hour && <Text style={styles.errorText}>{errors.hour}</Text>}
              </View>
              <Text style={styles.dateSep}>:</Text>
              <View style={styles.dateCell}>
                <TextInput
                  ref={minuteRef}
                  style={[styles.input, styles.dateInput, errors.minute && styles.inputError]}
                  value={minute}
                  onChangeText={handleMinute}
                  placeholder="MM"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                />
                {errors.minute && <Text style={styles.errorText}>{errors.minute}</Text>}
              </View>
              <View style={{ flex: 1.6, paddingLeft: SPACING.sm }}>
                <Text style={styles.optional}>Needed for rising sign & house timing.</Text>
              </View>
            </View>
          </View>

          {/* Birth place */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Birth place <Text style={styles.optionalTag}>(optional)</Text></Text>
            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={16} color={COLORS.textMuted} style={styles.icon} />
              <TextInput
                ref={placeRef}
                style={styles.input}
                value={place}
                onChangeText={setPlace}
                placeholder="City or town of birth"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>

          <CosmicButton title="Continue" onPress={handleContinue} disabled={!name.trim() || !day || !month || !year} loading={loading} />

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  step: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 36,
    lineHeight: 44,
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  optionalTag: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 11,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: SPACING.md,
    minHeight: 54,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  dateCell: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    minHeight: 54,
    paddingHorizontal: 8,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    flex: undefined,
  },
  dateSep: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 20,
    marginTop: 15,
    paddingHorizontal: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 11,
    marginTop: 3,
    marginLeft: 2,
  },
  optional: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
});
