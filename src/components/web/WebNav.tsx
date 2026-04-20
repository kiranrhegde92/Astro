import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export function WebNav() {
  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Link href="/" style={styles.brand}>
          <Text style={styles.brandText}>CosmicSelf</Text>
        </Link>
        <View style={styles.links}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href as any} style={styles.link}>
              <Text style={styles.linkText}>{l.label}</Text>
            </Link>
          ))}
          <Link href="/" style={styles.cta}>
            <Text style={styles.ctaText}>Open App</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(12px)' as any,
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
  brandText: { color: COLORS.textPrimary, fontSize: 18, fontFamily: FONTS.display, letterSpacing: 0.5 },
  links: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  link: { textDecorationLine: 'none' as any },
  linkText: { color: COLORS.textSecondary, fontSize: 14, fontFamily: FONTS.body },
  cta: {
    backgroundColor: COLORS.tide,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    textDecorationLine: 'none' as any,
  },
  ctaText: { color: '#0a0816', fontSize: 14, fontFamily: FONTS.accent, letterSpacing: 0.4 },
});
