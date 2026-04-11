import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Head from 'expo-router/head';
import { ZodiacThreeScene } from '../src/components/web/ZodiacThreeScene';
import { COLORS, FONTS, SHADOWS } from '../src/constants/theme';

const SYSTEMS = [
  ['Western', 'Transit mood'],
  ['Vedic', 'Rashi timing'],
  ['Chinese', 'Element rhythm'],
  ['KP', 'Signal detail'],
] as const;

const DAILY_FLOW = [
  ['01', 'Today', 'A concise daily read instead of a generic horoscope.'],
  ['02', 'Self', 'Birth-pattern insights across four astrology systems.'],
  ['03', 'Match', 'Compatibility and cosmic QR sharing for people you save.'],
] as const;

const DOWNLOAD_OPTIONS = [
  ['Android', 'Google Play', 'Coming soon'],
  ['iPhone', 'App Store', 'Coming soon'],
] as const;

export default function LaunchScreen() {
  const { width } = useWindowDimensions();
  const reveal = useRef(new Animated.Value(0)).current;
  const isDesktop = width >= 980;
  const isWide = width >= 720;
  const isCompact = width < 390;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const intro = Animated.timing(reveal, {
      toValue: 1,
      duration: 720,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    intro.start();
    return () => intro.stop();
  }, [reveal]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={COLORS.western} />
      </View>
    );
  }

  const heroLift = reveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <>
      <Head>
        <title>CosmicSelf - Daily Astrology App</title>
        <meta
          name="description"
          content="CosmicSelf is a mobile astrology app for daily guidance, self-knowledge, compatibility, and cosmic QR sharing across Western, Vedic, Chinese, and KP systems."
        />
      </Head>

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={COLORS.gradientBg} style={styles.hero}>
          <View style={styles.heroAura} />
          <View style={styles.nav}>
            <Text style={styles.navBrand}>CosmicSelf</Text>
            <Text style={styles.navDomain}>cosmicself.app</Text>
          </View>

          <Animated.View
            style={[
              styles.heroGrid,
              isDesktop && styles.heroGridDesktop,
              { opacity: reveal, transform: [{ translateY: heroLift }] },
            ]}
          >
            <View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>
              <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact, isWide && styles.brandTitleWide]}>
                CosmicSelf
              </Text>
              <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact, isWide && styles.heroTitleWide]}>
                Daily astrology, translated into one clean mobile ritual.
              </Text>
              <Text style={styles.heroBody}>
                CosmicSelf blends Western, Vedic, Chinese, and KP astrology into daily guidance, self-reading,
                compatibility, and shareable cosmic QR profiles.
              </Text>

              <View style={styles.downloadRow}>
                {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
                  <View key={platform} style={styles.downloadButton}>
                    <Text style={styles.downloadPlatform}>{platform}</Text>
                    <Text style={styles.downloadStore}>{store}</Text>
                    <Text style={styles.downloadStatus}>{status}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.cosmicConsole, isDesktop && styles.cosmicConsoleDesktop]}>
              <LinearGradient colors={COLORS.gradientInk} style={styles.consoleSurface}>
                <ZodiacThreeScene />
                <View style={styles.consoleHeader}>
                  <Text style={styles.consoleKicker}>Daily Blend</Text>
                  <Text style={styles.consoleScore}>72</Text>
                </View>
                <View style={styles.consoleReadout}>
                  <Text style={styles.consoleTitle}>Opening window</Text>
                  <Text style={styles.consoleText}>
                    Good timing for small decisions, direct conversations, and resetting the day with intention.
                  </Text>
                </View>
                <View style={styles.systemRail}>
                  {SYSTEMS.map(([system, label], index) => (
                    <View
                      key={system}
                      style={[
                        styles.systemPill,
                        index === 1 && styles.systemPillVedic,
                        index === 2 && styles.systemPillChinese,
                        index === 3 && styles.systemPillKp,
                      ]}
                    >
                      <Text style={styles.systemPillTitle}>{system}</Text>
                      <Text style={styles.systemPillLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={[styles.storyStrip, isWide && styles.storyStripWide]}>
          {DAILY_FLOW.map(([number, title, body]) => (
            <View key={title} style={styles.storyItem}>
              <Text style={styles.storyNumber}>{number}</Text>
              <Text style={styles.storyTitle}>{title}</Text>
              <Text style={styles.storyBody}>{body}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.appSection, isWide && styles.appSectionWide]}>
          <Text style={styles.sectionTitle}>Made to feel like opening your chart, not reading an article.</Text>
          <View style={styles.sectionCopyBlock}>
            <Text style={styles.sectionCopy}>
              The app keeps astrology practical: a daily read, your deeper pattern, match insights, and a QR identity
              you can share. The website stays simple because the mobile app is the product.
            </Text>
            <View style={styles.featureList}>
              {SYSTEMS.map(([system, label], index) => (
                <View key={system} style={[styles.featureRow, index === SYSTEMS.length - 1 && styles.featureRowLast]}>
                  <Text style={styles.featureAccent}>0{index + 1}</Text>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{system}</Text>
                    <Text style={styles.featureBody}>{label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <LinearGradient colors={COLORS.gradientInkSoft} style={styles.downloadSection}>
          <Text style={styles.downloadTitle}>Download options</Text>
          <Text style={styles.downloadBody}>Android and iPhone builds are the only entry points. No web login. No web registration.</Text>
          <View style={styles.finalDownloadRow}>
            {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
              <View key={platform} style={styles.finalDownloadButton}>
                <Text style={styles.finalPlatform}>{platform}</Text>
                <Text style={styles.finalStore}>{store}</Text>
                <Text style={styles.finalStatus}>{status}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDeep,
  },
  page: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  pageContent: {
    backgroundColor: COLORS.bgDeep,
  },
  hero: {
    minHeight: 780,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 72,
  },
  heroAura: {
    position: 'absolute',
    right: -160,
    top: -170,
    width: 520,
    height: 520,
    borderRadius: 999,
    backgroundColor: 'rgba(255,138,91,0.20)',
  },
  nav: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  navBrand: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 23,
    letterSpacing: -0.2,
  },
  navDomain: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  heroGrid: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingTop: 62,
    gap: 42,
  },
  heroGridDesktop: {
    minHeight: 610,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCopy: {
    maxWidth: 650,
  },
  heroCopyDesktop: {
    flex: 1,
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
    fontSize: 68,
    lineHeight: 74,
    letterSpacing: -2,
  },
  brandTitleCompact: {
    fontSize: 55,
    lineHeight: 61,
    letterSpacing: -1.5,
  },
  brandTitleWide: {
    fontSize: 118,
    lineHeight: 116,
    letterSpacing: -4.2,
  },
  heroTitle: {
    color: COLORS.inkMid,
    fontFamily: FONTS.heading,
    fontSize: 30,
    lineHeight: 37,
    letterSpacing: -0.8,
    marginTop: 18,
    maxWidth: 700,
  },
  heroTitleCompact: {
    fontSize: 26,
    lineHeight: 33,
  },
  heroTitleWide: {
    fontSize: 45,
    lineHeight: 51,
    letterSpacing: -1.2,
  },
  heroBody: {
    color: COLORS.textSecondary,
    fontSize: 17,
    lineHeight: 28,
    marginTop: 22,
    maxWidth: 620,
  },
  downloadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 34,
  },
  downloadButton: {
    minWidth: 204,
    minHeight: 88,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
    paddingHorizontal: 18,
    paddingVertical: 13,
    ...SHADOWS.glass,
  },
  downloadPlatform: {
    color: COLORS.western,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  downloadStore: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 29,
    marginTop: 2,
  },
  downloadStatus: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  cosmicConsole: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 470,
    aspectRatio: 0.92,
  },
  cosmicConsoleDesktop: {
    flex: 0.86,
    maxWidth: 560,
  },
  consoleSurface: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.18)',
    padding: 22,
    justifyContent: 'space-between',
    ...SHADOWS.deep,
  },
  consoleHeader: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  consoleKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  consoleScore: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
  },
  consoleReadout: {
    zIndex: 2,
    maxWidth: 320,
    marginTop: 'auto',
  },
  consoleTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 28,
    lineHeight: 34,
  },
  consoleText: {
    color: 'rgba(255,248,242,0.74)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  systemRail: {
    zIndex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
  },
  systemPill: {
    minWidth: 112,
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.western,
    backgroundColor: 'rgba(255,248,242,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  systemPillVedic: {
    borderLeftColor: COLORS.vedic,
  },
  systemPillChinese: {
    borderLeftColor: COLORS.chinese,
  },
  systemPillKp: {
    borderLeftColor: COLORS.kp,
  },
  systemPillTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 15,
  },
  systemPillLabel: {
    color: 'rgba(255,248,242,0.62)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  storyStrip: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 44,
    gap: 18,
  },
  storyStripWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storyItem: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    paddingTop: 18,
  },
  storyNumber: {
    color: COLORS.western,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.3,
  },
  storyTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 28,
    lineHeight: 34,
    marginTop: 6,
  },
  storyBody: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 5,
    maxWidth: 330,
  },
  appSection: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 80,
    gap: 30,
  },
  appSectionWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flex: 0.95,
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
    fontSize: 54,
    lineHeight: 59,
    letterSpacing: -1.7,
    maxWidth: 610,
  },
  sectionCopyBlock: {
    flex: 1,
    maxWidth: 620,
  },
  sectionCopy: {
    color: COLORS.textSecondary,
    fontSize: 19,
    lineHeight: 31,
  },
  featureList: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  featureRowLast: {
    borderBottomWidth: 0,
  },
  featureAccent: {
    width: 42,
    color: COLORS.vedic,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  featureBody: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 3,
  },
  downloadSection: {
    paddingHorizontal: 20,
    paddingVertical: 88,
    alignItems: 'center',
  },
  downloadTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 56,
    lineHeight: 62,
    textAlign: 'center',
    letterSpacing: -1.8,
  },
  downloadBody: {
    color: 'rgba(255,248,242,0.74)',
    fontSize: 18,
    lineHeight: 29,
    textAlign: 'center',
    maxWidth: 680,
    marginTop: 16,
  },
  finalDownloadRow: {
    width: '100%',
    maxWidth: 720,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 36,
  },
  finalDownloadButton: {
    minWidth: 240,
    minHeight: 102,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.20)',
    backgroundColor: 'rgba(255,248,242,0.08)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  finalPlatform: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  finalStore: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 26,
    lineHeight: 32,
    marginTop: 3,
  },
  finalStatus: {
    color: 'rgba(255,248,242,0.62)',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
});
