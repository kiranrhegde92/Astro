import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, useRouter, useSegments } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useWebFullAppEnabled } from '../../hooks/useWebFullAppEnabled';

const MARKETING_LINKS = [
  { href: '/features', label: 'Features', segment: 'features' },
  { href: '/pricing', label: 'Pricing', segment: 'pricing' },
  { href: '/blog', label: 'Blog', segment: 'blog' },
  { href: '/about', label: 'About', segment: 'about' },
];

const APP_LINKS = [
  { href: '/(tabs)/today', label: 'Today', segment: 'today' },
  { href: '/(tabs)/profile', label: 'Profile', segment: 'profile' },
  { href: '/settings', label: 'Settings', segment: 'settings' },
];

export function WebNav() {
  const router = useRouter();
  const segments = useSegments();
  const { width } = useWindowDimensions();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const logout = useAuthStore((s) => s.logout);
  const { enabled: fullAppEnabled } = useWebFullAppEnabled();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {}
    router.replace('/' as any);
  };

  const isCompact = width < 720;

  const currentSegment = useMemo(() => {
    const flat = segments as string[];
    if (flat[0] === '(tabs)' && flat[1]) return flat[1];
    if (flat[0]) return flat[0];
    return '';
  }, [segments]);

  const inAppArea = useMemo(() => {
    const flat = segments as string[];
    return (
      flat[0] === '(tabs)' ||
      flat[0] === '(onboarding)' ||
      flat[0] === 'reading' ||
      flat[0] === 'profile' ||
      flat[0] === 'settings' ||
      flat[0] === 'journal' ||
      flat[0] === 'journal-insights' ||
      flat[0] === 'subscription' ||
      flat[0] === 'moon-calendar' ||
      flat[0] === 'retrograde'
    );
  }, [segments]);

  const links = inAppArea && fullAppEnabled && firebaseUser ? APP_LINKS : MARKETING_LINKS;
  const showAuthSplit = !firebaseUser;

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Link href="/" style={styles.brand}>
          <Text style={styles.brandText}>CosmicSelf</Text>
        </Link>
        {!isCompact ? (
          <View style={styles.links}>
            {links.map((l) => {
              const active = currentSegment === l.segment;
              return (
                <Link key={l.href} href={l.href as any} style={styles.link}>
                  <Text style={[styles.linkText, active && styles.linkTextActive]}>{l.label}</Text>
                </Link>
              );
            })}
            {showAuthSplit ? (
              <>
                <Pressable onPress={() => router.push('/(auth)/login' as any)} style={({ hovered }: any) => [styles.ghost, hovered && styles.ghostHover]}>
                  <Text style={styles.ghostText}>Sign in</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/(auth)/signup' as any)} style={({ hovered }: any) => [styles.cta, hovered && styles.ctaHover]}>
                  <Text style={styles.ctaText}>Create account</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => {
                    if (firebaseUser) router.push('/(tabs)/today' as any);
                    else router.push('/#download' as any);
                  }}
                  style={({ hovered }: any) => [styles.cta, hovered && styles.ctaHover]}
                >
                  <Text style={styles.ctaText}>{firebaseUser ? 'Open Web App' : 'Get the App'}</Text>
                </Pressable>
                {firebaseUser ? (
                  <Pressable
                    onPress={handleSignOut}
                    style={({ hovered }: any) => [styles.ghost, hovered && styles.ghostHover]}
                  >
                    <Text style={styles.ghostText}>Sign out</Text>
                  </Pressable>
                ) : null}
              </>
            )}
          </View>
        ) : showAuthSplit ? (
          <View style={styles.compactAuthRow}>
            <Pressable onPress={() => router.push('/(auth)/login' as any)} style={({ hovered }: any) => [styles.ghost, hovered && styles.ghostHover]}>
              <Text style={styles.ghostText}>Sign in</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(auth)/signup' as any)} style={({ hovered }: any) => [styles.cta, hovered && styles.ctaHover]}>
              <Text style={styles.ctaText}>Create account</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.compactAuthRow}>
            <Pressable
              onPress={() => {
                if (firebaseUser) router.push('/(tabs)/today' as any);
                else router.push('/#download' as any);
              }}
              style={({ hovered }: any) => [styles.cta, hovered && styles.ctaHover]}
            >
              <Text style={styles.ctaText}>{firebaseUser ? 'Open Web App' : 'Get the App'}</Text>
            </Pressable>
            {firebaseUser ? (
              <Pressable
                onPress={handleSignOut}
                style={({ hovered }: any) => [styles.ghost, hovered && styles.ghostHover]}
              >
                <Text style={styles.ghostText}>Sign out</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(14px)' as any,
    backgroundColor: 'rgba(10,8,22,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.08)',
  },
  inner: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto' as any,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { textDecorationLine: 'none' as any },
  brandText: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.display,
    letterSpacing: 0.5,
  },
  links: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  link: { textDecorationLine: 'none' as any, paddingVertical: 4 },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.body,
  },
  linkTextActive: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.accentBold,
  },
  cta: {
    backgroundColor: COLORS.tide,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    textDecorationLine: 'none' as any,
    transitionProperty: 'transform, box-shadow, background-color' as any,
    transitionDuration: '200ms' as any,
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' as any,
  },
  ctaHover: {
    transform: [{ translateY: -1 }],
    boxShadow: '0 16px 32px -18px rgba(62,224,200,0.8)' as any,
  },
  ctaText: {
    color: '#0a0816',
    fontSize: 14,
    fontFamily: FONTS.accentBold,
    letterSpacing: 0.6,
  },
  ghost: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.28)',
    backgroundColor: 'rgba(255,248,242,0.04)',
    transitionProperty: 'transform, border-color, background-color' as any,
    transitionDuration: '200ms' as any,
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' as any,
  },
  ghostHover: {
    borderColor: 'rgba(255,248,242,0.64)',
    backgroundColor: 'rgba(255,248,242,0.08)',
  },
  ghostText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: FONTS.accentBold,
    letterSpacing: 0.6,
  },
  compactAuthRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});
