import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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

interface TabLayout { x: number; width: number }

function AnimatedTab({
  tab,
  isActive,
  onPress,
  onLayout,
}: {
  tab: SectionTabItem;
  isActive: boolean;
  onPress: () => void;
  onLayout: (layout: TabLayout) => void;
}) {
  const active = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    active.value = withTiming(isActive ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [isActive, active]);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      active.value,
      [0, 1],
      ['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.82)']
    ),
    borderColor: interpolateColor(
      active.value,
      [0, 1],
      [COLORS.glassBorder, COLORS.glassBorderBright]
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      active.value,
      [0, 1],
      [COLORS.textMuted, COLORS.textPrimary]
    ),
  }));

  return (
    <Animated.View
      style={[styles.tab, bgStyle]}
      onLayout={(e) => onLayout({ x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
    >
      <Pressable onPress={onPress} style={styles.tabPressable}>
        <Animated.Text style={[styles.label, labelStyle]}>{tab.label}</Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

export function SectionTabs({ tabs, activeKey, onChange, style }: SectionTabsProps) {
  const layouts = useRef<Record<string, TabLayout>>({});
  const [ready, setReady] = useState(false);
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const initialized = useRef(false);

  const moveIndicator = (key: string) => {
    const layout = layouts.current[key];
    if (!layout) return;
    if (!initialized.current) {
      // First render — snap without animation
      indicatorX.value = layout.x;
      indicatorW.value = layout.width;
      initialized.current = true;
    } else {
      indicatorX.value = withSpring(layout.x, { damping: 22, stiffness: 280 });
      indicatorW.value = withSpring(layout.width, { damping: 24, stiffness: 300 });
    }
  };

  useEffect(() => {
    if (ready) moveIndicator(activeKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, ready]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  const handleLayout = (key: string, layout: TabLayout) => {
    layouts.current[key] = layout;
    const allReady = tabs.every((t) => layouts.current[t.key]);
    if (allReady && !ready) {
      setReady(true);
    } else if (allReady && key === activeKey) {
      moveIndicator(activeKey);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      {tabs.map((tab) => (
        <AnimatedTab
          key={tab.key}
          tab={tab}
          isActive={tab.key === activeKey}
          onPress={() => onChange(tab.key)}
          onLayout={(layout) => handleLayout(tab.key, layout)}
        />
      ))}
      {ready && (
        <Animated.View style={[styles.slidingIndicator, indicatorStyle]} pointerEvents="none" />
      )}
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
    overflow: 'hidden',
  },
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    minHeight: 40,
  },
  label: {
    fontFamily: FONTS.heading,
    fontSize: 13,
  },
  slidingIndicator: {
    position: 'absolute',
    bottom: 5,
    height: 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.starGold,
  },
});
