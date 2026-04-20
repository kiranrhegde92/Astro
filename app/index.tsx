import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ZodiacThreeScene } from '../src/components/web/ZodiacThreeScene';
import { WebFooter } from '../src/components/web/WebFooter';
import { WebNav } from '../src/components/web/WebNav';
import { SEOHead } from '../src/components/web/SEOHead';
import { PLAY_STORE_URL, APP_STORE_URL } from '../src/constants/storeLinks';
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
  { platform: 'Android', store: 'Google Play', status: 'Download', url: PLAY_STORE_URL },
  { platform: 'iPhone', store: 'App Store', status: 'Coming soon', url: APP_STORE_URL },
] as const;

const FEATURES = [
  [
    'Today Brief',
    'Daily',
    'A short, calm reading that blends transit, nakshatra, element, and KP signal for the day ahead.',
  ],
  [
    'Self Chart',
    'Birth pattern',
    'Four-system profile with plain-English takes on your Western, Vedic, Chinese, and KP signatures.',
  ],
  [
    'Ask Akasha',
    'AI oracle',
    'Ask a real question and get a grounded, personal answer rooted in your actual chart — not a horoscope blog.',
  ],
  [
    'Compatibility',
    'Match',
    'Deeper compatibility reading between any two saved people, with strengths, friction, and timing.',
  ],
  [
    'Cosmic QR',
    'Share',
    'A shareable cosmic identity — QR code, profile card, and link — that only shows what you pick.',
  ],
] as const;

const FAQ = [
  [
    'Is CosmicSelf free to use?',
    'Yes. The daily brief, self chart, and compatibility basics are free. Premium unlocks deeper readings, transit alerts, and reduced ads.',
  ],
  [
    'Which astrology systems does it use?',
    'Western, Vedic (sidereal), Chinese four pillars, and KP. Every reading draws from all four so you see a fuller picture, not just a sun sign.',
  ],
  [
    'Do I need to know my exact birth time?',
    'A time helps — KP and Vedic houses rely on it. If you are unsure, you can still use Today, compatibility, and most readings with a date-only profile.',
  ],
  [
    'Where is my birth data stored?',
    'On your device for speed and offline use, and in your signed-in account so it can sync across devices. We never sell it, and you can delete it from Settings at any time.',
  ],
  [
    'When will the app launch?',
    'CosmicSelf is in final pre-launch on Google Play and the App Store. The download buttons above will light up as soon as store review is complete.',
  ],
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
      <SEOHead
        title="CosmicSelf — Daily Astrology Across Four Systems"
        description="A quiet mobile astrology ritual — daily readings, natal chart, compatibility, and cosmic QR, drawn from Western, Vedic, Chinese, and KP systems."
        canonical="https://cosmicself.app/"
      />

      <ZodiacThreeScene variant="page" />
      <LinearGradient pointerEvents="none" colors={['rgba(23,24,45,0.38)', 'rgba(23,24,45,0.76)']} style={styles.sceneVeil} />
      <WebNav />

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>

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
              {DOWNLOAD_OPTIONS.map(({ platform, store, status, url }) => {
                const live = status === 'Download';
                return (
                  <Pressable
                    key={platform}
                    onPress={() => { if (live) Linking.openURL(url); }}
                    disabled={!live}
                    style={({ hovered, pressed }: any) => [
                      styles.downloadButton,
                      !isWide && styles.downloadButtonCompact,
                      live && styles.downloadButtonLive,
                      hovered && live && styles.downloadButtonHover,
                      pressed && live && styles.downloadButtonPressed,
                    ]}
                  >
                    <Text style={styles.downloadPlatform}>{platform}</Text>
                    <Text style={styles.downloadStore}>{store}</Text>
                    <Text style={[styles.downloadStatus, live && styles.downloadStatusLive]}>
                      {live ? `${status} →` : status}
                    </Text>
                  </Pressable>
                );
              })}
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

        <View style={styles.featuresSection}>
          <Text style={styles.sectionKicker}>WHAT'S INSIDE</Text>
          <Text style={[styles.featuresTitle, !isWide && styles.featuresTitleCompact]}>
            Five rituals, one quiet app.
          </Text>
          <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
            {FEATURES.map(([title, tag, body]) => (
              <View key={title} style={[styles.featureCard, !isWide && styles.featureCardCompact]}>
                <Text style={styles.featureTag}>{tag}</Text>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureBody}>{body}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionKicker}>FAQ</Text>
          <Text style={[styles.faqTitle, !isWide && styles.faqTitleCompact]}>
            The quick answers.
          </Text>
          <View style={styles.faqList}>
            {FAQ.map(([q, a], idx) => (
              <View key={q} style={[styles.faqItem, idx === FAQ.length - 1 && styles.faqItemLast]}>
                <Text style={styles.faqQuestion}>{q}</Text>
                <Text style={styles.faqAnswer}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        <LinearGradient colors={['rgba(255,248,242,0.18)', 'rgba(255,138,91,0.14)', 'rgba(18,200,178,0.10)']} style={styles.downloadSection}>
          <Text style={[styles.downloadTitle, !isWide && styles.downloadTitleCompact]}>Download the mobile app</Text>
          <Text style={styles.downloadBody}>
            No web registration. No browser login. CosmicSelf is a mobile-first astrology experience for Android and iPhone.
          </Text>
          <View style={styles.finalDownloadRow}>
            {DOWNLOAD_OPTIONS.map(({ platform, store, status, url }) => {
              const live = status === 'Download';
              return (
                <Pressable
                  key={platform}
                  onPress={() => { if (live) Linking.openURL(url); }}
                  disabled={!live}
                  style={({ hovered, pressed }: any) => [
                    styles.finalDownloadButton,
                    !isWide && styles.finalDownloadButtonCompact,
                    live && styles.finalDownloadButtonLive,
                    hovered && live && styles.finalDownloadButtonHover,
                    pressed && live && styles.finalDownloadButtonPressed,
                  ]}
                >
                  <Text style={styles.finalPlatform}>{platform}</Text>
                  <Text style={styles.finalStore}>{store}</Text>
                  <Text style={[styles.finalStatus, live && styles.finalStatusLive]}>
                    {live ? `${status} →` : status}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>

        <WebFooter />
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
    backgroundColor: COLORS.bgDeep,
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
    paddingTop: 24,
    paddingBottom: 28,
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
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(120deg, #fff8f2 0%, #ffd9b8 38%, #12c8b2 72%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
          textShadow: '0 0 46px rgba(18,200,178,0.18)' as any,
        }
      : {}),
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
  downloadButtonLive: {
    borderColor: 'rgba(18,200,178,0.48)',
    backgroundColor: 'rgba(18,200,178,0.08)',
    cursor: 'pointer' as any,
    transitionProperty: 'transform, box-shadow, border-color, background-color' as any,
    transitionDuration: '220ms' as any,
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' as any,
  },
  downloadButtonHover: {
    transform: [{ translateY: -2 }],
    borderColor: 'rgba(18,200,178,0.85)',
    backgroundColor: 'rgba(18,200,178,0.14)',
    boxShadow: '0 18px 38px -18px rgba(18,200,178,0.55)' as any,
  },
  downloadButtonPressed: {
    transform: [{ translateY: 0 }],
    opacity: 0.92,
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
  downloadStatusLive: {
    color: COLORS.tide,
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
    ...(Platform.OS === 'web'
      ? { textShadow: '0 0 28px rgba(255,208,138,0.35)' as any }
      : {}),
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
  sectionKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  featuresSection: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingVertical: 72,
  },
  featuresTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -1.8,
    maxWidth: 720,
    marginBottom: 34,
  },
  featuresTitleCompact: {
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1.1,
  },
  featureGrid: {
    gap: 16,
  },
  featureGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    flexGrow: 1,
    flexBasis: 220,
    minHeight: 192,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.16)',
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 22,
    gap: 10,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.10) 0%, rgba(23,24,45,0.58) 45%, rgba(18,16,38,0.74) 100%)' as any,
          boxShadow: '0 22px 48px -28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,248,242,0.06)' as any,
        }
      : SHADOWS.deep),
  },
  featureCardCompact: {
    flexBasis: 'auto',
  },
  featureTag: {
    color: COLORS.tide,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  featureTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  featureBody: {
    color: 'rgba(255,248,242,0.66)',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 2,
  },
  faqSection: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingTop: 40,
    paddingBottom: 72,
  },
  faqTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1.6,
    marginBottom: 28,
  },
  faqTitleCompact: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  faqList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.16)',
  },
  faqItem: {
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.14)',
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 19,
    lineHeight: 26,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  faqAnswer: {
    color: 'rgba(255,248,242,0.72)',
    fontSize: 15,
    lineHeight: 25,
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
  finalDownloadButtonLive: {
    borderColor: 'rgba(18,200,178,0.52)',
    backgroundColor: 'rgba(18,200,178,0.10)',
    cursor: 'pointer' as any,
    transitionProperty: 'transform, box-shadow, border-color, background-color' as any,
    transitionDuration: '220ms' as any,
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' as any,
  },
  finalDownloadButtonHover: {
    transform: [{ translateY: -3 }],
    borderColor: 'rgba(18,200,178,0.88)',
    backgroundColor: 'rgba(18,200,178,0.16)',
    boxShadow: '0 22px 44px -20px rgba(18,200,178,0.60)' as any,
  },
  finalDownloadButtonPressed: {
    transform: [{ translateY: -1 }],
    opacity: 0.94,
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
  finalStatusLive: {
    color: COLORS.tide,
  },
});
