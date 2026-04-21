import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { FormInput } from '../../src/components/ui/FormInput';
import { SectionLabel } from '../../src/components/ui/SectionLabel';
import { GlassCard } from '../../src/components/ui/GlassCard';
import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  SPACING,
  TYPE,
} from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { updateUserProfile } from '../../src/services/firestoreService';
import type { BirthDetails } from '../../src/types/user';
import { normalizeLanguage } from '../../src/i18n/language';

export default function BirthDetailsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const setUser = useUserStore((state) => state.setUser);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const hourRef = useRef<TextInput>(null);
  const minuteRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [place, setPlace] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const clearError = useCallback((key: string) => {
    setErrors((p) => ({ ...p, [key]: undefined }));
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('onboarding.birthDetails.errors.nameRequired');

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const currentYear = new Date().getFullYear();

    if (!day) e.day = t('onboarding.birthDetails.errors.required');
    else if (isNaN(d) || d < 1 || d > 31) e.day = t('onboarding.birthDetails.errors.invalidDay');

    if (!month) e.month = t('onboarding.birthDetails.errors.required');
    else if (isNaN(m) || m < 1 || m > 12) e.month = t('onboarding.birthDetails.errors.invalidMonth');

    if (!year) e.year = t('onboarding.birthDetails.errors.required');
    else if (isNaN(y) || y < 1900 || y > currentYear)
      e.year = t('onboarding.birthDetails.errors.invalidYear', { year: currentYear });

    if (!e.day && !e.month && !e.year) {
      const testDate = new Date(y, m - 1, d);
      if (testDate.getFullYear() !== y || testDate.getMonth() !== m - 1 || testDate.getDate() !== d) {
        e.day = t('onboarding.birthDetails.errors.missingDay', { day: d });
      }
      if (testDate > new Date()) {
        e.year = t('onboarding.birthDetails.errors.futureDate');
      }
    }

    if (expanded) {
      if ((hour && !minute) || (!hour && minute)) {
        e.minute = t('onboarding.birthDetails.errors.timePair', {
          defaultValue: 'Enter both hour and minute, or leave both blank',
        });
      } else {
        if (hour) {
          const h = parseInt(hour, 10);
          if (isNaN(h) || h < 0 || h > 23) e.hour = t('onboarding.birthDetails.errors.invalidHour');
        }
        if (minute) {
          const mn = parseInt(minute, 10);
          if (isNaN(mn) || mn < 0 || mn > 59) e.minute = t('onboarding.birthDetails.errors.invalidMinute');
        }
      }
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
    const birthTimeStr = expanded && hour && minute
      ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
      : '12:00';
    const selectedLanguage = normalizeLanguage(i18n.language);

    const birthDate = new Date(y, m - 1, d);
    const birthDetails: BirthDetails = {
      date: birthDate,
      time: birthTimeStr,
      place:
        expanded && place.trim()
          ? { name: place.trim(), lat: 0, lng: 0, timezone: 'UTC' }
          : undefined,
      birthDateStr,
      birthTimeStr,
      birthPlace:
        expanded && place.trim()
          ? place.trim()
          : t('onboarding.birthDetails.unknownPlace', { defaultValue: 'Unknown' }),
    } as any;

    const uid = firebaseUser?.uid ?? `local_${Date.now()}`;
    const profile = {
      id: uid,
      name: name.trim(),
      language: selectedLanguage,
      birthDetails,
      activeSystems: [] as any[],
      subscription: { tier: 'free' as const, status: 'active' as const },
      cosmicPoints: 0,
      streak: 0,
      onboardingComplete: false,
      createdAt: new Date(),
      referralCode: '',
      referralCount: 0,
    };

    setUser(profile);

    if (firebaseUser) {
      const clean = JSON.parse(
        JSON.stringify({ name: name.trim(), birthDetails, language: selectedLanguage }),
      );
      updateUserProfile(firebaseUser.uid, clean).catch((er) => {
        console.warn('[BirthDetails] Firestore sync failed:', er);
      });
    }

    setLoading(false);
    router.push('/(onboarding)/system-picker');
  };

  const handleDay = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setDay(clean);
    clearError('day');
    if (clean.length === 2) monthRef.current?.focus();
  };
  const handleMonth = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setMonth(clean);
    clearError('month');
    if (clean.length === 2) yearRef.current?.focus();
  };
  const handleYear = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    setYear(clean);
    clearError('year');
    if (clean.length === 4 && expanded) hourRef.current?.focus();
  };
  const handleHour = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setHour(clean);
    clearError('hour');
    if (clean.length === 2) minuteRef.current?.focus();
  };
  const handleMinute = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 2);
    setMinute(clean);
    clearError('minute');
  };

  const canContinue = useMemo(
    () => Boolean(name.trim() && day && month && year && !loading),
    [name, day, month, year, loading],
  );

  return (
    <StarField>
      <ScreenHeader title={t('onboarding.birthDetails.screenTitle')} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ResetScrollView
          contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(60).duration(400).springify().damping(20)}>
            <SectionLabel accent={COLORS.gold}>
              {t('onboarding.birthDetails.step')}
            </SectionLabel>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(420).springify().damping(20)}>
            <Text style={styles.headline}>{t('onboarding.birthDetails.headline')}</Text>
            <Text style={styles.copy}>{t('onboarding.birthDetails.copy')}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(240).duration(400).springify().damping(20)}
            style={styles.fieldGroup}
          >
            <FormInput
              label={t('onboarding.birthDetails.nameLabel')}
              icon="person-outline"
              value={name}
              onChangeText={(v) => {
                setName(v);
                clearError('name');
              }}
              placeholder={t('onboarding.birthDetails.namePlaceholder')}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => dayRef.current?.focus()}
              error={errors.name}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(340).duration(400).springify().damping(20)}
            style={styles.fieldGroup}
          >
            <View style={styles.dateHeader}>
              <Text style={styles.dateLabel}>
                {t('onboarding.birthDetails.dateLabel').toUpperCase()}
              </Text>
            </View>
            <GlassCard padding={SPACING.md} accentColor={COLORS.gold}>
              <View style={styles.dateRow}>
                <DateCell
                  innerRef={dayRef}
                  value={day}
                  onChange={handleDay}
                  placeholder="DD"
                  error={errors.day}
                  a11y="Day"
                />
                <Text style={styles.dateSep}>/</Text>
                <DateCell
                  innerRef={monthRef}
                  value={month}
                  onChange={handleMonth}
                  placeholder="MM"
                  error={errors.month}
                  a11y="Month"
                />
                <Text style={styles.dateSep}>/</Text>
                <DateCell
                  innerRef={yearRef}
                  value={year}
                  onChange={handleYear}
                  placeholder="YYYY"
                  error={errors.year}
                  a11y="Year"
                  flex={1.6}
                  maxLength={4}
                />
              </View>
              {(errors.day || errors.month || errors.year) && (
                <Text style={styles.errorLine}>
                  {errors.day ?? errors.month ?? errors.year}
                </Text>
              )}
            </GlassCard>
          </Animated.View>

          <Animated.View
            layout={LinearTransition.duration(280)}
            entering={FadeInDown.delay(440).duration(400).springify().damping(20)}
            style={styles.fieldGroup}
          >
            <Pressable
              onPress={() => setExpanded((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                expanded
                  ? t('onboarding.birthDetails.hideOptional', {
                      defaultValue: 'Hide birth time & place',
                    })
                  : t('onboarding.birthDetails.showOptional', {
                      defaultValue: 'Add birth time & place for a deeper read',
                    })
              }
              style={({ pressed }) => [
                styles.toggleRow,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.toggleIcon}>
                <Ionicons
                  name={expanded ? 'remove' : 'add'}
                  size={18}
                  color={COLORS.gold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>
                  {expanded
                    ? t('onboarding.birthDetails.hideOptional', {
                        defaultValue: 'Hide birth time & place',
                      })
                    : t('onboarding.birthDetails.showOptional', {
                        defaultValue: 'Add birth time & place',
                      })}
                </Text>
                <Text style={styles.toggleCaption}>
                  {t('onboarding.birthDetails.whyTime')}
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {expanded ? (
            <Animated.View
              entering={FadeInUp.duration(360).springify().damping(20)}
              style={styles.fieldGroup}
            >
              <View style={styles.dateHeader}>
                <Text style={styles.dateLabel}>
                  {t('onboarding.birthDetails.timeLabel').toUpperCase()}{' '}
                  <Text style={styles.optionalTag}>
                    {t('onboarding.birthDetails.optional')}
                  </Text>
                </Text>
              </View>
              <GlassCard padding={SPACING.md}>
                <View style={styles.dateRow}>
                  <DateCell
                    innerRef={hourRef}
                    value={hour}
                    onChange={handleHour}
                    placeholder="HH"
                    error={errors.hour}
                    a11y="Hour"
                  />
                  <Text style={styles.dateSep}>:</Text>
                  <DateCell
                    innerRef={minuteRef}
                    value={minute}
                    onChange={handleMinute}
                    placeholder="MM"
                    error={errors.minute}
                    a11y="Minute"
                  />
                  <View style={{ flex: 1.6 }} />
                </View>
                {(errors.hour || errors.minute) && (
                  <Text style={styles.errorLine}>
                    {errors.hour ?? errors.minute}
                  </Text>
                )}
              </GlassCard>

              <View style={{ height: SPACING.sm }} />
              <FormInput
                label={t('onboarding.birthDetails.placeLabel')}
                icon="location-outline"
                value={place}
                onChangeText={setPlace}
                placeholder={t('onboarding.birthDetails.placePlaceholder')}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </Animated.View>
          ) : null}

          <Animated.View
            layout={LinearTransition.duration(280)}
            entering={FadeInDown.delay(540).duration(400).springify().damping(20)}
          >
            <CosmicButton
              title={t('onboarding.birthDetails.continue')}
              onPress={handleContinue}
              disabled={!canContinue}
              loading={loading}
            />
          </Animated.View>

          <View style={{ height: SPACING.xxl }} />
        </ResetScrollView>
      </KeyboardAvoidingView>
    </StarField>
  );
}

interface DateCellProps {
  innerRef?: React.RefObject<TextInput | null>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  a11y: string;
  flex?: number;
  maxLength?: number;
}

function DateCell({
  innerRef,
  value,
  onChange,
  placeholder,
  error,
  a11y,
  flex = 1,
  maxLength = 2,
}: DateCellProps) {
  return (
    <View style={{ flex }}>
      <TextInput
        ref={innerRef}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType="number-pad"
        maxLength={maxLength}
        textAlign="center"
        selectTextOnFocus
        selectionColor={COLORS.gold}
        accessibilityLabel={a11y}
        style={[
          dateStyles.input,
          error ? dateStyles.inputError : null,
          value ? dateStyles.inputFilled : null,
        ]}
      />
    </View>
  );
}

const dateStyles = StyleSheet.create({
  input: {
    minHeight: 48,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgMuted,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    fontSize: 18,
    letterSpacing: 1,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm + 2,
  },
  inputFilled: {
    borderColor: 'rgba(241,183,79,0.45)',
    backgroundColor: 'rgba(241,183,79,0.06)',
  },
  inputError: {
    borderColor: COLORS.error,
  },
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  containerDesktop: {
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: SPACING.lg,
  },
  headline: {
    ...TYPE.title,
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
    marginTop: SPACING.xs,
  },
  copy: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    marginTop: SPACING.sm,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  dateHeader: {
    marginBottom: 4,
  },
  dateLabel: {
    ...TYPE.label,
    color: COLORS.textMuted,
    fontFamily: FONTS.accent,
  },
  optionalTag: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'none',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateSep: {
    color: COLORS.textMuted,
    fontFamily: FONTS.heading,
    fontSize: 22,
    paddingHorizontal: 2,
  },
  errorLine: {
    ...TYPE.caption,
    color: COLORS.error,
    fontFamily: FONTS.body,
    marginTop: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderStyle: 'dashed',
  },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(241,183,79,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(241,183,79,0.38)',
  },
  toggleTitle: {
    ...TYPE.subhead,
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
  },
  toggleCaption: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    marginTop: 2,
  },
});
