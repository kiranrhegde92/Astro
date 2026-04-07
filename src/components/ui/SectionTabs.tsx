import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, FONTS } from '../../constants/theme';

export interface SectionTabItem {
  key: string;
  label: string;
}

interface SectionTabsProps {
  tabs: SectionTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionTabs({ tabs, activeKey, onChange, style }: SectionTabsProps) {
  return (
    <View style={[styles.wrap, style]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {isActive ? <View style={styles.indicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: COLORS.glassBorderBright,
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: FONTS.heading,
    fontSize: 13,
  },
  labelActive: {
    color: COLORS.textPrimary,
  },
  indicator: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 5,
    height: 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.starGold,
  },
});

