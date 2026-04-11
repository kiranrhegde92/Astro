import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { SectionTabs } from '../../src/components/ui/SectionTabs';
import { StarField } from '../../src/components/ui/StarField';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useJournalStore } from '../../src/store/journalStore';
import { useReadingStore } from '../../src/store/readingStore';
import { formatDisplayDate, getDateKey } from '../../src/utils/dateUtils';

const MOODS = [
  { value: 'clear', label: 'Clear' },
  { value: 'curious', label: 'Curious' },
  { value: 'tender', label: 'Tender' },
  { value: 'restless', label: 'Restless' },
  { value: 'hopeful', label: 'Hopeful' },
] as const;

export default function CosmosScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('write');
  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);
  const getCachedReading = useReadingStore((state) => state.getCachedReading);
  const getRecentReadings = useReadingStore((state) => state.getRecentReadings);
  const entries = useJournalStore((state) => state.entries);
  const getEntryForDate = useJournalStore((state) => state.getEntryForDate);
  const upsertEntry = useJournalStore((state) => state.upsertEntry);
  const removeEntry = useJournalStore((state) => state.removeEntry);

  const todayReading = getCachedReading(todayKey);
  const currentEntry = getEntryForDate(todayKey);
  const [note, setNote] = useState(currentEntry?.body ?? '');
  const [title, setTitle] = useState(currentEntry?.title ?? '');
  const [mood, setMood] = useState<(typeof MOODS)[number]['value']>(currentEntry?.mood ?? 'clear');

  useEffect(() => {
    setNote(currentEntry?.body ?? '');
    setTitle(currentEntry?.title ?? '');
    setMood(currentEntry?.mood ?? 'clear');
  }, [currentEntry?.body, currentEntry?.mood, currentEntry?.title]);

  const prompt =
    todayReading?.unified.affirmation ??
    'What did today reveal that you would have missed without slowing down?';
  const archive = getRecentReadings(10);
  const tabs = [
    { key: 'write', label: 'Write' },
    { key: 'archive', label: 'Archive' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleSave = async () => {
    if (!note.trim()) return;
    await upsertEntry({
      id: currentEntry?.id ?? `journal_${todayKey}`,
      date: todayKey,
      prompt,
      title: title.trim() || undefined,
      body: note.trim(),
      mood,
      linkedReadingDate: todayReading?.date,
      createdAt: currentEntry?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <StarField>
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Notes</Text>
        <Text style={styles.headline}>Keep the parts of the reading that stayed with you.</Text>
        <Text style={styles.copy}>
          This is your private sky log: one place for reflections, prompts, and the last few readings that shaped the week.
        </Text>
        <SectionTabs tabs={tabs} activeKey={activeSection} onChange={setActiveSection} />

        {activeSection === 'write' && (
          <>
            <GradientCard accentColor={COLORS.tide}>
              <Text style={styles.promptLabel}>Tonight&apos;s prompt</Text>
              <Text style={styles.promptText}>{prompt}</Text>
            </GradientCard>

            <GradientCard accentColor={COLORS.iris} style={styles.journalCard}>
              <Text style={styles.sectionLabel}>Today&apos;s note</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Give this feeling a title"
                placeholderTextColor={COLORS.textMuted}
                style={styles.titleInput}
              />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Write what landed, what shifted, or what still feels unresolved."
                placeholderTextColor={COLORS.textMuted}
                style={styles.noteInput}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.moodRow}>
                {MOODS.map((option) => {
                  const active = option.value === mood;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setMood(option.value)}
                      style={[styles.moodChip, active && styles.moodChipActive]}
                      activeOpacity={0.84}
                    >
                      <Text style={[styles.moodText, active && styles.moodTextActive]}>{option.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.actionRow}>
                <CosmicButton title={currentEntry ? 'Update note' : 'Save note'} onPress={handleSave} />
                {currentEntry ? (
                  <CosmicButton title="Delete" onPress={() => void removeEntry(currentEntry.id)} variant="outline" />
                ) : null}
              </View>
            </GradientCard>
          </>
        )}

        {activeSection === 'archive' && (
          <GradientCard style={styles.archiveCard} accentColor={COLORS.gold}>
            <Text style={styles.sectionLabel}>Reading archive</Text>
            {archive.length ? (
              archive.map((reading) => {
                const linkedEntry = entries.find((entry) => entry.linkedReadingDate === reading.date);
                return (
                  <View key={reading.date} style={styles.archiveItem}>
                    <View style={styles.archiveMeta}>
                      <Text style={styles.archiveDate}>{formatDisplayDate(reading.date)}</Text>
                      {linkedEntry ? <Text style={styles.archiveBadge}>Journaled</Text> : null}
                    </View>
                    <Text style={styles.archiveVibe}>{reading.unified.cosmicVibe}</Text>
                    <Text style={styles.archiveAffirmation}>"{reading.unified.affirmation}"</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Your reading archive will appear here as you keep opening the app.</Text>
            )}
          </GradientCard>
        )}

        {activeSection === 'notes' && (
          <GradientCard style={styles.entriesCard} accentColor={COLORS.coral}>
            <View style={styles.entriesHeader}>
              <Text style={styles.sectionLabel}>Recent notes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/today')} activeOpacity={0.84}>
                <Text style={styles.entriesLink}>Back to today</Text>
              </TouchableOpacity>
            </View>

            {entries.length ? (
              entries.slice(0, 8).map((entry) => (
                <View key={entry.id} style={styles.entryItem}>
                  <View style={styles.entryTop}>
                    <Text style={styles.entryDate}>{formatDisplayDate(entry.date)}</Text>
                    <Text style={styles.entryMood}>{entry.mood}</Text>
                  </View>
                  {entry.title ? <Text style={styles.entryTitle}>{entry.title}</Text> : null}
                  <Text style={styles.entryBody}>{entry.body}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No notes yet. Save one tonight and this page becomes your personal archive.</Text>
            )}
          </GradientCard>
        )}
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 38,
    lineHeight: 44,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 320,
  },
  promptLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  promptText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: FONTS.heading,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  journalCard: {
    gap: SPACING.sm,
  },
  titleInput: {
    minHeight: 48,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.78)',
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  noteInput: {
    minHeight: 150,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.78)',
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  moodChip: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  moodChipActive: {
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.bgMuted,
  },
  moodText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  moodTextActive: {
    color: COLORS.textPrimary,
  },
  actionRow: {
    gap: SPACING.md,
  },
  archiveCard: {
    gap: SPACING.sm,
  },
  archiveItem: {
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  archiveMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  archiveDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  archiveBadge: {
    color: COLORS.tide,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  archiveVibe: {
    color: COLORS.textPrimary,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  archiveAffirmation: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  entriesCard: {
    gap: SPACING.sm,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    alignItems: 'center',
  },
  entriesLink: {
    color: COLORS.coral,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  entryItem: {
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  entryDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  entryMood: {
    color: COLORS.coral,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    textTransform: 'capitalize',
  },
  entryTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  entryBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
