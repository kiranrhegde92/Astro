import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCard } from '../src/components/ui/AnimatedScreen';
import { CosmicButton } from '../src/components/ui/CosmicButton';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { StarField } from '../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../src/constants/theme';
import { useJournalStore } from '../src/store/journalStore';
import { useReadingStore } from '../src/store/readingStore';
import { getDateKey, formatDisplayDate } from '../src/utils/dateUtils';
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
      createdAt: draftCreatedAt ?? now,
      updatedAt: now,
    };
    await upsertEntry(entry);
    setComposing(false);
    setEditId(null);
  }, [body, draftCreatedAt, draftDate, draftLinkedReadingDate, editId, mood, prompt, title, todayKey, todayReading, upsertEntry]);

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

  return (
    <StarField>
      <ScreenHeader title="Journal" accentColor={COLORS.iris} />
      <ResetScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Reflect on your cosmic journey</Text>

        {composing ? (
          <AnimatedCard index={0}>
            <GradientCard accentColor={COLORS.iris} style={styles.composeCard}>
              <Text style={styles.composeDate}>{formatDisplayDate(draftDate)}</Text>
              <Text style={styles.prompt}>{prompt}</Text>

              <Text style={styles.fieldLabel}>How are you feeling?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.moodChip, mood === m.value && styles.moodChipActive]}
                    onPress={() => setMood(m.value)}
                    activeOpacity={0.84}
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
              />

              <TextInput
                style={styles.bodyInput}
                value={body}
                onChangeText={setBody}
                placeholder="Write your thoughts..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                textAlignVertical="top"
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
              {entries.slice(0, 20).map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={0.84}
                  onPress={() => handleEdit(entry)}
                >
                  <GradientCard style={styles.entryCard}>
                    <View style={styles.entryTop}>
                      <Text style={styles.entryDate}>{formatDisplayDate(entry.date)}</Text>
                      <Text style={styles.entryMood}>
                        {MOODS.find((m) => m.value === entry.mood)?.emoji ?? ''}
                      </Text>
                    </View>
                    {entry.title ? (
                      <Text style={styles.entryTitle}>{entry.title}</Text>
                    ) : null}
                    <Text style={styles.entryBody} numberOfLines={3}>{entry.body}</Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeEntry(entry.id)}
                      activeOpacity={0.84}
                    >
                      <Ionicons name="trash-outline" size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </GradientCard>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>
        ) : null}

        {entries.length === 0 && !composing ? (
          <AnimatedCard index={1}>
            <GradientCard>
              <Text style={styles.emptyText}>
                Your journal is empty. Start by reflecting on today's cosmic reading.
              </Text>
            </GradientCard>
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
  headline: {
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
  },
  composeCard: {
    gap: SPACING.md,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    minHeight: 44,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: FONTS.heading,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bodyInput: {
    minHeight: 120,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
});
