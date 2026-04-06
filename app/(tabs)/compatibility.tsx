import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { calculateCosmicProfile } from '../../src/engines/unified';
import { calculateCrossCompatibility } from '../../src/engines/unified/crossCompatibility';
import type { CompatibilityResult, CosmicProfile } from '../../src/types/astrology';

export default function CompatibilityScreen() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [partnerName, setPartnerName] = useState('');

  const isValid = name.trim() && day && month && year;

  const handleCheck = () => {
    if (!user?.western || !user?.vedic || !user?.chinese) return;

    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const partnerProfile = calculateCosmicProfile(birthDate);

    const myProfile: CosmicProfile = {
      western: user.western,
      vedic: user.vedic,
      chinese: user.chinese,
      kp: user.kp,
    };

    const compat = calculateCrossCompatibility(myProfile, partnerProfile);
    setResult(compat);
    setPartnerName(name.trim());
  };

  const resetCheck = () => {
    setResult(null);
    setName('');
    setDay('');
    setMonth('');
    setYear('');
  };

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <Text style={styles.emoji}>{'\u{1F496}'}</Text>
        <GlowText size="xl" align="center">
          {t('compatibility.title')}
        </GlowText>
        <Text style={styles.subtitle}>{t('compatibility.subtitle')}</Text>

        {!result ? (
          /* Input Form */
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('compatibility.nameLabel')}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter their name"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Their Birth Date</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={day}
                  onChangeText={(v) => setDay(v.replace(/\D/g, '').slice(0, 2))}
                  placeholder="DD"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={month}
                  onChangeText={(v) => setMonth(v.replace(/\D/g, '').slice(0, 2))}
                  placeholder="MM"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.input, styles.yearInput]}
                  value={year}
                  onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <CosmicButton
              title={t('compatibility.check')}
              onPress={handleCheck}
              disabled={!isValid}
              colors={[COLORS.chinese, '#ff4500']}
            />
          </View>
        ) : (
          /* Results */
          <View style={styles.results}>
            {/* Overall Score */}
            <GradientCard colors={COLORS.gradientCompatibility as unknown as readonly string[]}>
              <Text style={styles.resultLabel}>{t('compatibility.result')}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreBig}>{result.overall}%</Text>
                <Text style={styles.scoreNames}>
                  {user?.name} + {partnerName}
                </Text>
              </View>
            </GradientCard>

            {/* System Breakdown */}
            <CompatCard
              system="Western"
              emoji={'\u2648'}
              score={result.western.score}
              details={result.western.details}
              colors={COLORS.gradientWestern}
            />
            <CompatCard
              system="Vedic"
              emoji={'\u{1F549}\uFE0F'}
              score={result.vedic.score}
              details={result.vedic.details}
              colors={COLORS.gradientVedic}
            />
            <CompatCard
              system="Chinese"
              emoji={'\u{1F409}'}
              score={result.chinese.score}
              details={result.chinese.details}
              colors={COLORS.gradientChinese}
            />

            {/* Sources */}
            <View style={styles.sources}>
              <Text style={styles.sourcesTitle}>Sources</Text>
              {result.references.map((ref, i) => (
                <Text key={i} style={styles.sourceText}>
                  {ref.tradition}: {ref.source}
                </Text>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <CosmicButton title="Check Another" onPress={resetCheck} variant="outline" />
            </View>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

function CompatCard({
  system,
  emoji,
  score,
  details,
  colors,
}: {
  system: string;
  emoji: string;
  score: number;
  details: string;
  colors: readonly string[];
}) {
  return (
    <GradientCard colors={colors as unknown as readonly string[]}>
      <View style={styles.compatHeader}>
        <Text style={styles.compatEmoji}>{emoji}</Text>
        <Text style={styles.compatSystem}>{system}</Text>
        <Text style={styles.compatScore}>{score}%</Text>
      </View>
      <Text style={styles.compatDetails}>{details}</Text>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  spacer: { height: 60 },
  emoji: { fontSize: 48, textAlign: 'center' },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  form: { gap: SPACING.lg },
  field: { gap: SPACING.xs },
  label: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 16,
  },
  dateRow: { flexDirection: 'row', gap: SPACING.sm },
  dateInput: { flex: 1, textAlign: 'center' },
  yearInput: { flex: 1.5, textAlign: 'center' },
  results: { gap: SPACING.md },
  resultLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  scoreContainer: { alignItems: 'center', marginTop: SPACING.sm },
  scoreBig: {
    color: COLORS.white,
    fontSize: 56,
    fontWeight: '800',
    textShadowColor: COLORS.white,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  scoreNames: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  compatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  compatEmoji: { fontSize: 22 },
  compatSystem: { color: COLORS.white, fontSize: 16, fontWeight: '700', flex: 1 },
  compatScore: { color: COLORS.starGold, fontSize: 20, fontWeight: '800' },
  compatDetails: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  sources: {
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
  },
  sourcesTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  sourceText: { color: COLORS.textMuted, fontSize: 11, lineHeight: 18 },
  buttonRow: { marginTop: SPACING.sm },
  bottomPad: { height: 20 },
});
