import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AnimatedCard } from '../src/components/ui/AnimatedScreen';
import { CosmicButton } from '../src/components/ui/CosmicButton';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { StarField } from '../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../src/constants/theme';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useJournalStore } from '../src/store/journalStore';
import { useReadingStore } from '../src/store/readingStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { hasPremiumEntitlement } from '../src/utils/subscription';
import { LinearGradient } from 'expo-linear-gradient';

const FREE_JOURNAL_HISTORY_LIMIT = 5;
import { getDateKey, formatDisplayDate, parseDateKey } from '../src/utils/dateUtils';
import { getMoonPhase } from '../src/utils/moonPhase';
import type { JournalEntry } from '../src/types/appData';

const MOODS: Array<{ value: JournalEntry['mood']; label: string; emoji: string }> = [
  { value: 'clear', label: 'Clear', emoji: '\u2728' },
  { value: 'curious', label: 'Curious', emoji: '\u{1F52D}' },
  { value: 'tender', label: 'Tender', emoji: '\u{1F49C}' },
  { value: 'restless', label: 'Restless', emoji: '\u{1F300}' },
  { value: 'hopeful', label: 'Hopeful', emoji: '\u{1F31F}' },
];

const PROMPTS = [
  'What resonated most from today\'s reading?',
  'What cosmic energy did you feel today?',
  'How did today\'s forecast align with reality?',
  'What are you grateful for today?',
  'What surprised you about today?',
];

function getPromptForDate(date: string): string {
  const dayNum = date.split('-').reduce((acc, v) => acc + parseInt(v, 10), 0);
  return PROMPTS[dayNum % PROMPTS.length];
}

export default function JournalScreen() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const upsertEntry = useJournalStore((s) => s.upsertEntry);
  const removeEntry = useJournalStore((s) => s.removeEntry);
  const todayReading = useReadingStore((s) => s.todayReading);
  const journalLockEnabled = useSettingsStore((s) => s.journalLockEnabled);
  const user = useUserStore((s) => s.user);
  const isPremium = hasPremiumEntitlement(user?.subscription);
  const visibleEntries = isPremium ? entries.slice(0, 20) : entries.slice(0, FREE_JOURNAL_HISTORY_LIMIT);
  const hiddenEntryCount = !isPremium ? Math.max(entries.length - FREE_JOURNAL_HISTORY_LIMIT, 0) : 0;
  const [unlocked, setUnlocked] = useState(!journalLockEnabled);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const requestUnlock = useCallback(async () => {
    setUnlockError(null);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        setUnlocked(true);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Journal',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setUnlocked(true);
      } else {
        setUnlockError('Authentication failed. Try again.');
      }
    } catch {
      setUnlockError('Biometric check is unavailable right now.');
    }
  }, []);

  useEffect(() => {
    if (journalLockEnabled && !unlocked) {
      void requestUnlock();
    }
  }, [journalLockEnabled, unlocked, requestUnlock]);

  const todayKey = getDateKey(new Date());
  const todayEntry = useJournalStore((s) => s.getEntryForDate(todayKey));

  const [composing, setComposing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [mood, setMood] = useState<JournalEntry['mood']>(todayEntry?.mood ?? 'clear');
  const [title, setTitle] = useState(todayEntry?.title ?? '');
  const [body, setBody] = useState(todayEntry?.body ?? '');
  const [draftDate, setDraftDate] = useState(todayKey);
  const [draftCreatedAt, setDraftCreatedAt] = useState<string | null>(todayEntry?.createdAt ?? null);
  const [draftLinkedReadingDate, setDraftLinkedReadingDate] = useState<string | undefined>(todayEntry?.linkedReadingDate);

  const prompt = useMemo(() => getPromptForDate(draftDate), [draftDate]);
  const draftMoonPhase = useMemo(() => getMoonPhase(parseDateKey(draftDate)), [draftDate]);

  const handleSave = useCallback(async () => {
    if (!body.trim()) return;
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: editId ?? `journal_${Date.now()}`,
      date: draftDate,
      prompt,
      title: title.trim() || undefined,
      body: body.trim(),
      mood,
      linkedReadingDate: draftLinkedReadingDate ?? (draftDate === todayKey ? todayReading?.date : undefined),
      moonPhaseKey: draftMoonPhase.key,
      moonPhaseLabel: draftMoonPhase.label,
      moonPhaseEmoji: draftMoonPhase.emoji,
      createdAt: draftCreatedAt ?? now,
      updatedAt: now,
    };
    await upsertEntry(entry);
    setComposing(false);
    setEditId(null);
  }, [body, draftCreatedAt, draftDate, draftLinkedReadingDate, draftMoonPhase, editId, mood, prompt, title, todayKey, todayReading, upsertEntry]);

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEditId(entry.id);
    setDraftDate(entry.date);
    setDraftCreatedAt(entry.createdAt);
    setDraftLinkedReadingDate(entry.linkedReadingDate);
    setMood(entry.mood);
    setTitle(entry.title ?? '');
    setBody(entry.body);
    setComposing(true);
  }, []);

  const handleNew = useCallback(() => {
    if (todayEntry) {
      handleEdit(todayEntry);
    } else {
      setEditId(null);
      setDraftDate(todayKey);
      setDraftCreatedAt(null);
      setDraftLinkedReadingDate(todayReading?.date);
      setMood('clear');
      setTitle('');
      setBody('');
      setComposing(true);
    }
  }, [handleEdit, todayEntry, todayKey, todayReading?.date]);

  if (journalLockEnabled && !unlocked) {
    return (
      <StarField>
        <ScreenHeader title="Journal" accentColor={COLORS.iris} />
        <View style={styles.lockWrap}>
          <EmptyState
            icon="lock-closed-outline"
            title="Journal locked"
            body={unlockError ?? 'Use biometrics to open your private reflections.'}
            ctaLabel="Unlock"
            onCta={() => void requestUnlock()}
          />
        </View>
      </StarField>
    );
  }

  return (
    <StarField>
      <ScreenHeader title="Journal" accentColor={COLORS.iris} />
      <ResetScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headlineRow}>
          <Text style={styles.headline}>Reflect on your cosmic journey</Text>
          {entries.length > 0 ? (
            <TouchableOpacity
              style={styles.insightsBtn}
              onPress={() => router.push('/journal-insights')}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="View journal insights"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="sparkles-outline" size={14} color={COLORS.iris} />
              <Text style={styles.insightsBtnLabel}>Insights</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {composing ? (
          <AnimatedCard index={0}>
            <GradientCard accentColor={COLORS.iris} style={styles.composeCard}>
              <View style={styles.composeHeader}>
                <Text style={styles.composeDate}>{formatDisplayDate(draftDate)}</Text>
                <View style={styles.moonChip}>
                  <Text style={styles.moonChipEmoji}>{draftMoonPhase.emoji}</Text>
                  <Text style={styles.moonChipLabel}>{draftMoonPhase.label}</Text>
                </View>
              </View>
              <Text style={styles.prompt}>{prompt}</Text>

              <Text style={styles.fieldLabel}>How are you feeling?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.moodChip, mood === m.value && styles.moodChipActive]}
                    onPress={() => setMood(m.value)}
                    activeOpacity={0.84}
                    accessibilityRole="button"
                    accessibilityLabel={`Mood: ${m.label}`}
                    accessibilityState={{ selected: mood === m.value }}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, mood === m.value && styles.moodLabelActive]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Title (optional)"
                placeholderTextColor={COLORS.textMuted}
                accessibilityLabel="Entry title"
              />

              <TextInput
                style={styles.bodyInput}
                value={body}
                onChangeText={setBody}
                placeholder="Write your thoughts..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Entry body"
              />

              <View style={styles.composeActions}>
                <CosmicButton title="Save entry" onPress={handleSave} disabled={!body.trim()} />
                <CosmicButton title="Cancel" onPress={() => setComposing(false)} variant="outline" />
              </View>
            </GradientCard>
          </AnimatedCard>
        ) : (
          <AnimatedCard index={0}>
            <CosmicButton
              title={todayEntry ? "Edit today's entry" : "Write today's reflection"}
              onPress={handleNew}
            />
          </AnimatedCard>
        )}

        {entries.length > 0 && !composing ? (
          <AnimatedCard index={1}>
            <Text style={styles.listTitle}>Past entries</Text>
            <View style={styles.entryList}>
              {visibleEntries.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={0.84}
                  onPress={() => handleEdit(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit journal entry from ${formatDisplayDate(entry.date)}`}
                >
                  <GradientCard style={styles.entryCard}>
                    <View style={styles.entryTop}>
                      <Text style={styles.entryDate}>{formatDisplayDate(entry.date)}</Text>
                      <View style={styles.entryBadges}>
                        {entry.moonPhaseEmoji ? (
                          <Text style={styles.entryMoon} accessibilityLabel={entry.moonPhaseLabel}>{entry.moonPhaseEmoji}</Text>
                        ) : null}
                        <Text style={styles.entryMood}>
                          {MOODS.find((m) => m.value === entry.mood)?.emoji ?? ''}
                        </Text>
                      </View>
                    </View>
                    {entry.title ? (
                      <Text style={styles.entryTitle}>{entry.title}</Text>
                    ) : null}
                    <Text style={styles.entryBody} numberOfLines={3}>{entry.body}</Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeEntry(entry.id)}
                      activeOpacity={0.84}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete journal entry from ${formatDisplayDate(entry.date)}`}
                    >
                      <Ionicons name="trash-outline" size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </GradientCard>
                </TouchableOpacity>
              ))}
              {hiddenEntryCount > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => router.push('/subscription')}
                  accessibilityRole="button"
                  accessibilityLabel="Unlock full journal history with Premium"
                  style={styles.journalLockCard}
                >
                  <LinearGradient
                    colors={['rgba(255,208,120,0.18)', 'rgba(172,132,255,0.14)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.journalLockRow}>
                    <Ionicons name="lock-closed" size={16} color={COLORS.starGold} />
                    <View style={styles.journalLockBody}>
                      <Text style={styles.journalLockTitle}>
                        {hiddenEntryCount} older {hiddenEntryCount === 1 ? 'entry' : 'entries'} locked
                      </Text>
                      <Text style={styles.journalLockCopy}>
                        Premium keeps your full reflection history and powers Journal Insights.
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.starGold} />
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          </AnimatedCard>
        ) : null}

        {entries.length === 0 && !composing ? (
          <AnimatedCard index={1}>
            <EmptyState
              icon="journal-outline"
              title="Your journal is empty"
              body="Start by reflecting on today's cosmic reading."
              ctaLabel="Write today's reflection"
              onCta={handleNew}
            />
          </AnimatedCard>
        ) : null}

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  headline: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
  },
  insightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.iris}55`,
    backgroundColor: `${COLORS.iris}18`,
    marginTop: 6,
  },
  insightsBtnLabel: {
    color: COLORS.iris,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  composeCard: {
    gap: SPACING.md,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  moonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.iris}55`,
    backgroundColor: `${COLORS.iris}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moonChipEmoji: {
    fontSize: 14,
  },
  moonChipLabel: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
  },
  entryBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryMoon: {
    fontSize: 14,
  },
  composeDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.9,
  },
  prompt: {
    color: COLORS.iris,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: FONTS.heading,
    fontStyle: 'italic',
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    backgroundColor: COLORS.glassBg,
  },
  moodChipActive: {
    borderColor: COLORS.iris,
    backgroundColor: `${COLORS.iris}18`,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
  },
  moodLabelActive: {
    color: COLORS.textPrimary,
  },
  titleInput: {
    minHeight: 48,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: FONTS.heading,
    backgroundColor: COLORS.glassBg,
  },
  bodyInput: {
    minHeight: 140,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: COLORS.glassBg,
  },
  composeActions: {
    gap: SPACING.sm,
  },
  listTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.heading,
  },
  entryList: {
    gap: SPACING.sm,
  },
  journalLockCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,208,120,0.35)',
    overflow: 'hidden',
    padding: SPACING.md,
  },
  journalLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  journalLockBody: {
    flex: 1,
    gap: 2,
  },
  journalLockTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  journalLockCopy: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  entryCard: {
    gap: 4,
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  entryMood: {
    fontSize: 16,
  },
  entryTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  entryBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bottomPad: {
    height: 40,
  },
  lockWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
});
