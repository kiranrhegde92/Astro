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
  ['Western', 'Transit mood', 'What the sky is pressing on today.'],
  ['Vedic', 'Rashi timing', 'Your lunar rhythm, nakshatra tone, and timing.'],
  ['Chinese', 'Element rhythm', 'A second layer for pace, energy, and instinct.'],
  ['KP', 'Signal detail', 'Sharper house-level hints for the day ahead.'],
] as const;

const DAILY_FLOW = [
  ['01', 'Today', 'A short daily bend with strengths, weak spots, and timing.'],
  ['02', 'Self', 'Birth-pattern reading across Western, Vedic, Chinese, and KP.'],
  ['03', 'Match', 'Compatibility and cosmic QR sharing for saved people.'],
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
  const compactContentWidth = !isWide ? Math.max(280, Math.min(width, 390) - 52) : undefined;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const intro = Animated.timing(reveal, {
      toValue: 1,
      duration: 760,
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

  const heroLift = reveal.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

  return (
    <View style={styles.webShell}>
      <Head>
        <title>CosmicSelf - Daily Astrology App</title>
        <meta
          name="description"
          content="CosmicSelf is a mobile astrology app for daily guidance, self-knowledge, compatibility, and cosmic QR sharing across Western, Vedic, Chinese, and KP systems."
        />
        <style>{'html, body, #root { background: #17182d; min-height: 100%; } body { margin: 0; }'}</style>
      </Head>

      <ZodiacThreeScene variant="page" />
      <LinearGradient pointerEvents="none" colors={['rgba(23,24,45,0.38)', 'rgba(23,24,45,0.76)']} style={styles.sceneVeil} />

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Text style={styles.navBrand}>CosmicSelf</Text>
          {isWide ? <Text style={styles.navDomain}>cosmicself.app</Text> : null}
        </View>

        <Animated.View
          style={[
            styles.hero,
            isDesktop && styles.heroDesktop,
            { opacity: reveal, transform: [{ translateY: heroLift }] },
          ]}
        >
          <View style={[styles.heroCopy, !isWide && { maxWidth: compactContentWidth }, isDesktop && styles.heroCopyDesktop]}>
            <Text style={styles.eyebrow}>Mobile astrology ritual</Text>
            <Text style={[styles.brandTitle, !isWide && styles.brandTitleCompact, isWide && styles.brandTitleWide]}>
              CosmicSelf
            </Text>
            <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact, isWide && styles.heroTitleWide]}>
              Your day, chart, matches, and cosmic identity in one living app.
            </Text>
            <Text style={styles.heroBody}>
              CosmicSelf blends four astrology systems into a calm daily reading, deeper self insight, compatibility,
              and QR profiles you can share from the mobile app.
            </Text>

            <View style={[styles.downloadRow, !isWide && styles.downloadRowCompact]}>
              {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
                <View key={platform} style={[styles.downloadButton, !isWide && styles.downloadButtonCompact]}>
                  <Text style={styles.downloadPlatform}>{platform}</Text>
                  <Text style={styles.downloadStore}>{store}</Text>
                  <Text style={styles.downloadStatus}>{status}</Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.instrumentPanel,
              !isWide && styles.instrumentPanelCompact,
              !isWide && { maxWidth: compactContentWidth },
              isDesktop && styles.instrumentPanelDesktop,
            ]}
          >
            <View style={styles.instrumentHeader}>
              <Text style={styles.instrumentKicker}>Live app preview</Text>
              <Text style={[styles.instrumentScore, !isWide && styles.instrumentScoreCompact]}>72</Text>
            </View>
            <View>
              <Text style={styles.instrumentTitle}>Today bends warm.</Text>
              <Text style={styles.instrumentCopy}>
                Best for direct words, low-friction decisions, and resetting the day before it gets noisy.
              </Text>
            </View>
            <View style={styles.signalStack}>
              {SYSTEMS.map(([system, label], index) => (
                <View key={system} style={styles.signalRow}>
                  <Text style={styles.signalIndex}>0{index + 1}</Text>
                  <View style={styles.signalText}>
                    <Text style={styles.signalTitle}>{system}</Text>
                    <Text style={styles.signalLabel}>{label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={[styles.ritualStrip, isWide && styles.ritualStripWide]}>
          {DAILY_FLOW.map(([number, title, body]) => (
            <View key={title} style={styles.ritualItem}>
              <Text style={styles.ritualNumber}>{number}</Text>
              <Text style={styles.ritualTitle}>{title}</Text>
              <Text style={styles.ritualBody}>{body}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.storySection, isWide && styles.storySectionWide]}>
          <Text style={[styles.sectionTitle, !isWide && styles.sectionTitleCompact]}>
            Built like a personal orrery, not a horoscope blog.
          </Text>
          <View style={styles.sectionCopyBlock}>
            <Text style={styles.sectionCopy}>
              The website stays simple because the mobile app is the product. Open the app for daily bends, profile
              insight, match reading, and a shareable cosmic QR identity.
            </Text>
            <View style={styles.systemList}>
              {SYSTEMS.map(([system, label, body], index) => (
                <View key={system} style={[styles.systemRow, index === SYSTEMS.length - 1 && styles.systemRowLast]}>
                  <Text style={styles.systemAccent}>{system}</Text>
                  <View style={styles.systemText}>
                    <Text style={styles.systemLabel}>{label}</Text>
                    <Text style={styles.systemBody}>{body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <LinearGradient colors={['rgba(255,248,242,0.18)', 'rgba(255,138,91,0.14)', 'rgba(18,200,178,0.10)']} style={styles.downloadSection}>
          <Text style={[styles.downloadTitle, !isWide && styles.downloadTitleCompact]}>Download the mobile app</Text>
          <Text style={styles.downloadBody}>
            No web registration. No browser login. CosmicSelf is a mobile-first astrology experience for Android and iPhone.
          </Text>
          <View style={styles.finalDownloadRow}>
            {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
              <View key={platform} style={[styles.finalDownloadButton, !isWide && styles.finalDownloadButtonCompact]}>
                <Text style={styles.finalPlatform}>{platform}</Text>
                <Text style={styles.finalStore}>{store}</Text>
                <Text style={styles.finalStatus}>{status}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDeep,
  },
  webShell: {
    position: 'relative',
    flex: 1,
    minHeight: '100%',
    backgroundColor: COLORS.ink,
    overflow: 'hidden',
  },
  sceneVeil: {
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
    backgroundColor: 'rgba(23,24,45,0.24)',
    zIndex: 2,
  },
  pageContent: {
    backgroundColor: 'rgba(23,24,45,0.04)',
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
  },
  navDomain: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  hero: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    minHeight: 720,
    justifyContent: 'center',
    gap: 34,
    paddingTop: 38,
    paddingBottom: 72,
  },
  heroDesktop: {
    minHeight: 790,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCopy: {
    width: '100%',
    maxWidth: 720,
  },
  heroCopyDesktop: {
    flex: 1,
    paddingRight: 34,
  },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  brandTitle: {
    maxWidth: '100%',
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 70,
    lineHeight: 74,
    letterSpacing: -2.5,
  },
  brandTitleCompact: {
    fontSize: 52,
    lineHeight: 57,
    letterSpacing: -1.6,
  },
  brandTitleWide: {
    fontSize: 126,
    lineHeight: 118,
    letterSpacing: -5,
  },
  heroTitle: {
    maxWidth: '100%',
    color: 'rgba(255,248,242,0.92)',
    fontFamily: FONTS.heading,
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginTop: 16,
  },
  heroTitleCompact: {
    fontSize: 25,
    lineHeight: 32,
  },
  heroTitleWide: {
    fontSize: 48,
    lineHeight: 53,
    letterSpacing: -1.4,
  },
  heroBody: {
    maxWidth: '100%',
    color: 'rgba(255,248,242,0.72)',
    fontSize: 17,
    lineHeight: 29,
    marginTop: 22,
  },
  downloadRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 34,
  },
  downloadRowCompact: {
    flexDirection: 'column',
  },
  downloadButton: {
    minWidth: 208,
    minHeight: 90,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.20)',
    backgroundColor: 'rgba(23,24,45,0.62)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...SHADOWS.deep,
  },
  downloadButtonCompact: {
    width: '100%',
    minWidth: 0,
  },
  downloadPlatform: {
    color: COLORS.tide,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  downloadStore: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 25,
    lineHeight: 31,
    marginTop: 2,
  },
  downloadStatus: {
    color: 'rgba(255,248,242,0.62)',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  instrumentPanel: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.22)',
    backgroundColor: 'rgba(23,24,45,0.62)',
    padding: 22,
    gap: 24,
    ...SHADOWS.deep,
  },
  instrumentPanelCompact: {
    padding: 18,
    gap: 20,
  },
  instrumentPanelDesktop: {
    flex: 0.86,
    maxWidth: 500,
    transform: [{ translateY: 42 }],
  },
  instrumentHeader: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  instrumentKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 7,
  },
  instrumentScore: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 78,
    lineHeight: 82,
    letterSpacing: -2.4,
  },
  instrumentScoreCompact: {
    fontSize: 60,
    lineHeight: 64,
    letterSpacing: -1.7,
  },
  instrumentTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  instrumentCopy: {
    color: 'rgba(255,248,242,0.70)',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 8,
  },
  signalStack: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.16)',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.12)',
  },
  signalIndex: {
    width: 34,
    color: COLORS.vedic,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  signalText: {
    flex: 1,
  },
  signalTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 19,
    lineHeight: 24,
  },
  signalLabel: {
    color: 'rgba(255,248,242,0.58)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  ritualStrip: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    gap: 18,
    paddingVertical: 62,
  },
  ritualStripWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ritualItem: {
    flex: 1,
    minHeight: 180,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.20)',
    paddingTop: 18,
  },
  ritualNumber: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  ritualTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 32,
    lineHeight: 38,
    marginTop: 10,
  },
  ritualBody: {
    color: 'rgba(255,248,242,0.67)',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 10,
    maxWidth: 330,
  },
  storySection: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingVertical: 86,
    gap: 34,
  },
  storySectionWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flex: 0.95,
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: -2,
    maxWidth: 620,
  },
  sectionTitleCompact: {
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
  },
  sectionCopyBlock: {
    flex: 1,
    maxWidth: 610,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,248,242,0.20)',
    paddingLeft: 26,
  },
  sectionCopy: {
    color: 'rgba(255,248,242,0.72)',
    fontSize: 19,
    lineHeight: 32,
  },
  systemList: {
    marginTop: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.16)',
  },
  systemRow: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.14)',
  },
  systemRowLast: {
    borderBottomWidth: 0,
  },
  systemAccent: {
    width: 86,
    color: COLORS.tide,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.2,
    paddingTop: 3,
  },
  systemText: {
    flex: 1,
  },
  systemLabel: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 23,
    lineHeight: 29,
  },
  systemBody: {
    color: 'rgba(255,248,242,0.62)',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 4,
  },
  downloadSection: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.18)',
    paddingHorizontal: 22,
    paddingVertical: 78,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 42,
    overflow: 'hidden',
  },
  downloadTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 58,
    lineHeight: 62,
    textAlign: 'center',
    letterSpacing: -2,
  },
  downloadTitleCompact: {
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
  },
  downloadBody: {
    color: 'rgba(255,248,242,0.72)',
    fontSize: 18,
    lineHeight: 29,
    textAlign: 'center',
    maxWidth: 700,
    marginTop: 16,
  },
  finalDownloadRow: {
    width: '100%',
    maxWidth: 760,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 36,
  },
  finalDownloadButton: {
    minWidth: 250,
    minHeight: 106,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.22)',
    backgroundColor: 'rgba(23,24,45,0.58)',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  finalDownloadButtonCompact: {
    width: '100%',
    minWidth: 0,
  },
  finalPlatform: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  finalStore: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 27,
    lineHeight: 33,
    marginTop: 3,
  },
  finalStatus: {
    color: 'rgba(255,248,242,0.64)',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
});
