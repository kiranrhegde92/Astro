import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import type { AstrologySystem } from '../../src/types/user';

const SYSTEMS: Array<{ key: AstrologySystem; titleKey: string; bodyKey: string; accent: string; secondary: string; icon: React.ComponentProps<typeof OrbIcon>['icon'] }> = [
  {
    key: 'western',
    titleKey: 'onboarding.systemPicker.western',
    bodyKey: 'onboarding.systemPicker.westernDesc',
    accent: COLORS.western,
    secondary: COLORS.violetLight,
    icon: 'sunny',
  },
  {
    key: 'vedic',
    titleKey: 'onboarding.systemPicker.vedic',
    bodyKey: 'onboarding.systemPicker.vedicDesc',
    accent: COLORS.vedic,
    secondary: COLORS.aurora,
    icon: 'moon',
  },
  {
    key: 'chinese',
    titleKey: 'onboarding.systemPicker.chinese',
    bodyKey: 'onboarding.systemPicker.chineseDesc',
    accent: COLORS.chinese,
    secondary: COLORS.sunOrange,
    icon: 'leaf',
  },
  {
    key: 'kp',
    titleKey: 'onboarding.systemPicker.kp',
    bodyKey: 'onboarding.systemPicker.kpDesc',
    accent: COLORS.kp,
    secondary: COLORS.tealLight,
    icon: 'sparkles',
  },
];

export default function SystemPickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setActiveSystems = useUserStore((state) => state.setActiveSystems);
  const [selected, setSelected] = useState<Set<AstrologySystem>>(new Set(SYSTEMS.map((system) => system.key)));
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

  const toggle = (system: AstrologySystem) => {
    const next = new Set(selected);
    if (next.has(system)) {
      if (next.size > 1) next.delete(system);
    } else {
      next.add(system);
    }
    setSelected(next);
  };

  return (
    <StarField>
      <ScreenHeader title={t('onboarding.systemPicker.title')} />
      <ResetScrollView contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>{t('onboarding.systemPicker.step')}</Text>
        <Text style={styles.headline}>{t('onboarding.systemPicker.headline')}</Text>
        <Text style={[styles.copy, isDesktop && styles.copyDesktop]}>{t('onboarding.systemPicker.copy')}</Text>

        <View style={[isDesktop && styles.systemsGridDesktop]}>
        {SYSTEMS.map((system) => {
          const active = selected.has(system.key);
          return (
            <TouchableOpacity
              key={system.key}
              onPress={() => toggle(system.key)}
              activeOpacity={0.84}
              accessibilityRole="switch"
              accessibilityLabel={t(system.titleKey)}
              accessibilityState={{ checked: active }}
              style={isDesktop ? styles.systemTileDesktop : undefined}
            >
              <GradientCard style={[styles.row, active && styles.rowActive]} accentColor={system.accent}>
                <View style={styles.rowTop}>
                  <View style={styles.rowTitleWrap}>
                    <OrbIcon
                      icon={system.icon}
                      size={36}
                      accentColor={system.accent}
                      secondaryColor={system.secondary}
                      active={active}
                    />
                    <Text style={styles.rowText}>{t(system.titleKey)}</Text>
                  </View>
                  <View style={[styles.rowMark, active && styles.rowMarkActive]}>
                    <Text style={[styles.rowMarkText, active && styles.rowMarkTextActive]}>{active ? t('common.on') : t('common.off')}</Text>
                  </View>
                </View>
                <Text style={styles.rowBody}>{t(system.bodyKey)}</Text>
              </GradientCard>
            </TouchableOpacity>
          );
        })}
        </View>

        <CosmicButton
          title={t('onboarding.systemPicker.continue')}
          onPress={() => {
            setActiveSystems(Array.from(selected));
            router.push('/(onboarding)/cosmic-reveal');
          }}
        />
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  containerDesktop: {
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: SPACING.lg,
  },
  copyDesktop: {
    maxWidth: 560,
  },
  systemsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  systemTileDesktop: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  step: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 40,
    lineHeight: 46,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 320,
  },
  row: {
    gap: SPACING.sm,
  },
  rowActive: {
    borderColor: COLORS.glassBorderBright,
  },
  rowText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  rowMark: {
    minWidth: 52,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glassBg,
  },
  rowMarkActive: {
    backgroundColor: COLORS.bgMuted,
    borderColor: COLORS.glassBorderBright,
  },
  rowMarkText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  rowMarkTextActive: {
    color: COLORS.textPrimary,
  },
  rowBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
