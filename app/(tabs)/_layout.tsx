/**
 * Floating Tab Bar — Obsidian Glass
 * - Pure black glass pill with white border
 * - Ionicons (clean vector icons)
 * - Cinzel font labels
 * - Spring scale + white underline dot
 * - White icon on active, muted gray on inactive
 */
import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, BORDER_RADIUS } from '../../src/constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TABS = [
  { name: 'today',         icon: 'sunny',      iconOff: 'sunny-outline',     label: 'Today' },
  { name: 'profile',       icon: 'person',     iconOff: 'person-outline',    label: 'Profile' },
  { name: 'compatibility', icon: 'heart',      iconOff: 'heart-outline',     label: 'Match' },
  { name: 'explore',       icon: 'telescope',  iconOff: 'telescope-outline', label: 'Explore' },
  { name: 'cosmos',        icon: 'planet',     iconOff: 'planet-outline',    label: 'Cosmos' },
] as const;

function TabItem({
  iconOn, iconOff, label, focused, onPress,
}: {
  iconOn: string; iconOff: string; label: string; focused: boolean; onPress: () => void;
}) {
  const scale  = useRef(new Animated.Value(focused ? 1 : 0.82)).current;
  const glow   = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const dot    = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.82,
      tension: 90, friction: 10,
      useNativeDriver: true,
    }).start();
    Animated.timing(glow, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(dot, {
      toValue: focused ? 1 : 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const bubbleBg = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.10)'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.bubble, { backgroundColor: bubbleBg }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={(focused ? iconOn : iconOff) as any}
            size={22}
            color={focused ? '#ffffff' : 'rgba(255,255,255,0.50)'}
          />
        </Animated.View>
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <Animated.View style={[styles.dot, { opacity: dot }]} />
    </TouchableOpacity>
  );
}

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom + 8, Platform.OS === 'ios' ? 28 : 16);
  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.pillShadow}>
        <View style={styles.pill}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
          {/* Glass border overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pillBorder}
            pointerEvents="none"
          />
          {/* Top specular line */}
          <View style={styles.topLine} pointerEvents="none" />
          {state.routes.map((route, idx) => {
            const tab = TABS.find((t) => t.name === route.name) ?? TABS[0];
            const focused = state.index === idx;
            return (
              <TabItem
                key={route.key}
                iconOn={tab.icon}
                iconOff={tab.iconOff}
                label={tab.label}
                focused={focused}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="today"         options={{ title: t('tabs.today') }} />
      <Tabs.Screen name="profile"       options={{ title: t('tabs.profile') }} />
      <Tabs.Screen name="compatibility" options={{ title: t('tabs.compatibility') }} />
      <Tabs.Screen name="explore"       options={{ title: t('tabs.explore') }} />
      <Tabs.Screen name="cosmos"        options={{ title: t('tabs.cosmos') }} />
    </Tabs>
  );
}

const BAR_H = 64;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  pillShadow: {
    borderRadius: BORDER_RADIUS.xxl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 32,
    elevation: 24,
  },
  pill: {
    flexDirection: 'row',
    height: BAR_H,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  pillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  topLine: {
    position: 'absolute',
    top: 0, left: 28, right: 28, height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 4,
    gap: 2,
    zIndex: 3,
  },
  bubble: {
    width: 44, height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.50)',
    fontFamily: 'Cinzel_400Regular',
    letterSpacing: 0.5,
  },
  labelFocused: { color: '#ffffff' },
  dot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#ffffff',
    marginTop: 1,
  },
});
