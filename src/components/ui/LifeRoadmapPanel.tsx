import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LifeRoadmap } from '../../content/lifeRoadmap';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import { GradientCard } from './GradientCard';

export function LifeRoadmapPanel({ roadmap }: { roadmap: LifeRoadmap }) {
  return (
    <GradientCard accentColor={COLORS.vedic} style={styles.card}>
      <Text style={styles.label}>{roadmap.title}</Text>
      <Text style={styles.summary}>{roadmap.summary}</Text>

      <View style={styles.chapterGrid}>
        <View style={styles.chapterCard}>
          <Text style={styles.chapterKicker}>Current chapter</Text>
          <Text style={styles.chapterTitle}>{roadmap.currentChapter.title}</Text>
          <Text style={styles.chapterRange}>
            {roadmap.currentChapter.range}
            {roadmap.currentChapter.ageRange ? ` · ${roadmap.currentChapter.ageRange}` : ''}
          </Text>
          <Text style={styles.chapterTheme}>{roadmap.currentChapter.theme}</Text>
          <Text style={styles.chapterGuidance}>{roadmap.currentChapter.guidance}</Text>
        </View>

        {roadmap.nextChapter ? (
          <View style={styles.chapterCard}>
            <Text style={styles.chapterKicker}>Next chapter</Text>
            <Text style={styles.chapterTitle}>{roadmap.nextChapter.title}</Text>
            <Text style={styles.chapterRange}>
              {roadmap.nextChapter.range}
              {roadmap.nextChapter.ageRange ? ` · ${roadmap.nextChapter.ageRange}` : ''}
            </Text>
            <Text style={styles.chapterTheme}>{roadmap.nextChapter.theme}</Text>
            <Text style={styles.chapterGuidance}>{roadmap.nextChapter.guidance}</Text>
          </View>
        ) : null}
      </View>

      {roadmap.subChapters?.length ? (
        <View style={styles.subWrap}>
          <Text style={styles.subTitle}>Upcoming sub-periods (Antardasha)</Text>
          {roadmap.subChapters.map((sub) => (
            <View key={`${sub.planet}-${sub.range}`} style={styles.subRow}>
              <Text style={styles.subPlanet}>{sub.title}</Text>
              <Text style={styles.subRange}>{sub.range}</Text>
              <Text style={styles.subTheme}>{sub.theme}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.timeline}>
        {roadmap.chapters.map((chapter) => (
          <View key={`${chapter.planet}-${chapter.range}`} style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{chapter.title}</Text>
              <Text style={styles.timelineRange}>{chapter.range}</Text>
              <Text style={styles.timelineBody}>{chapter.guidance}</Text>
            </View>
          </View>
        ))}
      </View>

      {roadmap.turningPoints.length ? (
        <View style={styles.turningWrap}>
          <Text style={styles.turningTitle}>Turning points</Text>
          {roadmap.turningPoints.map((point) => (
            <Text key={point} style={styles.turningPoint}>
              • {point}
            </Text>
          ))}
        </View>
      ) : null}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.md,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1,
  },
  summary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  chapterGrid: {
    gap: SPACING.sm,
  },
  chapterCard: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.58)',
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  chapterKicker: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chapterTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.heading,
  },
  chapterRange: {
    color: COLORS.vedic,
    fontSize: 12,
    fontWeight: '700',
  },
  chapterTheme: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    textTransform: 'capitalize',
  },
  chapterGuidance: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  timeline: {
    gap: SPACING.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.starGold,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  timelineRange: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  timelineBody: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  turningWrap: {
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    paddingTop: SPACING.sm,
    gap: SPACING.xs,
  },
  turningTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  turningPoint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  subWrap: {
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    paddingTop: SPACING.sm,
    gap: SPACING.xs,
  },
  subTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: FONTS.heading,
  },
  subRow: {
    paddingVertical: 4,
    gap: 2,
  },
  subPlanet: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  subRange: {
    color: COLORS.vedic,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  subTheme: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});

