import React from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../../src/components/web/WebShell';
import { SEOHead } from '../../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { POSTS, getPostBySlug, listPostSlugs, type PostBlock } from '../../src/content/posts';

export function generateStaticParams() {
  return listPostSlugs().map((slug) => ({ slug }));
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

export default function BlogPostPage() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const raw = params.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const post = slug ? getPostBySlug(slug) : undefined;
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  if (!post) {
    return (
      <WebShell>
        <SEOHead
          title="Post not found — CosmicSelf"
          description="That essay could not be found. Browse the Field Notes index for all available posts."
          noindex
        />
        <View style={[styles.missing, isWide && styles.missingWide]}>
          <Text style={styles.eyebrow}>NOT FOUND</Text>
          <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
            That essay is not here.
          </Text>
          <Text style={styles.heroBody}>
            The post you are looking for may have been moved or renamed. Head back to Field
            Notes to see everything we have published.
          </Text>
          <Link href="/blog">
            <Text style={styles.backLink}>← Back to Field Notes</Text>
          </Link>
        </View>
      </WebShell>
    );
  }

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <WebShell>
      <SEOHead
        title={`${post.title} — CosmicSelf`}
        description={post.description}
        canonical={`https://cosmicself.app/blog/${post.slug}`}
        type="article"
      />

      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Link href="/blog">
          <Text style={styles.crumb}>← FIELD NOTES</Text>
        </Link>
        <View style={styles.metaRow}>
          <Text style={styles.tag}>{post.tag}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{formatDate(post.date)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{post.readMinutes} min read</Text>
        </View>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>{post.title}</Text>
        <Text style={[styles.lede, isWide && styles.ledeWide]}>{post.description}</Text>
      </View>

      <View style={[styles.article, isWide && styles.articleWide]}>
        {post.body.map((block, i) => (
          <RenderBlock key={i} block={block} isWide={isWide} />
        ))}
      </View>

      {others.length > 0 ? (
        <View style={[styles.moreBand, isWide && styles.moreBandWide]}>
          <Text style={styles.sectionKicker}>MORE FIELD NOTES</Text>
          <View style={[styles.moreGrid, isWide && styles.moreGridWide]}>
            {others.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} asChild>
                <View
                  style={[
                    styles.moreCard,
                    { borderColor: i % 2 === 0 ? 'rgba(62,224,200,0.26)' : 'rgba(241,183,79,0.26)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.moreTag,
                      { color: i % 2 === 0 ? COLORS.tide : COLORS.starGold },
                    ]}
                  >
                    {p.tag}
                  </Text>
                  <Text style={styles.moreTitle}>{p.title}</Text>
                  <Text style={styles.moreDesc}>{p.description}</Text>
                </View>
              </Link>
            ))}
          </View>
        </View>
      ) : null}
    </WebShell>
  );
}

function RenderBlock({ block, isWide }: { block: PostBlock; isWide: boolean }) {
  switch (block.type) {
    case 'h2':
      return <Text style={[styles.h2, !isWide && styles.h2Compact]}>{block.text}</Text>;
    case 'h3':
      return <Text style={styles.h3}>{block.text}</Text>;
    case 'p':
      return <Text style={styles.p}>{block.text}</Text>;
    case 'ul':
      return (
        <View style={styles.ul}>
          {block.items.map((item, idx) => (
            <View key={idx} style={styles.li}>
              <Text style={styles.liDot}>—</Text>
              <Text style={styles.liText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'quote':
      return (
        <View style={styles.quoteWrap}>
          <Text style={styles.quoteMark}>"</Text>
          <Text style={styles.quoteText}>{block.text}</Text>
          {block.attribution ? <Text style={styles.quoteAttr}>— {block.attribution}</Text> : null}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
    maxWidth: 760,
    width: '100%',
    marginHorizontal: 'auto' as any,
  },
  heroWide: { paddingTop: 72, paddingBottom: 48 },
  crumb: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  tag: {
    color: COLORS.tide,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  metaDot: { color: 'rgba(255,248,242,0.36)', fontSize: 13 },
  metaText: {
    color: 'rgba(255,248,242,0.58)',
    fontFamily: FONTS.body,
    fontSize: 13,
  },
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
  lede: {
    color: 'rgba(255,248,242,0.78)',
    fontFamily: FONTS.body,
    fontSize: 19,
    lineHeight: 31,
    fontStyle: 'italic',
  },
  ledeWide: { fontSize: 21, lineHeight: 34 },
  heroBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 18,
  },

  article: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 64,
    maxWidth: 720,
    width: '100%',
    marginHorizontal: 'auto' as any,
    gap: 22,
  },
  articleWide: { paddingHorizontal: SPACING.xl, paddingBottom: 80 },

  p: {
    color: 'rgba(255,248,242,0.82)',
    fontFamily: FONTS.body,
    fontSize: 18,
    lineHeight: 32,
  },
  h2: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    marginTop: 20,
  },
  h2Compact: { fontSize: 26, lineHeight: 32, letterSpacing: -0.6 },
  h3: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    marginTop: 12,
  },
  ul: { gap: 10 },
  li: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  liDot: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 16,
    lineHeight: 30,
    minWidth: 14,
  },
  liText: {
    flex: 1,
    color: 'rgba(255,248,242,0.82)',
    fontFamily: FONTS.body,
    fontSize: 17,
    lineHeight: 30,
  },

  quoteWrap: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.starGold,
    paddingLeft: 22,
    paddingVertical: 6,
    marginVertical: 8,
    gap: 6,
  },
  quoteMark: {
    color: COLORS.starGold,
    fontFamily: FONTS.display,
    fontSize: 36,
    lineHeight: 36,
    marginBottom: -10,
  },
  quoteText: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 32,
  },
  quoteAttr: {
    color: 'rgba(255,248,242,0.58)',
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  moreBand: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
    paddingBottom: 100,
    maxWidth: 1100,
    width: '100%',
    marginHorizontal: 'auto' as any,
  },
  moreBandWide: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  sectionKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 22,
  },
  moreGrid: { gap: 16 },
  moreGridWide: { flexDirection: 'row', gap: 20 },
  moreCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.14)',
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 24,
    gap: 10,
    ...SHADOWS.card,
  },
  moreTag: {
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  moreTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.6,
  },
  moreDesc: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
  },

  missing: {
    paddingTop: 72,
    paddingBottom: 120,
    paddingHorizontal: SPACING.lg,
    maxWidth: 720,
    width: '100%',
    marginHorizontal: 'auto' as any,
  },
  missingWide: { paddingTop: 86, paddingHorizontal: SPACING.xl },
  backLink: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 18,
  },
});
