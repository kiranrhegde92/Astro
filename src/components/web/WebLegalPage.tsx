import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import Head from 'expo-router/head';
import { LinearGradient } from 'expo-linear-gradient';
import { ZodiacThreeScene } from './ZodiacThreeScene';
import { WebFooter } from './WebFooter';
import { COLORS, FONTS } from '../../constants/theme';

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
}

export function WebLegalPage({
  eyebrow,
  title,
  headline,
  updated,
  sections,
  metaDescription,
}: WebLegalPageProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  return (
    <View style={styles.shell}>
      <Head>
        <title>{`${title} — CosmicSelf`}</title>
        <meta name="description" content={metaDescription} />
        <style>{'html, body, #root { background: #17182d; min-height: 100%; } body { margin: 0; }'}</style>
      </Head>

      <ZodiacThreeScene variant="page" />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(23,24,45,0.60)', 'rgba(23,24,45,0.86)']}
        style={styles.veil}
      />

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Link href="/" style={styles.navBrand as any}>
            CosmicSelf
          </Link>
          {isWide ? <Text style={styles.navDomain}>cosmicself.app</Text> : null}
        </View>

        <View style={[styles.article, !isWide && styles.articleCompact]}>
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

        <WebFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    flex: 1,
    minHeight: '100%',
    backgroundColor: COLORS.bgDeep,
    overflow: 'hidden',
  },
  veil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  page: {
    position: 'relative',
    flex: 1,
    zIndex: 2,
  },
  pageContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  nav: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 20,
  },
  navBrand: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 24,
    letterSpacing: -0.2,
    textDecorationLine: 'none',
  },
  navDomain: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  article: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
    paddingTop: 54,
    paddingBottom: 32,
  },
  articleCompact: {
    paddingTop: 32,
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
  },
  headlineCompact: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  updated: {
    color: 'rgba(255,248,242,0.58)',
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
