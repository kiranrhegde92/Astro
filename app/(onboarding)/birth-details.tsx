import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
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

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(formY, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = () => {
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const birthDetails: BirthDetails = {
      date: birthDate,
      time: hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : undefined,
      place: place ? { name: place, lat: 0, lng: 0, timezone: 'UTC' } : undefined,
    };
    setUser({
      id: `user_${Date.now()}`,
      name: name.trim(),
      language: 'en',
      birthDetails,
      activeSystems: [],
      subscription: { tier: 'free', status: 'active', purchasedItems: [] },
      cosmicPoints: 0,
      streak: 0,
      onboardingComplete: false,
      createdAt: new Date(),
    });
    router.push('/(onboarding)/system-picker');
  };

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.inner, { opacity: formOpacity, transform: [{ translateY: formY }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🌙</Text>
            <GlowText size="xl" align="center">{t('onboarding.birthDetails.title')}</GlowText>
            <Text style={styles.subtitle}>{t('onboarding.birthDetails.subtitle')}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Field label="YOUR NAME">
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor={COLORS.textMuted} />
            </Field>

            <Field label={t('onboarding.birthDetails.dateLabel')}>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.small]} value={day} onChangeText={(v) => setDay(v.replace(/\D/g, '').slice(0, 2))} placeholder="DD" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
                <TextInput style={[styles.input, styles.small]} value={month} onChangeText={(v) => setMonth(v.replace(/\D/g, '').slice(0, 2))} placeholder="MM" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
                <TextInput style={[styles.input, styles.medium]} value={year} onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={4} />
              </View>
            </Field>

            <Field label={t('onboarding.birthDetails.timeLabel')}>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.small]} value={hour} onChangeText={(v) => setHour(v.replace(/\D/g, '').slice(0, 2))} placeholder="HH" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
                <Text style={styles.colon}>:</Text>
                <TextInput style={[styles.input, styles.small]} value={minute} onChangeText={(v) => setMinute(v.replace(/\D/g, '').slice(0, 2))} placeholder="MM" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
              </View>
              <Text style={styles.hint}>{t('onboarding.birthDetails.whyTime')}</Text>
            </Field>

            <Field label={t('onboarding.birthDetails.placeLabel')}>
              <TextInput style={styles.input} value={place} onChangeText={setPlace} placeholder={t('onboarding.birthDetails.placePlaceholder')} placeholderTextColor={COLORS.textMuted} />
            </Field>
          </View>

          {/* CTA */}
          <AnimatedPressable onPress={handleContinue} style={!isValid ? styles.disabled : undefined}>
            <View style={styles.ctaShadow}>
              <LinearGradient
                colors={isValid
                  ? ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.05)']
                  : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.full }]}
                  pointerEvents="none"
                />
                <Text style={styles.ctaText}>{t('onboarding.birthDetails.continue')}</Text>
                <Ionicons name="arrow-forward" size={16} color={isValid ? '#fff' : 'rgba(255,255,255,0.3)'} style={{ marginLeft: 6 }} />
              </LinearGradient>
            </View>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </StarField>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 58 },
  inner: { gap: SPACING.lg },
  header: { alignItems: 'center', gap: SPACING.xs },
  headerEmoji: { fontSize: 44 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },

  form: { gap: SPACING.lg },
  field: { gap: 6 },
  label: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 9,
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  small: { flex: 1, textAlign: 'center' },
  medium: { flex: 1.5, textAlign: 'center' },
  colon: { color: 'rgba(255,255,255,0.40)', fontSize: 22, fontWeight: '300' },
  hint: { color: COLORS.textMuted, fontSize: 11, fontStyle: 'italic', marginTop: 2 },

  disabled: { opacity: 0.40 },
  ctaShadow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 18,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  ctaText: { color: '#fff', fontSize: 15, fontFamily: 'Cinzel_700Bold', letterSpacing: 1 },
});
