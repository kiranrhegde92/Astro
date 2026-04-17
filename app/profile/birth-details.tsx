import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { FormInput } from '../../src/components/ui/FormInput';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { StarField } from '../../src/components/ui/StarField';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import {
  createBirthCorrectionRequest,
  getPendingBirthCorrectionRequest,
  type BirthCorrectionRequest,
} from '../../src/services/firestoreService';

function coerceDate(value?: Date | string | number | null) {
  const parsed = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getDateParts(value: Date) {
  return {
    day: String(value.getDate()).padStart(2, '0'),
    month: String(value.getMonth() + 1).padStart(2, '0'),
    year: String(value.getFullYear()),
  };
}

function formatDate(value?: Date | string | number | null) {
  const date = coerceDate(value);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BirthDetailCorrectionScreen() {
  const user = useUserStore((s) => s.user);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const { showAlert, alertModal } = useCosmicAlert();

  const initialDate = useMemo(() => coerceDate(user?.birthDetails.date), [user?.birthDetails.date]);
  const initialParts = useMemo(() => getDateParts(initialDate), [initialDate]);
  const initialHour = user?.birthDetails.time?.split(':')[0] ?? '';
  const initialMinute = user?.birthDetails.time?.split(':')[1] ?? '';

  const [day, setDay] = useState(initialParts.day);
  const [month, setMonth] = useState(initialParts.month);
  const [year, setYear] = useState(initialParts.year);
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [place, setPlace] = useState(user?.birthDetails.place?.name ?? '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<BirthCorrectionRequest | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setLoadingExisting(false);
      return;
    }
    getPendingBirthCorrectionRequest(user.id)
      .then((req) => {
        if (!cancelled) setExistingRequest(req);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const dateValidation = useMemo(() => {
    if (!day || !month || !year) return { valid: false, error: 'Corrected birth date is required' };
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

  const noteError = note.trim().length >= 10
    ? ''
    : 'Add a short note so support can review the correction.';
  const isValid = dateValidation.valid && timeValidation.valid && !noteError;

  const handleSubmit = useCallback(async () => {
    if (!user || submitting) return;
    if (existingRequest) return;
    if (!isValid) {
      showAlert('Check the request', dateValidation.error || timeValidation.error || noteError);
      return;
    }

    setSubmitting(true);
    try {
      const requestedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      const requestedTime = hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : null;
      const requestedPlace = place.trim() || null;

      const id = await createBirthCorrectionRequest({
        uid: user.id,
        userName: user.name,
        userEmail: firebaseUser?.email ?? null,
        currentDetails: {
          date: coerceDate(user.birthDetails.date).toISOString(),
          time: user.birthDetails.time ?? null,
          place: user.birthDetails.place?.name ?? null,
        },
        requestedDetails: {
          date: requestedDate.toISOString(),
          time: requestedTime,
          place: requestedPlace,
        },
        reason: note.trim(),
      });

      setExistingRequest({
        id,
        uid: user.id,
        userName: user.name,
        userEmail: firebaseUser?.email ?? null,
        currentDetails: {
          date: coerceDate(user.birthDetails.date).toISOString(),
          time: user.birthDetails.time ?? null,
          place: user.birthDetails.place?.name ?? null,
        },
        requestedDetails: {
          date: requestedDate.toISOString(),
          time: requestedTime,
          place: requestedPlace,
        },
        reason: note.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        reviewerNote: null,
      });

      showAlert(
        'Correction request submitted',
        'Support will review your request. Your chart stays locked until the review is complete.'
      );
    } catch {
      showAlert('Could not submit', 'Your correction request did not go through. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    dateValidation.error,
    day,
    existingRequest,
    firebaseUser?.email,
    hour,
    isValid,
    minute,
    month,
    note,
    noteError,
    place,
    showAlert,
    submitting,
    timeValidation.error,
    user,
    year,
  ]);

  if (!user) return null;

  return (
    <StarField>
      <ScreenHeader title="Birth correction" accentColor={COLORS.iris} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ResetScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.headline}>Birth details stay locked after setup.</Text>
          <Text style={styles.copy}>
            Send a correction request if something was entered wrong. Support will review it before any chart data changes.
          </Text>

          {existingRequest ? (
            <GradientCard style={styles.noticeCard} accentColor={COLORS.starGold}>
              <Text style={styles.label}>Request pending review</Text>
              <Text style={styles.copy}>
                Your correction request from {formatDate(existingRequest.createdAt)} is in the review queue. You can submit another once it is resolved.
              </Text>
            </GradientCard>
          ) : null}

          <GradientCard style={styles.card} accentColor={COLORS.iris}>
            <Text style={styles.label}>Current details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(user.birthDetails.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{user.birthDetails.time || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRowNoBorder}>
              <Text style={styles.detailLabel}>Place</Text>
              <Text style={styles.detailValue}>{user.birthDetails.place?.name || 'Not provided'}</Text>
            </View>
          </GradientCard>

          <GradientCard style={styles.card} accentColor={COLORS.tide}>
            <Text style={styles.label}>Correct details</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={day}
                onChangeText={(value) => setDay(value.replace(/\D/g, '').slice(0, 2))}
                placeholder="DD"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="Day of birth"
              />
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={month}
                onChangeText={(value) => setMonth(value.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="Month of birth"
              />
              <TextInput
                style={[styles.input, styles.yearInput]}
                value={year}
                onChangeText={(value) => setYear(value.replace(/\D/g, '').slice(0, 4))}
                placeholder="YYYY"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                accessibilityLabel="Year of birth"
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
                accessibilityLabel="Hour of birth"
              />
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={minute}
                onChangeText={(value) => setMinute(value.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="Minute of birth"
              />
              <TextInput
                style={[styles.input, styles.placeInput]}
                value={place}
                onChangeText={setPlace}
                placeholder="City, country"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
                accessibilityLabel="Place of birth"
              />
            </View>
            {timeValidation.error ? <Text style={styles.errorText}>{timeValidation.error}</Text> : null}

            <FormInput
              label="Reason for correction"
              icon="document-text-outline"
              value={note}
              onChangeText={setNote}
              placeholder="What needs to be corrected?"
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              inputStyle={styles.noteInputText}
              error={note.length > 0 && noteError ? noteError : null}
            />
          </GradientCard>

          <GradientCard style={styles.noticeCard} accentColor={COLORS.starGold}>
            <Text style={styles.label}>Manual review</Text>
            <Text style={styles.copy}>
              Your request is stored in our review queue. Support updates your chart once it is approved.
            </Text>
          </GradientCard>

          <CosmicButton
            title={
              existingRequest
                ? 'Request pending review'
                : submitting
                ? 'Submitting'
                : 'Submit correction request'
            }
            onPress={() => void handleSubmit()}
            disabled={!isValid || submitting || loadingExisting || !!existingRequest}
            loading={submitting}
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
  noticeCard: {
    gap: SPACING.xs,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  detailRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingVertical: 8,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.accent,
  },
  detailValue: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: FONTS.heading,
    textAlign: 'right',
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
    backgroundColor: COLORS.glassBg,
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
  noteInputText: {
    minHeight: 96,
    lineHeight: 22,
  },
  errorText: {
    color: COLORS.coral,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: FONTS.accent,
  },
});
