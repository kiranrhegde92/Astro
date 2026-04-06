import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { generateDailyReading } from '../../src/content/dailyTemplates';

export default function TodayScreen() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const today = new Date();

  const reading = useMemo(() => {
    if (!user?.western?.sun || !user?.vedic?.rashi || !user?.chinese?.animal) return null;
    return generateDailyReading(today, user.western.sun, user.vedic.rashi, user.chinese.animal);
  }, [today.toDateString(), user?.western?.sun]);

  const timeOfDay = (() => {
    const h = today.getHours();
    if (h < 12) return t('common.morning');
    if (h < 17) return t('common.afternoon');
    return t('common.evening');
  })();

  if (!reading || !user) {
    return (
      <StarField>
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('common.loading')}</Text>
        </View>
      </StarField>
    );
  }

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        {/* Greeting */}
        <Text style={styles.greeting}>
          {t('today.greeting', { timeOfDay, name: user.name })}
        </Text>

        {/* Streak */}
        {user.streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>
              {'\u{1F525}'} {user.streak} day streak | {user.cosmicPoints} cosmic points
            </Text>
          </View>
        )}

        {/* Cosmic Vibe Card */}
        <GradientCard colors={COLORS.gradientGold as unknown as readonly string[]}>
          <Text style={styles.sectionLabel}>{t('today.cosmicVibe')}</Text>
          <Text style={styles.vibeText}>{reading.unified.cosmicVibe}</Text>
        </GradientCard>

        {/* Daily Affirmation */}
        <GradientCard>
          <Text style={styles.sectionLabel}>{t('today.affirmation')}</Text>
          <Text style={styles.affirmationText}>"{reading.unified.affirmation}"</Text>
        </GradientCard>

        {/* Western Reading */}
        {user.activeSystems.includes('western') && reading.western && (
          <GradientCard colors={COLORS.gradientWestern as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>
              {'\u2648'} {t('today.westernReading')} - {user.western?.sun}
            </Text>
            <ReadingSection label={t('reading.overall')} text={reading.western.overall} />
            <ReadingSection label={t('reading.love')} text={reading.western.love} />
            <ReadingSection label={t('reading.career')} text={reading.western.career} />
            <ReadingSection label={t('reading.wellness')} text={reading.western.wellness} />
            <View style={styles.luckyRow}>
              <Text style={styles.luckyLabel}>{t('reading.luckyNumber')}:</Text>
              <Text style={styles.luckyValue}>{reading.western.luckyNumber}</Text>
            </View>
          </GradientCard>
        )}

        {/* Vedic Reading */}
        {user.activeSystems.includes('vedic') && reading.vedic && (
          <GradientCard colors={COLORS.gradientVedic as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>
              {'\u{1F549}\uFE0F'} {t('today.vedicReading')} - {user.vedic?.rashi}
            </Text>
            <ReadingSection label="Dasha Period" text={reading.vedic.dasha} />
            <ReadingSection label="Nakshatra Energy" text={reading.vedic.nakshatra} />
            <ReadingSection label={t('reading.mantra')} text={reading.vedic.mantra} />
            <ReadingSection label={t('reading.remedy')} text={reading.vedic.remedy.description} />
            <SourceBadge source={reading.vedic.remedy.source} />
          </GradientCard>
        )}

        {/* Chinese Reading */}
        {user.activeSystems.includes('chinese') && reading.chinese && (
          <GradientCard colors={COLORS.gradientChinese as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>
              {'\u{1F409}'} {t('today.chineseReading')} - {user.chinese?.element} {user.chinese?.animal}
            </Text>
            <ReadingSection label="Animal Energy" text={reading.chinese.animal} />
            <ReadingSection label="Element Flow" text={reading.chinese.element} />
            <View style={styles.luckyRow}>
              <Text style={styles.luckyLabel}>{t('reading.luckyDirection')}:</Text>
              <Text style={styles.luckyValue}>{reading.chinese.luckyDirection}</Text>
            </View>
          </GradientCard>
        )}

        {/* KP Reading */}
        {user.activeSystems.includes('kp') && reading.kp && (
          <GradientCard colors={COLORS.gradientKP as unknown as readonly string[]}>
            <Text style={styles.systemHeader}>
              {'\u{1F52D}'} {t('today.kpReading')}
            </Text>
            <ReadingSection label="Event Timing" text={reading.kp.eventTiming} />
            <ReadingSection label="Significator Insight" text={reading.kp.significatorInsight} />
            <ReadingSection label="Guidance" text={reading.kp.sublordGuidance} />
          </GradientCard>
        )}

        {/* References */}
        <View style={styles.references}>
          <Text style={styles.refTitle}>Sources</Text>
          {reading.references.map((ref, i) => (
            <Text key={i} style={styles.refText}>
              {ref.tradition.charAt(0).toUpperCase() + ref.tradition.slice(1)}: {ref.source}
              {ref.chapter ? ` - ${ref.chapter}` : ''}
            </Text>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function ReadingSection({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.readingSection}>
      <Text style={styles.readingLabel}>{label}</Text>
      <Text style={styles.readingText}>{text}</Text>
    </View>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <View style={styles.sourceBadge}>
      <Text style={styles.sourceText}>{'\u{1F4D6}'} {source}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
  spacer: { height: 60 },
  greeting: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: COLORS.starGold,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  vibeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  affirmationText: {
    color: COLORS.starGold,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  systemHeader: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  readingSection: {
    marginTop: SPACING.sm,
  },
  readingLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  readingText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 21,
  },
  luckyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  luckyLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  luckyValue: {
    color: COLORS.starGold,
    fontSize: 15,
    fontWeight: '700',
  },
  sourceBadge: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    alignSelf: 'flex-start',
  },
  sourceText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  references: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
  },
  refTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  refText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 18,
  },
  bottomPad: { height: 20 },
});
