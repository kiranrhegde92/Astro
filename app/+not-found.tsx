import React from 'react';
import { Link } from 'expo-router';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../src/components/web/WebShell';
import { SEOHead } from '../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../src/constants/theme';

const LINKS: ReadonlyArray<{ href: string; label: string; note: string; accent: 'tide' | 'gold' }> = [
  { href: '/', label: 'Home', note: 'Start from the landing page.', accent: 'gold' },
  { href: '/features', label: 'Features', note: 'What the app actually does.', accent: 'tide' },
  { href: '/pricing', label: 'Pricing', note: 'Free vs premium, billing details.', accent: 'gold' },
  { href: '/blog', label: 'Field Notes', note: 'Essays from the team.', accent: 'tide' },
  { href: '/about', label: 'About', note: 'Principles and approach.', accent: 'gold' },
  { href: '/contact', label: 'Contact', note: 'Write to us — a human reads it.', accent: 'tide' },
];

export default function NotFoundPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  return (
    <WebShell>
      <SEOHead
        title="404 — CosmicSelf"
        description="That page drifted out of orbit. Here are some places to land instead."
        noindex
      />

      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.eyebrow}>404</Text>
        <Text style={[styles.bigNumber, !isWide && styles.bigNumberCompact]}>404</Text>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
          This page drifted out of orbit.
        </Text>
        <Text style={[styles.heroBody, isWide && styles.heroBodyWide]}>
          The URL you followed does not point anywhere we can read right now. It may have been
          renamed, or the link that brought you here may have been wrong. Here are some known
          places to land instead.
        </Text>
      </View>

      <View style={[styles.linkGrid, isWide && styles.linkGridWide]}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href as any} asChild>
            <View
              style={[
                styles.linkCard,
                {
                  borderColor:
                    l.accent === 'tide' ? 'rgba(62,224,200,0.26)' : 'rgba(241,183,79,0.26)',
                },
                Platform.OS === 'web' &&
                  ({
                    backgroundImage:
                      l.accent === 'tide'
                        ? 'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)'
                        : 'radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
                    cursor: 'pointer' as any,
                    transitionProperty: 'transform, box-shadow, border-color' as any,
                    transitionDuration: '200ms' as any,
                  } as any),
              ]}
            >
              <Text
                style={[
                  styles.linkKicker,
                  { color: l.accent === 'tide' ? COLORS.tide : COLORS.starGold },
                ]}
              >
                GO
              </Text>
              <Text style={styles.linkLabel}>{l.label}</Text>
              <Text style={styles.linkNote}>{l.note}</Text>
            </View>
          </Link>
        ))}
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: SPACING.lg,
    alignItems: 'flex-start',
  },
  heroWide: { paddingTop: 96, paddingBottom: 64, paddingHorizontal: SPACING.xl },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  bigNumber: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 180,
    lineHeight: 180,
    letterSpacing: -6,
    marginBottom: 14,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(140deg, #fff8f2 0%, #ffd9b8 35%, #12c8b2 72%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
          textShadow: '0 0 56px rgba(241,183,79,0.28)' as any,
        }
      : {}),
  },
  bigNumberCompact: {
    fontSize: 120,
    lineHeight: 120,
    letterSpacing: -4,
  },
  heroTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.6,
    maxWidth: 720,
    marginBottom: 20,
  },
  heroTitleCompact: { fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  heroBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 680,
  },
  heroBodyWide: { fontSize: 18, lineHeight: 30 },

  linkGrid: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    gap: 14,
  },
  linkGridWide: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  linkCard: {
    flexGrow: 1,
    flexBasis: 260,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 22,
    gap: 6,
    ...SHADOWS.card,
  },
  linkKicker: {
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  linkLabel: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
  },
  linkNote: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
  },
});
