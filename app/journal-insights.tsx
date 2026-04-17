import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StarField } from '../src/components/ui/StarField';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { GradientCard } from '../src/components/ui/GradientCard';
import { EmptyState } from '../src/components/ui/EmptyState';
import { AnimatedCard } from '../src/components/ui/AnimatedScreen';
import { BORDER_RADIUS, COLORS, FONTS, SPACING, TYPE } from '../src/constants/theme';
import { useJournalStore } from '../src/store/journalStore';
import { computeJournalInsights, MOOD_META } from '../src/utils/journalInsights';

export default function JournalInsightsScreen() {
  const entries = useJournalStore((s) => s.entries);
  const insights = useMemo(() => computeJournalInsights(entries), [entries]);

  if (!entries.length) {
    return (
      <StarField>
        <ScreenHeader title="Insights" accentColor={COLORS.iris} />
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="sparkles-outline"
            title="No insights yet"
            body="Write a few journal entries and patterns will appear here."
          />
        </View>
      </StarField>
    );
  }

  const maxWeek = Math.max(1, ...insights.weeklyActivity.map((w) => w.count));
  const topMoodMeta = insights.topMood ? MOOD_META[insights.topMood.mood] : null;

  return (
    <StarField>
      <ScreenHeader title="Insights" accentColor={COLORS.iris} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Patterns in your reflections</Text>

        <AnimatedCard index={0}>
          <View style={styles.statRow}>
            <GradientCard accentColor={COLORS.iris} style={styles.statCard}>
              <Text style={styles.statValue}>{insights.currentStreak}</Text>
              <Text style={styles.statLabel}>Current streak</Text>
              <Text style={styles.statSub}>{insights.currentStreak === 1 ? 'day' : 'days'}</Text>
            </GradientCard>
            <GradientCard accentColor={COLORS.starGold} style={styles.statCard}>
              <Text style={styles.statValue}>{insights.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest streak</Text>
              <Text style={styles.statSub}>{insights.longestStreak === 1 ? 'day' : 'days'}</Text>
            </GradientCard>
          </View>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <View style={styles.statRow}>
            <GradientCard style={styles.statCard}>
              <Text style={styles.statValue}>{insights.last7Count}</Text>
              <Text style={styles.statLabel}>Last 7 days</Text>
              <Text style={styles.statSub}>entries</Text>
            </GradientCard>
            <GradientCard style={styles.statCard}>
              <Text style={styles.statValue}>{insights.last30Count}</Text>
              <Text style={styles.statLabel}>Last 30 days</Text>
              <Text style={styles.statSub}>entries</Text>
            </GradientCard>
          </View>
        </AnimatedCard>

        {topMoodMeta ? (
          <AnimatedCard index={2}>
            <GradientCard accentColor={COLORS.iris}>
              <Text style={styles.sectionLabel}>DOMINANT MOOD (30 DAYS)</Text>
              <View style={styles.topMoodRow}>
                <Text style={styles.topMoodEmoji}>{topMoodMeta.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topMoodName}>{topMoodMeta.label}</Text>
                  <Text style={styles.topMoodSub}>
                    {`${insights.topMood?.count ?? 0} entries \u00B7 ${insights.topMood?.pct ?? 0}% of the window`}
                  </Text>
                </View>
              </View>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        <AnimatedCard index={3}>
          <GradientCard>
            <Text style={styles.sectionLabel}>MOOD BREAKDOWN</Text>
            <View style={styles.moodList}>
              {insights.moodBreakdown.map((row) => {
                const meta = MOOD_META[row.mood];
                return (
                  <View key={row.mood} style={styles.moodRow}>
                    <Text style={styles.moodEmoji}>{meta.emoji}</Text>
                    <Text style={styles.moodName}>{meta.label}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.max(row.pct, row.count ? 4 : 0)}%` }]} />
                    </View>
                    <Text style={styles.moodPct}>{row.pct}%</Text>
                  </View>
                );
              })}
            </View>
          </GradientCard>
        </AnimatedCard>

        <AnimatedCard index={4}>
          <GradientCard>
            <Text style={styles.sectionLabel}>WEEKLY CADENCE</Text>
            <Text style={styles.sectionHint}>Entries per week, last 6 weeks</Text>
            <View style={styles.weekRow}>
              {insights.weeklyActivity.map((week) => {
                const heightPct = (week.count / maxWeek) * 100;
                return (
                  <View key={week.weekStartKey} style={styles.weekCol}>
                    <View style={styles.weekBarWrap}>
                      <View
                        style={[
                          styles.weekBar,
                          { height: `${Math.max(heightPct, week.count ? 8 : 0)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.weekCount}>{week.count}</Text>
                    <Text style={styles.weekLabel}>{week.label}</Text>
                  </View>
                );
              })}
            </View>
          </GradientCard>
        </AnimatedCard>

        {insights.moonPhaseRows.length ? (
          <AnimatedCard index={5}>
            <GradientCard accentColor={COLORS.tide}>
              <Text style={styles.sectionLabel}>MOON PHASE x MOOD</Text>
              <Text style={styles.sectionHint}>Most frequent mood logged under each phase</Text>
              <View style={styles.moonList}>
                {insights.moonPhaseRows.map((row) => {
                  const moodMeta = row.dominantMood ? MOOD_META[row.dominantMood] : null;
                  return (
                    <View key={row.phaseKey} style={styles.moonRow}>
                      <Text style={styles.moonEmoji}>{row.phaseEmoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.moonLabel}>{row.phaseLabel}</Text>
                        <Text style={styles.moonMeta}>
                          {row.total} {row.total === 1 ? 'entry' : 'entries'}
                        </Text>
                      </View>
                      {moodMeta ? (
                        <View style={styles.moonMoodChip}>
                          <Text style={styles.moonMoodEmoji}>{moodMeta.emoji}</Text>
                          <Text style={styles.moonMoodLabel}>{moodMeta.label}</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        <AnimatedCard index={6}>
          <GradientCard>
            <Text style={styles.sectionLabel}>AT A GLANCE</Text>
            <View style={styles.glanceRow}>
              <Text style={styles.glanceLabel}>Total entries</Text>
              <Text style={styles.glanceValue}>{insights.totalEntries}</Text>
            </View>
            <View style={styles.glanceRow}>
              <Text style={styles.glanceLabel}>Avg. words per entry</Text>
              <Text style={styles.glanceValue}>{insights.averageWords}</Text>
            </View>
          </GradientCard>
        </AnimatedCard>

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.md,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  headline: {
    ...TYPE.title,
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: FONTS.display,
  },
  statLabel: {
    color: COLORS.textMuted,
    ...TYPE.label,
    fontFamily: FONTS.accent,
  },
  statSub: {
    color: COLORS.textSecondary,
    ...TYPE.caption,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    ...TYPE.label,
    fontFamily: FONTS.accent,
  },
  sectionHint: {
    color: COLORS.textSecondary,
    ...TYPE.caption,
    marginTop: 2,
  },
  topMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  topMoodEmoji: {
    fontSize: 40,
  },
  topMoodName: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.heading,
  },
  topMoodSub: {
    color: COLORS.textSecondary,
    ...TYPE.bodySmall,
    marginTop: 2,
  },
  moodList: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moodEmoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  moodName: {
    color: COLORS.textPrimary,
    ...TYPE.bodySmall,
    width: 74,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.glassBg,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.iris,
    borderRadius: BORDER_RADIUS.full,
  },
  moodPct: {
    color: COLORS.textMuted,
    ...TYPE.caption,
    width: 36,
    textAlign: 'right',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    height: 120,
  },
  weekCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekBarWrap: {
    flex: 1,
    width: '72%',
    justifyContent: 'flex-end',
  },
  weekBar: {
    width: '100%',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.iris,
    opacity: 0.78,
  },
  weekCount: {
    color: COLORS.textPrimary,
    ...TYPE.caption,
  },
  weekLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  moonList: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  moonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moonEmoji: {
    fontSize: 22,
    width: 28,
    textAlign: 'center',
  },
  moonLabel: {
    color: COLORS.textPrimary,
    ...TYPE.bodySmall,
  },
  moonMeta: {
    color: COLORS.textMuted,
    ...TYPE.caption,
  },
  moonMoodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.iris}44`,
    backgroundColor: `${COLORS.iris}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moonMoodEmoji: {
    fontSize: 13,
  },
  moonMoodLabel: {
    color: COLORS.textPrimary,
    ...TYPE.caption,
    fontFamily: FONTS.accent,
  },
  glanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  glanceLabel: {
    color: COLORS.textSecondary,
    ...TYPE.bodySmall,
  },
  glanceValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.heading,
  },
  bottomPad: {
    height: 40,
  },
});
