import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { useReadingStore } from '../../src/store/readingStore';
import { useUserStore } from '../../src/store/userStore';
import { getDateKey, formatDisplayDate } from '../../src/utils/dateUtils';
import { hasPremiumEntitlement } from '../../src/utils/subscription';

const FREE_ARCHIVE_DAYS = 3;
const WEEK_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ArchiveReadingScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const getCachedReading = useReadingStore((s) => s.getCachedReading);
  const reading = date ? getCachedReading(date) : null;

  if (date) {
    return <ArchiveReadingView reading={reading} />;
  }

  return <ArchiveMonthView />;
}

function ArchiveReadingView({ reading }: { reading: ReturnType<typeof useReadingStore.getState>['cachedReadings'][string] | null }) {
  if (!reading) {
    return (
      <StarField>
        <ScreenHeader title="Past reading" />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Reading not found</Text>
          <Text style={styles.emptyCopy}>This reading may have expired from the local cache.</Text>
        </View>
      </StarField>
    );
  }

  const headline = reading.unified.headline ?? 'A day of cosmic alignment.';
  const vibe = reading.unified.cosmicVibe ?? '';
  const affirmation = reading.unified.affirmation ?? '';
  const bestUse = reading.unified.bestUse ?? reading.unified.focusAdvice ?? '';
  const watchFor = reading.unified.watchFor ?? '';
  const timingNote = reading.unified.timingNote ?? '';
  const tone = reading.unified.tone ?? 'Mixed';

  return (
    <StarField>
      <ScreenHeader title={formatDisplayDate(reading.date)} />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AnimatedCard index={0}>
          <LinearGradient colors={COLORS.gradientInk} style={styles.hero}>
            <Text style={styles.heroBadge}>{tone.toUpperCase()}</Text>
            <Text style={styles.heroHeadline}>{headline}</Text>
            <Text style={styles.heroBody}>{vibe}</Text>
          </LinearGradient>
        </AnimatedCard>

        {affirmation ? (
          <AnimatedCard index={1}>
            <GradientCard accentColor={COLORS.starGold}>
              <Text style={styles.cardEyebrow}>AFFIRMATION</Text>
              <Text style={styles.affirmation}>"{affirmation}"</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {bestUse ? (
          <AnimatedCard index={2}>
            <GradientCard accentColor={COLORS.tide}>
              <Text style={styles.cardEyebrow}>LEAN INTO</Text>
              <Text style={styles.cardBody}>{bestUse}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {watchFor ? (
          <AnimatedCard index={3}>
            <GradientCard accentColor={COLORS.coral}>
              <Text style={styles.cardEyebrow}>WATCH FOR</Text>
              <Text style={styles.cardBody}>{watchFor}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {timingNote ? (
          <AnimatedCard index={4}>
            <GradientCard accentColor={COLORS.gold}>
              <Text style={styles.cardEyebrow}>TIMING</Text>
              <Text style={styles.cardBody}>{timingNote}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {reading.western?.overall ? (
          <AnimatedCard index={5}>
            <GradientCard accentColor={COLORS.western}>
              <Text style={styles.cardEyebrow}>WESTERN</Text>
              <Text style={styles.cardBody}>{reading.western.overall}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {reading.vedic?.dasha ? (
          <AnimatedCard index={6}>
            <GradientCard accentColor={COLORS.vedic}>
              <Text style={styles.cardEyebrow}>VEDIC</Text>
              <Text style={styles.cardBody}>{reading.vedic.dasha}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        {reading.chinese?.element ? (
          <AnimatedCard index={7}>
            <GradientCard accentColor={COLORS.chinese}>
              <Text style={styles.cardEyebrow}>CHINESE</Text>
              <Text style={styles.cardBody}>{reading.chinese.element}</Text>
            </GradientCard>
          </AnimatedCard>
        ) : null}

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

function ArchiveMonthView() {
  const router = useRouter();
  const cachedReadings = useReadingStore((s) => s.cachedReadings);
  const getRecentReadings = useReadingStore((s) => s.getRecentReadings);
  const user = useUserStore((s) => s.user);
  const isPremium = hasPremiumEntitlement(user?.subscription);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getDateKey(today), [today]);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const unlockedKeys = useMemo(() => {
    const recent = getRecentReadings(30).map((r) => r.date);
    return new Set(isPremium ? recent : recent.slice(0, FREE_ARCHIVE_DAYS));
  }, [getRecentReadings, isPremium]);

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();

  const cells: Array<{ key: string; day: number; dateKey: string; cached: boolean; unlocked: boolean; isFuture: boolean; isToday: boolean } | null> = [];
  for (let i = 0; i < firstDayOfWeek; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), d);
    const key = getDateKey(cellDate);
    const cached = !!cachedReadings[key];
    cells.push({
      key,
      day: d,
      dateKey: key,
      cached,
      unlocked: unlockedKeys.has(key),
      isFuture: key > todayKey,
      isToday: key === todayKey,
    });
  }

  const handlePrev = () => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  };
  const handleNext = () => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    if (next.getFullYear() > today.getFullYear() || (next.getFullYear() === today.getFullYear() && next.getMonth() > today.getMonth())) return;
    setCursor(next);
  };

  const handleCellPress = (cell: NonNullable<typeof cells[number]>) => {
    if (cell.isFuture) return;
    if (cell.cached && cell.unlocked) {
      router.push({ pathname: '/reading/archive', params: { date: cell.dateKey } });
      return;
    }
    if (cell.cached && !cell.unlocked) {
      router.push('/subscription');
      return;
    }
    if (!cell.cached && !cell.isFuture) {
      router.push('/subscription');
    }
  };

  const atLatestMonth = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();
  const unlockedCount = Array.from(unlockedKeys).filter((k) => k.startsWith(`${cursor.getFullYear()}-${`${cursor.getMonth() + 1}`.padStart(2, '0')}`)).length;

  return (
    <StarField>
      <ScreenHeader title="Archive" />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AnimatedCard index={0}>
          <Text style={styles.headline}>Your cosmic history</Text>
          <Text style={styles.subhead}>
            {isPremium
              ? 'Premium unlocks every cached reading. Tap any day.'
              : `Free access shows your last ${FREE_ARCHIVE_DAYS} readings. Older days require Premium.`}
          </Text>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <GradientCard style={styles.calendarCard}>
            <View style={styles.monthRow}>
              <TouchableOpacity
                onPress={handlePrev}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                activeOpacity={0.84}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <TouchableOpacity
                onPress={handleNext}
                hitSlop={12}
                disabled={atLatestMonth}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                accessibilityState={{ disabled: atLatestMonth }}
                activeOpacity={0.84}
              >
                <Ionicons name="chevron-forward" size={20} color={atLatestMonth ? COLORS.textMuted : COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEK_LABELS.map((label, i) => (
                <Text key={`${label}-${i}`} style={styles.weekLabel}>{label}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((cell, i) => {
                if (!cell) {
                  return <View key={`empty-${i}`} style={styles.cellEmpty} />;
                }
                const disabled = cell.isFuture;
                const accessibleLabel = cell.isFuture
                  ? `${cell.dateKey}, future date`
                  : cell.cached && cell.unlocked
                    ? `${cell.dateKey}, open reading`
                    : cell.cached
                      ? `${cell.dateKey}, locked — upgrade to open`
                      : `${cell.dateKey}, no reading saved`;
                return (
                  <Pressable
                    key={cell.key}
                    onPress={() => handleCellPress(cell)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={accessibleLabel}
                    accessibilityState={{ disabled }}
                    style={({ pressed }) => [
                      styles.cell,
                      cell.cached && cell.unlocked && styles.cellUnlocked,
                      cell.cached && !cell.unlocked && styles.cellLocked,
                      cell.isToday && styles.cellToday,
                      disabled && styles.cellDisabled,
                      pressed && !disabled && { opacity: 0.75 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellDay,
                        cell.cached && cell.unlocked && styles.cellDayUnlocked,
                        disabled && styles.cellDayDisabled,
                      ]}
                    >
                      {cell.day}
                    </Text>
                    {cell.cached && !cell.unlocked ? (
                      <Ionicons name="lock-closed" size={9} color={COLORS.starGold} style={styles.cellBadge} />
                    ) : cell.cached && cell.unlocked ? (
                      <View style={styles.cellDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.cellUnlocked]} />
                <Text style={styles.legendText}>Unlocked</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.cellLocked]}>
                  <Ionicons name="lock-closed" size={8} color={COLORS.starGold} />
                </View>
                <Text style={styles.legendText}>Locked</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.cellToday]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
            </View>
          </GradientCard>
        </AnimatedCard>

        {!isPremium && unlockedCount === 0 ? (
          <AnimatedCard index={2}>
            <EmptyState
              icon="star-outline"
              title="No readings from this month yet"
              body={`Free access covers the last ${FREE_ARCHIVE_DAYS} readings. Open Premium to browse the full archive.`}
              ctaLabel="Go Premium"
              onCta={() => router.push('/subscription')}
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
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  emptyCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
  },
  subhead: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  calendarCard: {
    gap: SPACING.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
    letterSpacing: 0.3,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLabel: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
    padding: 2,
  },
  cellEmpty: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  cellDisabled: {
    opacity: 0.3,
  },
  cellUnlocked: {
    backgroundColor: `${COLORS.iris}26`,
    borderWidth: 1,
    borderColor: `${COLORS.iris}55`,
  },
  cellLocked: {
    backgroundColor: `${COLORS.starGold}14`,
    borderWidth: 1,
    borderColor: `${COLORS.starGold}44`,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: COLORS.starGold,
  },
  cellDay: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  cellDayUnlocked: {
    color: COLORS.textPrimary,
  },
  cellDayDisabled: {
    color: COLORS.textMuted,
  },
  cellDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.iris,
  },
  cellBadge: {
    position: 'absolute',
    bottom: 3,
  },
  legendRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
  },
  hero: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.deep,
  },
  heroBadge: {
    color: COLORS.inkSoft,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  heroHeadline: {
    color: COLORS.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontFamily: FONTS.display,
    letterSpacing: -0.4,
  },
  heroBody: {
    color: COLORS.inkMid,
    fontSize: 14,
    lineHeight: 21,
  },
  cardEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  affirmation: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: FONTS.heading,
    fontStyle: 'italic',
  },
  cardBody: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 23,
  },
  bottomPad: {
    height: 40,
  },
});
