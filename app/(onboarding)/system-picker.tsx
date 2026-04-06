import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import type { AstrologySystem } from '../../src/types/user';

interface SystemOption {
  key: AstrologySystem;
  emoji: string;
  color: string;
  gradient: readonly string[];
}

const SYSTEMS: SystemOption[] = [
  { key: 'western', emoji: '\u2648', color: COLORS.western, gradient: COLORS.gradientWestern },
  { key: 'vedic', emoji: '\u{1F549}\uFE0F', color: COLORS.vedic, gradient: COLORS.gradientVedic },
  { key: 'chinese', emoji: '\u{1F409}', color: COLORS.chinese, gradient: COLORS.gradientChinese },
  { key: 'kp', emoji: '\u{1F52D}', color: COLORS.kp, gradient: COLORS.gradientKP },
];

export default function SystemPickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setActiveSystems = useUserStore((s) => s.setActiveSystems);
  const [selected, setSelected] = useState<Set<AstrologySystem>>(
    new Set(['western', 'vedic', 'chinese', 'kp'])
  );

  const toggle = (sys: AstrologySystem) => {
    const next = new Set(selected);
    if (next.has(sys)) {
      if (next.size > 1) next.delete(sys);
    } else {
      next.add(sys);
    }
    setSelected(next);
  };

  const selectAll = () => {
    setSelected(new Set(['western', 'vedic', 'chinese', 'kp']));
  };

  const handleContinue = () => {
    setActiveSystems(Array.from(selected));
    router.push('/(onboarding)/cosmic-reveal');
  };

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.spacer} />

        <GlowText size="xl" align="center">
          {t('onboarding.systemPicker.title')}
        </GlowText>
        <Text style={styles.subtitle}>
          {t('onboarding.systemPicker.subtitle')}
        </Text>

        <View style={styles.systems}>
          {SYSTEMS.map((sys) => {
            const isSelected = selected.has(sys.key);
            return (
              <TouchableOpacity
                key={sys.key}
                onPress={() => toggle(sys.key)}
                activeOpacity={0.7}
              >
                <GradientCard
                  colors={isSelected ? sys.gradient : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
                  style={isSelected ? { ...styles.systemCard, borderColor: sys.color } : styles.systemCard}
                >
                  <View style={styles.systemContent}>
                    <Text style={styles.systemEmoji}>{sys.emoji}</Text>
                    <View style={styles.systemText}>
                      <Text style={[styles.systemName, isSelected && { color: COLORS.white }]}>
                        {t(`onboarding.systemPicker.${sys.key}`)}
                      </Text>
                      <Text style={styles.systemDesc}>
                        {t(`onboarding.systemPicker.${sys.key}Desc`)}
                      </Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Text style={styles.checkmark}>{'\u2713'}</Text>}
                    </View>
                  </View>
                </GradientCard>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={selectAll} style={styles.selectAll}>
          <Text style={styles.selectAllText}>
            {t('onboarding.systemPicker.selectAll')}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <CosmicButton
            title={t('onboarding.systemPicker.continue')}
            onPress={handleContinue}
            colors={[COLORS.starGold, COLORS.sunOrange]}
          />
        </View>
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  spacer: { height: 60 },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  systems: { gap: SPACING.md },
  systemCard: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  systemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  systemEmoji: { fontSize: 36 },
  systemText: { flex: 1 },
  systemName: {
    color: COLORS.textSecondary,
    fontSize: 17,
    fontWeight: '700',
  },
  systemDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: COLORS.starGold,
    backgroundColor: COLORS.starGold,
  },
  checkmark: {
    color: COLORS.deepSpace,
    fontSize: 14,
    fontWeight: '900',
  },
  selectAll: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  selectAllText: {
    color: COLORS.starGold,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: SPACING.xl,
  },
});
