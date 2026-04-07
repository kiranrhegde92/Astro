import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { updateUserProfile } from '../../src/services/firestoreService';
import type { BirthDetails } from '../../src/types/user';

export default function BirthDetailsScreen() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [place, setPlace] = useState('');

  const isValid = Boolean(name.trim() && day && month && year);

  const handleContinue = async () => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      Alert.alert('Invalid date', 'Please enter a valid birth date.');
      return;
    }

    // Format YYYY-MM-DD for Cloud Function
    const birthDateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const birthTimeStr = hour && minute
      ? `${hour.padStart(2,'0')}:${minute.padStart(2,'0')}`
      : '12:00'; // noon default if unknown

    const birthDate = new Date(y, m - 1, d);
    const birthDetails: BirthDetails = {
      date: birthDate,
      time: birthTimeStr,
      place: place.trim() ? { name: place.trim(), lat: 0, lng: 0, timezone: 'UTC' } : undefined,
      // Store formatted strings for Cloud Function
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

    // Persist name + birth details to Firestore immediately
    if (firebaseUser) {
      updateUserProfile(firebaseUser.uid, {
        name: name.trim(),
        birthDetails,
      } as any).catch(() => {});
    }

    router.push('/(onboarding)/system-picker');
  };

  return (
    <StarField>
      <ScreenHeader title="Birth ritual" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.headline}>Tell the chart where your story began.</Text>
        <Text style={styles.copy}>Name and birth date are enough to start. Time and place sharpen the details if you know them.</Text>

        <GradientCard style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="A name to place in the stars" placeholderTextColor={COLORS.textMuted} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Birth date</Text>
            <View style={styles.dateRow}>
              <TextInput style={[styles.input, styles.small]} value={day} onChangeText={(v) => setDay(v.replace(/\D/g, '').slice(0, 2))} placeholder="DD" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
              <TextInput style={[styles.input, styles.small]} value={month} onChangeText={(v) => setMonth(v.replace(/\D/g, '').slice(0, 2))} placeholder="MM" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
              <TextInput style={[styles.input, styles.year]} value={year} onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={4} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Birth time</Text>
            <View style={styles.dateRow}>
              <TextInput style={[styles.input, styles.small]} value={hour} onChangeText={(v) => setHour(v.replace(/\D/g, '').slice(0, 2))} placeholder="HH" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
              <TextInput style={[styles.input, styles.small]} value={minute} onChangeText={(v) => setMinute(v.replace(/\D/g, '').slice(0, 2))} placeholder="MM" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
              <View style={styles.optionalWrap}>
                <Text style={styles.optional}>Optional, but helpful for rising sign and house timing.</Text>
              </View>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Birth place</Text>
            <TextInput style={styles.input} value={place} onChangeText={setPlace} placeholder="City or town of birth" placeholderTextColor={COLORS.textMuted} />
          </View>
        </GradientCard>

        <CosmicButton title="Continue" onPress={handleContinue} disabled={!isValid} loading={false} />
      </ScrollView>
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
    fontSize: 40,
    lineHeight: 46,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 320,
  },
  formCard: {
    gap: SPACING.md,
  },
  fieldGroup: {
    gap: SPACING.sm,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
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
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  small: {
    flex: 1,
    textAlign: 'center',
  },
  year: {
    flex: 1.4,
    textAlign: 'center',
  },
  optionalWrap: {
    flex: 1.4,
    justifyContent: 'center',
  },
  optional: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
});
