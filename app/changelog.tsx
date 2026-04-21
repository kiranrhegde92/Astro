import React from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../src/components/web/WebShell';
import { SEOHead } from '../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../src/constants/theme';
import { CHANGELOG, type ChangelogCategory } from '../src/content/changelog';

const CATEGORY_STYLE: Record<ChangelogCategory, { label: string; color: string }> = {
  feature: { label: 'FEATURE', color: COLORS.starGold },
  improvement: { label: 'IMPROVEMENT', color: COLORS.tide },
  fix: { label: 'FIX', color: COLORS.plum },
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

export default function ChangelogPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <WebShell>
      <SEOHead
        title="Changelog — CosmicSelf"
        description="Release notes for CosmicSelf. What shipped, what got better, and what we fixed — version by version."
        canonical="https://cosmicself.app/changelog"
      />

      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.eyebrow}>CHANGELOG</Text>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
          What shipped, in order.
        </Text>
        <Text style={[styles.heroBody, isWide && styles.heroBodyWide]}>
          Every notable release since the early betas. New features, quieter improvements, and
          the bugs we squashed. No marketing spin — if a change mattered, it is here.
        </Text>
      </View>

      <View style={[styles.timeline, isWide && styles.timelineWide]}>
        {CHANGELOG.map((entry, i) => (
          <View
            key={entry.version}
            style={[
              styles.entry,
              { borderColor: i % 2 === 0 ? 'rgba(62,224,200,0.26)' : 'rgba(241,183,79,0.26)' },
              Platform.OS === 'web' &&
                ({
                  backgroundImage:
                    i % 2 === 0
                      ? 'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.12) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)'
                      : 'radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.12) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
                } as any),
            ]}
          >
            <View style={[styles.entryHeader, isWide && styles.entryHeaderWide]}>
              <View>
                <Text style={styles.versionLabel}>VERSION</Text>
                <Text style={styles.versionValue}>{entry.version}</Text>
              </View>
              <View style={isWide ? styles.headlineBlockWide : styles.headlineBlock}>
                <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
                <Text style={[styles.headline, !isWide && styles.headlineCompact]}>{entry.headline}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemsList}>
              {entry.items.map((item, idx) => {
                const cat = CATEGORY_STYLE[item.category];
                return (
                  <View key={`${entry.version}-${idx}`} style={styles.itemRow}>
                    <View style={[styles.catTag, { borderColor: cat.color }]}>
                      <Text style={[styles.catText, { color: cat.color }]}>{cat.label}</Text>
                    </View>
                    <Text style={styles.itemText}>{item.text}</Text>
                  </View>
                );
              })}
            </View>
          </View>
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
  },
  heroWide: { paddingTop: 86, paddingBottom: 60, paddingHorizontal: SPACING.xl },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  heroTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1.8,
    maxWidth: 780,
    marginBottom: 22,
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
  heroTitleCompact: { fontSize: 38, lineHeight: 42, letterSpacing: -1.2 },
  heroBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 720,
  },
  heroBodyWide: { fontSize: 19, lineHeight: 32 },

  timeline: {
    gap: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  timelineWide: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },

  entry: {
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 28,
    ...SHADOWS.deep,
  },
  entryHeader: { gap: 18 },
  entryHeaderWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 32,
  },
  versionLabel: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  versionValue: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.2,
  },
  headlineBlock: { gap: 6 },
  headlineBlockWide: { gap: 6, alignItems: 'flex-end' },
  dateText: {
    color: 'rgba(255,248,242,0.56)',
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headline: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    maxWidth: 520,
  },
  headlineCompact: { fontSize: 20, lineHeight: 26 },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,248,242,0.14)',
    marginVertical: 24,
  },

  itemsList: { gap: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  catTag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
    minWidth: 90,
    alignItems: 'center',
  },
  catText: {
    fontFamily: FONTS.accent,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  itemText: {
    flex: 1,
    color: 'rgba(255,248,242,0.78)',
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 24,
  },
});
