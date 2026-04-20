import React, { useEffect, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebNav } from './WebNav';
import { WebFooter } from './WebFooter';
import { useAkashaEnabled } from '../../services/akashaFlag';
import { mountPlausible } from '../../utils/plausible';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';

export type WebAppShellVariant = 'landing' | 'app';

const APP_TABS = [
  { href: '/(tabs)/today', label: 'Today', segment: 'today', icon: 'sunny' as const },
  { href: '/(tabs)/akasha', label: 'Akasha', segment: 'akasha', icon: 'sparkles' as const },
  { href: '/(tabs)/profile', label: 'Profile', segment: 'profile', icon: 'person' as const },
  { href: '/(tabs)/compatibility', label: 'Compatibility', segment: 'compatibility', icon: 'heart' as const },
  { href: '/(tabs)/share', label: 'Share', segment: 'share', icon: 'share-social' as const },
  { href: '/settings', label: 'Settings', segment: 'settings', icon: 'settings-outline' as const },
];

export interface WebAppShellProps {
  children: React.ReactNode;
  variant?: WebAppShellVariant;
  showFooter?: boolean;
  showAppNav?: boolean;
}

export function WebAppShell({
  children,
  variant = 'app',
  showFooter = true,
  showAppNav,
}: WebAppShellProps) {
  useEffect(() => { if (Platform.OS === 'web') mountPlausible(); }, []);

  const { width } = useWindowDimensions();
  const router = useRouter();
  const segments = useSegments();
  const akashaEnabled = useAkashaEnabled();

  const isWide = width >= 720;
  const isDesktop = width >= 980;

  const currentSegment = useMemo(() => {
    // e.g. ["(tabs)", "today"] or ["settings"] or []
    const flat = segments as string[];
    if (flat[0] === '(tabs)' && flat[1]) return flat[1];
    if (flat[0] && flat[0] !== '(tabs)') return flat[0];
    return '';
  }, [segments]);

  const visibleTabs = useMemo(
    () => APP_TABS.filter((tab) => (tab.segment === 'akasha' ? akashaEnabled : true)),
    [akashaEnabled],
  );

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const resolvedShowAppNav = showAppNav ?? variant === 'app';
  const chrome = (
    <>
      <WebNav />
      {resolvedShowAppNav ? (
        <View style={[styles.appNavOuter, !isWide && styles.appNavOuterCompact]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.appNavInner, isDesktop && styles.appNavInnerWide]}
          >
            {visibleTabs.map((tab) => {
              const active = currentSegment === tab.segment;
              return (
                <Pressable
                  key={tab.segment}
                  onPress={() => router.push(tab.href as any)}
                  style={({ hovered }: any) => [
                    styles.appNavChip,
                    active && styles.appNavChipActive,
                    hovered && !active && styles.appNavChipHover,
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={14}
                    color={active ? COLORS.bgDeep : COLORS.textPrimary}
                    style={styles.appNavIcon}
                  />
                  <Text style={[styles.appNavLabel, active && styles.appNavLabelActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </>
  );

  // "app" variant: child screens (expo-router Tabs, etc.) manage their own
  // scroll and need a flex-bounded parent — no outer ScrollView.
  if (variant === 'app') {
    return (
      <View style={styles.root}>
        {chrome}
        <View style={styles.appBody}>{children}</View>
      </View>
    );
  }

  // "landing" variant: scrollable, centered, with footer.
  return (
    <View style={styles.root}>
      {chrome}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.body}>{children}</View>
        {showFooter ? <WebFooter /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
    minHeight: '100%',
  },
  scroll: { flex: 1 },
  scrollContent: { minHeight: '100%' },
  body: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto' as any,
  },
  appBody: { flex: 1 },
  appNavOuter: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.08)',
    backgroundColor: 'rgba(10,8,22,0.55)',
  },
  appNavOuterCompact: {
    paddingHorizontal: SPACING.sm,
  },
  appNavInner: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appNavInnerWide: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto' as any,
  },
  appNavChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.16)',
    backgroundColor: 'rgba(23,24,45,0.55)',
  },
  appNavChipHover: {
    borderColor: 'rgba(62,224,200,0.45)',
    backgroundColor: 'rgba(62,224,200,0.08)',
  },
  appNavChipActive: {
    borderColor: COLORS.tide,
    backgroundColor: COLORS.tide,
  },
  appNavIcon: { marginRight: 6 },
  appNavLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  appNavLabelActive: {
    color: '#0a0816',
    fontFamily: FONTS.accentBold,
  },
});

