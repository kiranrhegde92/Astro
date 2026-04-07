import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import type { AstrologySystem } from '../../src/types/user';

const SYSTEMS: Array<{ key: AstrologySystem; title: string; body: string; accent: string; secondary: string; icon: React.ComponentProps<typeof OrbIcon>['icon'] }> = [
  {
    key: 'western',
    title: 'Western astrology',
    body: 'Psychology, identity, and how today lands in your inner weather.',
    accent: COLORS.western,
    secondary: '#ece6ff',
    icon: 'sunny',
  },
  {
    key: 'vedic',
    title: 'Vedic astrology',
    body: 'Life periods, karma, and timing when a season starts to shift.',
    accent: COLORS.vedic,
    secondary: '#ffe6d8',
    icon: 'moon',
  },
  {
    key: 'chinese',
    title: 'Chinese astrology',
    body: 'Animals, elements, and the long rhythm of your temperament.',
    accent: COLORS.chinese,
    secondary: '#ffe7db',
    icon: 'leaf',
  },
  {
    key: 'kp',
    title: 'KP system',
    body: 'A sharper lens for event timing when you want precision.',
    accent: COLORS.kp,
    secondary: '#e1f5ef',
    icon: 'sparkles',
  },
];

export default function SystemPickerScreen() {
  const router = useRouter();
  const setActiveSystems = useUserStore((state) => state.setActiveSystems);
  const [selected, setSelected] = useState<Set<AstrologySystem>>(new Set(SYSTEMS.map((system) => system.key)));

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
      <ScreenHeader title="Choose your blend" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.headline}>Blend the traditions you want in your daily ritual.</Text>
        <Text style={styles.copy}>Keep all four for the richest read, or narrow the voice if you prefer something quieter.</Text>

        {SYSTEMS.map((system) => {
          const active = selected.has(system.key);
          return (
            <TouchableOpacity key={system.key} onPress={() => toggle(system.key)} activeOpacity={0.84}>
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
                    <Text style={styles.rowText}>{system.title}</Text>
                  </View>
                  <View style={[styles.rowMark, active && styles.rowMarkActive]}>
                    <Text style={[styles.rowMarkText, active && styles.rowMarkTextActive]}>{active ? 'On' : 'Off'}</Text>
                  </View>
                </View>
                <Text style={styles.rowBody}>{system.body}</Text>
              </GradientCard>
            </TouchableOpacity>
          );
        })}

        <CosmicButton
          title="Create my almanac"
          onPress={() => {
            setActiveSystems(Array.from(selected));
            router.push('/(onboarding)/cosmic-reveal');
          }}
        />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
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
    backgroundColor: 'rgba(255,255,255,0.56)',
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
