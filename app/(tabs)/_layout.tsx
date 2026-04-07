import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '../../src/constants/theme';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TABS = [
  { name: 'today', icon: 'sunny', label: 'Today', accent: COLORS.sunOrange, secondary: '#ffe9c7' },
  { name: 'profile', icon: 'person', label: 'Profile', accent: COLORS.iris, secondary: '#ece6ff' },
  { name: 'compatibility', icon: 'heart', label: 'Match', accent: COLORS.coral, secondary: '#ffe3da' },
  { name: 'explore', icon: 'book', label: 'Guide', accent: COLORS.tide, secondary: '#e2f5ef' },
  { name: 'cosmos', icon: 'sparkles', label: 'Notes', accent: COLORS.gold, secondary: '#fff4cf' },
] as const;

function TabItem({
  icon,
  label,
  accent,
  secondary,
  focused,
  onPress,
}: {
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  label: string;
  accent: string;
  secondary: string;
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.tabItem} accessibilityRole="tab" accessibilityLabel={label}>
      <View style={[styles.tabInner, focused && styles.tabInnerFocused]}>
        <OrbIcon
          icon={icon}
          size={focused ? 34 : 30}
          accentColor={focused ? accent : COLORS.silverMid}
          secondaryColor={focused ? secondary : '#fffaf1'}
          active={focused}
          iconColor="#1b2233"
        />
        <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function BottomBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 8);

  return (
    <View style={[styles.outer, { paddingBottom }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((item) => item.name === route.name) ?? TABS[0];
          const focused = state.index === index;

          return (
            <TabItem
              key={route.key}
              icon={tab.icon}
              label={tab.label}
              accent={tab.accent}
              secondary={tab.secondary}
              focused={focused}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs tabBar={(props) => <BottomBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="today" options={{ title: t('tabs.today') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      <Tabs.Screen name="compatibility" options={{ title: t('tabs.compatibility') }} />
      <Tabs.Screen name="explore" options={{ title: t('tabs.explore') }} />
      <Tabs.Screen name="cosmos" options={{ title: t('tabs.cosmos') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: COLORS.bgDeep,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glass,
  },
  tabItem: {
    flex: 1,
    paddingHorizontal: 2,
  },
  tabInner: {
    minHeight: 50,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabInnerFocused: {
    backgroundColor: COLORS.bgMuted,
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  labelFocused: {
    color: COLORS.textPrimary,
  },
});
