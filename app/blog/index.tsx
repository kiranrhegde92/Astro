import React from 'react';
import { Link } from 'expo-router';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../../src/components/web/WebShell';
import { SEOHead } from '../../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { POSTS } from '../../src/content/posts';

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

export default function BlogIndexPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <WebShell>
      <SEOHead
        title="Field Notes — CosmicSelf"
        description="Short essays from the CosmicSelf team on astrology, craft, and how we build readings that respect your time."
        canonical="https://cosmicself.app/blog"
      />

      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.eyebrow}>FIELD NOTES</Text>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
          Short essays, honestly written.
        </Text>
        <Text style={[styles.heroBody, isWide && styles.heroBodyWide]}>
          The thinking behind the app — why we work across four systems, how we design the
          daily ritual, and what we mean by plain-English astrology. No SEO farming, no
          listicles. Just pieces we wanted to write.
        </Text>
      </View>

      <View style={[styles.list, isWide && styles.listWide]}>
        {POSTS.map((p, i) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} asChild>
            <View
              style={[
                styles.card,
                { borderColor: i % 2 === 0 ? 'rgba(62,224,200,0.26)' : 'rgba(241,183,79,0.26)' },
                Platform.OS === 'web' &&
                  ({
                    backgroundImage:
                      i % 2 === 0
                        ? 'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)'
                        : 'radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.13) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)',
                    cursor: 'pointer' as any,
                    transitionProperty: 'transform, box-shadow, border-color' as any,
                    transitionDuration: '200ms' as any,
                  } as any),
              ]}
            >
              <View style={styles.cardMeta}>
                <Text style={[styles.tag, { color: i % 2 === 0 ? COLORS.tide : COLORS.starGold }]}>
                  {p.tag}
                </Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.date}>{formatDate(p.date)}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.readTime}>{p.readMinutes} min read</Text>
              </View>
              <Text style={[styles.cardTitle, !isWide && styles.cardTitleCompact]}>{p.title}</Text>
              <Text style={styles.cardDesc}>{p.description}</Text>
              <Text style={[styles.readMore, { color: i % 2 === 0 ? COLORS.tide : COLORS.starGold }]}>
                Read the essay →
              </Text>
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
    paddingBottom: 56,
    paddingHorizontal: SPACING.lg,
  },
  heroWide: { paddingTop: 86, paddingBottom: 64, paddingHorizontal: SPACING.xl },
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

  list: {
    gap: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  listWide: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 120,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 28,
    gap: 12,
    ...SHADOWS.deep,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  tag: {
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  dot: { color: 'rgba(255,248,242,0.36)', fontSize: 13 },
  date: {
    color: 'rgba(255,248,242,0.58)',
    fontFamily: FONTS.body,
    fontSize: 13,
  },
  readTime: {
    color: 'rgba(255,248,242,0.58)',
    fontFamily: FONTS.body,
    fontSize: 13,
  },

  cardTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.2,
    marginTop: 4,
  },
  cardTitleCompact: { fontSize: 28, lineHeight: 32, letterSpacing: -0.9 },
  cardDesc: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 680,
  },
  readMore: {
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});
