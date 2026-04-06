import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import type { BirthDetails } from '../../src/types/user';

export default function BirthDetailsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setUser = useUserStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [place, setPlace] = useState('');

  const isValid = name.trim() && day && month && year;

  const handleContinue = () => {
    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );

    const birthDetails: BirthDetails = {
      date: birthDate,
      time: hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : undefined,
      place: place
        ? { name: place, lat: 0, lng: 0, timezone: 'UTC' }
        : undefined,
    };

    setUser({
      id: `user_${Date.now()}`,
      name: name.trim(),
      language: 'en',
      birthDetails,
      activeSystems: [],
      subscription: {
        tier: 'free',
        status: 'active',
        purchasedItems: [],
      },
      cosmicPoints: 0,
      streak: 0,
      onboardingComplete: false,
      createdAt: new Date(),
    });

    router.push('/(onboarding)/system-picker');
  };

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.spacer} />

        <GlowText size="xl" align="center">
          {t('onboarding.birthDetails.title')}
        </GlowText>
        <Text style={styles.subtitle}>
          {t('onboarding.birthDetails.subtitle')}
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('onboarding.birthDetails.dateLabel')}</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={day}
                onChangeText={(v) => setDay(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="DD"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={month}
                onChangeText={(v) => setMonth(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.yearInput]}
                value={year}
                onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))}
                placeholder="YYYY"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              {t('onboarding.birthDetails.timeLabel')}
            </Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={hour}
                onChangeText={(v) => setHour(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="HH"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={minute}
                onChangeText={(v) => setMinute(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <Text style={styles.hint}>
              {t('onboarding.birthDetails.whyTime')}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('onboarding.birthDetails.placeLabel')}</Text>
            <TextInput
              style={styles.input}
              value={place}
              onChangeText={setPlace}
              placeholder={t('onboarding.birthDetails.placePlaceholder')}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <CosmicButton
            title={t('onboarding.birthDetails.continue')}
            onPress={handleContinue}
            disabled={!isValid}
          />
        </View>
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  spacer: {
    height: 60,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  form: {
    gap: SPACING.lg,
  },
  field: {
    gap: SPACING.xs,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    textAlign: 'center',
  },
  yearInput: {
    flex: 1.5,
    textAlign: 'center',
  },
  timeSeparator: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: SPACING.xl,
  },
});
