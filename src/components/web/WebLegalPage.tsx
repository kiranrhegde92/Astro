import React from 'react';
import { Link } from 'expo-router';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from './WebShell';
import { SEOHead } from './SEOHead';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export interface LegalSection {
  title: string;
  body: string;
}

interface WebLegalPageProps {
  eyebrow: string;
  title: string;
  headline: string;
  updated: string;
  sections: LegalSection[];
  metaDescription: string;
  canonical?: string;
}

export function WebLegalPage({
  eyebrow,
  title,
  headline,
  updated,
  sections,
  metaDescription,
  canonical,
}: WebLegalPageProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  return (
    <WebShell>
      <SEOHead
        title={`${title} — CosmicSelf`}
        description={metaDescription}
        canonical={canonical}
      />

      <View style={[styles.article, isWide && styles.articleWide]}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.headline, !isWide && styles.headlineCompact]}>{headline}</Text>
        <Text style={styles.updated}>{updated}</Text>

        <View style={styles.divider} />

        {sections.map((section, i) => (
          <View
            key={section.title}
            style={[styles.section, i === sections.length - 1 && styles.sectionLast]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <Link href="/" style={styles.backLink as any}>
          ← Back to home
        </Link>
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  article: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
    paddingTop: 40,
    paddingBottom: 64,
    paddingHorizontal: SPACING.lg,
  },
  articleWide: {
    paddingTop: 64,
    paddingBottom: 96,
  },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  headline: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1.5,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(120deg, #fff8f2 0%, #ffd9b8 42%, #12c8b2 78%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
        }
      : {}),
  },
  headlineCompact: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  updated: {
    color: 'rgba(255,248,242,0.58)',
    fontFamily: FONTS.body,
    fontSize: 14,
    marginTop: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,248,242,0.16)',
    marginVertical: 34,
  },
  section: {
    marginBottom: 30,
  },
  sectionLast: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  sectionBody: {
    color: 'rgba(255,248,242,0.74)',
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 26,
  },
  backLink: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 24,
    textDecorationLine: 'none',
  },
});
