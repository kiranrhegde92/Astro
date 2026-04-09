import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import {
  fetchPredictionModelSnapshot,
  submitPredictionFeedback,
} from '../../services/functionsService';
import type {
  PredictionFeedbackRecord,
  PredictionModelSnapshot,
  PredictionVerdict,
  PredictionWindow,
} from '../../types/prediction';
import { GradientCard } from './GradientCard';

const VERDICTS: Array<{
  verdict: PredictionVerdict;
  label: string;
  resonance: number;
}> = [
  { verdict: 'matched', label: 'Matched', resonance: 5 },
  { verdict: 'mixed', label: 'Mixed', resonance: 3 },
  { verdict: 'missed', label: 'Missed', resonance: 1 },
];

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function PredictionFeedbackCard({
  window,
  title,
}: {
  window: PredictionWindow;
  title?: string;
}) {
  const [snapshot, setSnapshot] = useState<PredictionModelSnapshot | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PredictionFeedbackRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(false);

    fetchPredictionModelSnapshot(window)
      .then((result) => {
        if (cancelled) return;
        setRunId(result.runId);
        setSnapshot(result.snapshot);
        setFeedback(result.feedback);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [window]);

  const onSelect = async (verdict: PredictionVerdict, resonance: number) => {
    if (!runId || isSaving) return;
    setIsSaving(true);
    try {
      const result = await submitPredictionFeedback({ runId, verdict, resonance });
      setFeedback(result.feedback);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) return null;

  return (
    <GradientCard accentColor={COLORS.iris} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>AI calibration</Text>
          <Text style={styles.title}>{title ?? 'Rate the model layer'}</Text>
        </View>
        {isLoading ? <ActivityIndicator size="small" color={COLORS.iris} /> : null}
      </View>

      {snapshot ? (
        <>
          <Text style={styles.summary}>{snapshot.summary}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Confidence</Text>
              <Text style={styles.metaValue}>{formatPercent(snapshot.confidence)}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Top area</Text>
              <Text style={styles.metaValue}>{snapshot.topArea}</Text>
            </View>
          </View>

          {snapshot.supportingSignals.length ? (
            <View style={styles.signalWrap}>
              <Text style={styles.signalLabel}>Current drivers</Text>
              <View style={styles.signalList}>
                {snapshot.supportingSignals.slice(0, 3).map((signal) => (
                  <View key={signal} style={styles.signalChip}>
                    <Text style={styles.signalText}>{signal}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            {VERDICTS.map((item) => {
              const active = feedback?.verdict === item.verdict;
              return (
                <TouchableOpacity
                  key={item.verdict}
                  style={[styles.actionChip, active && styles.actionChipActive]}
                  onPress={() => onSelect(item.verdict, item.resonance)}
                  disabled={isSaving}
                  activeOpacity={0.82}
                >
                  <Text style={[styles.actionText, active && styles.actionTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.helper}>
            {feedback
              ? `Saved as ${feedback.verdict}. This is the feedback loop for the future model.`
              : 'Your rating labels this forecast so the scoring model can improve over time.'}
          </Text>
        </>
      ) : (
        <Text style={styles.helper}>Preparing the model snapshot for this window.</Text>
      )}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  summary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metaCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: SPACING.sm,
    gap: 2,
  },
  metaLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.6,
  },
  metaValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.heading,
    textTransform: 'capitalize',
  },
  signalWrap: {
    gap: SPACING.xs,
  },
  signalLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  signalList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  signalChip: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  signalText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  actionChipActive: {
    backgroundColor: COLORS.bgMuted,
    borderColor: COLORS.glassBorderBright,
  },
  actionText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.3,
  },
  actionTextActive: {
    color: COLORS.textPrimary,
  },
  helper: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});

