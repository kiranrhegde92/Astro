import React, { useEffect, useMemo, useRef } from 'react';
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
import { COLORS, FONTS } from '../src/constants/theme';

const SYSTEMS = [
  ['Western', 'Personality, transits, and emotional weather.'],
  ['Vedic', 'Rashi, nakshatra, and timing patterns.'],
  ['Chinese', 'Element cycles and long-form temperament.'],
  ['KP', 'Precise sub-lord signals for practical timing.'],
] as const;

const PRODUCT_POINTS = [
  ['Daily direction', 'A short read for the day, not a long generic horoscope.'],
  ['Four-system blend', 'Western, Vedic, Chinese, and KP are interpreted together.'],
  ['Match and share', 'Compare compatibility and share your cosmic identity with QR.'],
] as const;

const DOWNLOAD_OPTIONS = [
  ['Android', 'Google Play', 'Store link coming soon'],
  ['iPhone', 'App Store', 'Store link coming soon'],
] as const;

export default function LaunchScreen() {
  const { width } = useWindowDimensions();
  const spin = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const isDesktop = width >= 960;
  const isWide = width >= 720;
  const isCompact = width < 390;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const fadeIn = Animated.timing(fade, {
      toValue: 1,
      duration: 760,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    fadeIn.start();
    spinLoop.start();
    floatLoop.start();

    return () => {
      fadeIn.stop();
      spinLoop.stop();
      floatLoop.stop();
    };
  }, [fade, float, spin]);

  const motion = useMemo(
    () => ({
      heroLift: fade.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
      floatY: float.interpolate({ inputRange: [0, 1], outputRange: [10, -16] }),
      spinZ: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
      spinReverse: spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }),
      tiltY: spin.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-22deg', '22deg', '-22deg'] }),
      tiltX: float.interpolate({ inputRange: [0, 1], outputRange: ['58deg', '46deg'] }),
    }),
    [fade, float, spin]
  );

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={COLORS.western} />
      </View>
    );
  }

  return (
    <>
      <Head>
        <title>CosmicSelf - Astrology App for Daily Self-Reading</title>
        <meta
          name="description"
          content="CosmicSelf is an astrology app that blends Western, Vedic, Chinese and KP systems into daily guidance, compatibility and shareable cosmic identity."
        />
      </Head>

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#fff8f2', '#f1e7dc', '#d6b070']} style={styles.hero}>
          <View style={styles.textureLayer} />
          <View style={styles.nav}>
            <Text style={styles.navBrand}>CosmicSelf</Text>
            <Text style={styles.navMeta}>cosmicself.app</Text>
          </View>

          <Animated.View
            style={[
              styles.heroInner,
              isDesktop && styles.heroInnerDesktop,
              { opacity: fade, transform: [{ translateY: motion.heroLift }] },
            ]}
          >
            <View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>
              <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact, isWide && styles.brandTitleWide]}>
                CosmicSelf
              </Text>
              <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact, isWide && styles.heroTitleWide]}>
                Astrology that helps you understand today, your nature, and your connections.
              </Text>
              <Text style={styles.heroBody}>
                CosmicSelf blends four astrology traditions into one readable app experience: daily direction, life pattern,
                compatibility, and a shareable cosmic QR profile.
              </Text>

              <View style={styles.downloadRow}>
                {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
                  <View key={platform} style={styles.storeButton}>
                    <Text style={styles.storeDevice}>{platform}</Text>
                    <Text style={styles.storeName}>{store}</Text>
                    <Text style={styles.storeStatus}>{status}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.artifactStage, isDesktop && styles.artifactStageDesktop]}>
              <Animated.View style={[styles.artifactShadow, { opacity: fade }]} />
              <Animated.View
                style={[
                  styles.outerOrbit,
                  {
                    transform: [
                      { perspective: 900 },
                      { translateY: motion.floatY },
                      { rotateX: motion.tiltX },
                      { rotateZ: motion.spinZ },
                    ],
                  },
                ]}
              >
                <View style={[styles.orbitNode, styles.orbitNodeDawn]} />
                <View style={[styles.orbitNode, styles.orbitNodeTide]} />
                <View style={[styles.orbitNode, styles.orbitNodeInk]} />
              </Animated.View>

              <Animated.View
                style={[
                  styles.innerOrbit,
                  {
                    transform: [
                      { perspective: 900 },
                      { translateY: motion.floatY },
                      { rotateX: '66deg' },
                      { rotateZ: motion.spinReverse },
                    ],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.artifactBody,
                  {
                    transform: [
                      { perspective: 900 },
                      { translateY: motion.floatY },
                      { rotateX: '-10deg' },
                      { rotateY: motion.tiltY },
                    ],
                  },
                ]}
              >
                <LinearGradient colors={['#17182d', '#2a2e5a', '#4b2d58']} style={styles.artifactFace}>
                  <View style={styles.artifactTopLine} />
                  <Text style={styles.artifactMark}>CS</Text>
                  <View style={styles.artifactSignal}>
                    <View style={[styles.signalLine, styles.signalLineLong]} />
                    <View style={[styles.signalLine, styles.signalLineMid]} />
                    <View style={styles.signalLine} />
                  </View>
                  <View style={styles.systemDots}>
                    {SYSTEMS.map(([title], index) => (
                      <View key={title} style={[styles.systemDot, index === 1 && styles.systemDotWarm, index === 2 && styles.systemDotRose, index === 3 && styles.systemDotMint]} />
                    ))}
                  </View>
                </LinearGradient>
                <View style={styles.artifactEdgeRight} />
                <View style={styles.artifactEdgeBottom} />
              </Animated.View>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={[styles.section, isWide && styles.sectionWide]}>
          <View style={styles.sectionIntro}>
            <Text style={styles.sectionTitle}>What is CosmicSelf?</Text>
            <Text style={styles.sectionCopy}>
              It is a mobile astrology companion for people who want concise guidance instead of scattered readings across
              different systems.
            </Text>
          </View>
          <View style={styles.productList}>
            {PRODUCT_POINTS.map(([title, body], index) => (
              <View key={title} style={[styles.productRow, index === PRODUCT_POINTS.length - 1 && styles.productRowLast]}>
                <Text style={styles.productIndex}>0{index + 1}</Text>
                <View style={styles.productText}>
                  <Text style={styles.productTitle}>{title}</Text>
                  <Text style={styles.productBody}>{body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <LinearGradient colors={['#17182d', '#26294b', '#3b2a42']} style={styles.inkSection}>
          <View style={styles.inkInner}>
            <Text style={styles.inkTitle}>Four systems, one calmer answer.</Text>
            <View style={styles.systemList}>
              {SYSTEMS.map(([title, body]) => (
                <View key={title} style={styles.systemItem}>
                  <Text style={styles.systemTitle}>{title}</Text>
                  <Text style={styles.systemBody}>{body}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.finalSection, isWide && styles.finalSectionWide]}>
          <View style={styles.finalCopy}>
            <Text style={styles.finalTitle}>Download options</Text>
            <Text style={styles.finalBody}>
              CosmicSelf is built for Android and iPhone. The public page stays clean: no web registration, no web login,
              only the product story and mobile download entry points.
            </Text>
          </View>
          <View style={styles.finalDownloads}>
            {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
              <View key={platform} style={styles.finalStoreButton}>
                <Text style={styles.finalStorePlatform}>{platform}</Text>
                <Text style={styles.finalStoreName}>{store}</Text>
                <Text style={styles.finalStoreStatus}>{status}</Text>
              </View>
            ))}
          </View>
        </View>
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
    backgroundColor: '#fff8f2',
  },
  pageContent: {
    backgroundColor: '#fff8f2',
  },
  hero: {
    minHeight: 760,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 76,
  },
  textureLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
    opacity: 0.52,
  },
  nav: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  navBrand: {
    color: '#17182d',
    fontFamily: FONTS.heading,
    fontSize: 22,
    letterSpacing: -0.2,
  },
  navMeta: {
    color: '#6f5e48',
    fontSize: 14,
    fontWeight: '800',
  },
  heroInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingTop: 60,
    gap: 48,
  },
  heroInnerDesktop: {
    minHeight: 610,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCopy: {
    maxWidth: 660,
  },
  heroCopyDesktop: {
    flex: 1,
  },
  brandTitle: {
    color: '#17182d',
    fontFamily: FONTS.display,
    fontSize: 70,
    lineHeight: 76,
    letterSpacing: -2,
  },
  brandTitleCompact: {
    fontSize: 56,
    lineHeight: 62,
    letterSpacing: -1.6,
  },
  brandTitleWide: {
    fontSize: 118,
    lineHeight: 118,
    letterSpacing: -4.2,
  },
  heroTitle: {
    color: '#24284a',
    fontFamily: FONTS.heading,
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginTop: 18,
    maxWidth: 720,
  },
  heroTitleCompact: {
    fontSize: 27,
    lineHeight: 34,
  },
  heroTitleWide: {
    fontSize: 46,
    lineHeight: 52,
    letterSpacing: -1.3,
  },
  heroBody: {
    color: '#46507b',
    fontSize: 17,
    lineHeight: 28,
    marginTop: 22,
    maxWidth: 610,
  },
  downloadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 34,
  },
  storeButton: {
    minWidth: 190,
    minHeight: 86,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(23,24,45,0.22)',
    backgroundColor: 'rgba(255,248,242,0.62)',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  storeDevice: {
    color: '#6f5e48',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  storeName: {
    color: '#17182d',
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 27,
    marginTop: 2,
  },
  storeStatus: {
    color: '#46507b',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  artifactStage: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artifactStageDesktop: {
    flex: 0.82,
    maxWidth: 500,
  },
  artifactShadow: {
    position: 'absolute',
    bottom: '12%',
    width: '62%',
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(23,24,45,0.20)',
    transform: [{ scaleX: 1.15 }],
  },
  outerOrbit: {
    position: 'absolute',
    width: '94%',
    height: '94%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(23,24,45,0.30)',
  },
  innerOrbit: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,138,91,0.34)',
  },
  orbitNode: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#17182d',
  },
  orbitNodeDawn: {
    top: -8,
    left: '50%',
    backgroundColor: '#ff8a5b',
  },
  orbitNodeTide: {
    right: 28,
    bottom: 32,
    backgroundColor: '#12c8b2',
  },
  orbitNodeInk: {
    left: 20,
    top: '40%',
    backgroundColor: '#17182d',
  },
  artifactBody: {
    width: '54%',
    aspectRatio: 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artifactFace: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artifactTopLine: {
    position: 'absolute',
    top: 24,
    width: '58%',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,248,242,0.28)',
  },
  artifactMark: {
    color: '#fff8f2',
    fontFamily: FONTS.heading,
    fontSize: 50,
    letterSpacing: -1,
  },
  artifactSignal: {
    width: '58%',
    gap: 9,
    marginTop: 18,
  },
  signalLine: {
    width: '46%',
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,248,242,0.36)',
  },
  signalLineLong: {
    width: '100%',
    backgroundColor: '#f1b74f',
  },
  signalLineMid: {
    width: '72%',
    backgroundColor: '#12c8b2',
  },
  systemDots: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    gap: 8,
  },
  systemDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#7367ff',
  },
  systemDotWarm: {
    backgroundColor: '#ff8a5b',
  },
  systemDotRose: {
    backgroundColor: '#ff5e7e',
  },
  systemDotMint: {
    backgroundColor: '#12c8b2',
  },
  artifactEdgeRight: {
    position: 'absolute',
    right: -13,
    top: 18,
    width: 14,
    height: '88%',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#111327',
  },
  artifactEdgeBottom: {
    position: 'absolute',
    bottom: -13,
    left: 18,
    width: '88%',
    height: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#111327',
  },
  section: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 88,
    gap: 34,
  },
  sectionWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 64,
  },
  sectionIntro: {
    flex: 0.92,
    maxWidth: 620,
  },
  sectionTitle: {
    color: '#17182d',
    fontFamily: FONTS.heading,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1,
  },
  sectionCopy: {
    color: '#46507b',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 14,
    maxWidth: 570,
  },
  productList: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(23,24,45,0.16)',
  },
  productRow: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23,24,45,0.16)',
  },
  productRowLast: {
    borderBottomWidth: 0,
  },
  productIndex: {
    color: '#6f5e48',
    fontSize: 14,
    fontWeight: '900',
    width: 42,
  },
  productText: {
    flex: 1,
  },
  productTitle: {
    color: '#17182d',
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
  },
  productBody: {
    color: '#46507b',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
  },
  inkSection: {
    paddingHorizontal: 20,
    paddingVertical: 88,
  },
  inkInner: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
  },
  inkTitle: {
    color: '#fff8f2',
    fontFamily: FONTS.heading,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1,
  },
  systemList: {
    marginTop: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.20)',
  },
  systemItem: {
    paddingVertical: 23,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.20)',
  },
  systemTitle: {
    color: '#f8c892',
    fontFamily: FONTS.heading,
    fontSize: 24,
  },
  systemBody: {
    color: 'rgba(255,248,242,0.76)',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 7,
    maxWidth: 620,
  },
  finalSection: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 88,
    gap: 34,
  },
  finalSectionWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 56,
  },
  finalCopy: {
    flex: 1,
    maxWidth: 620,
  },
  finalTitle: {
    color: '#17182d',
    fontFamily: FONTS.display,
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -1.6,
  },
  finalBody: {
    color: '#46507b',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 16,
    maxWidth: 560,
  },
  finalDownloads: {
    flex: 1,
    gap: 14,
    maxWidth: 420,
  },
  finalStoreButton: {
    minHeight: 98,
    justifyContent: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#17182d',
    backgroundColor: 'rgba(255,255,255,0.40)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  finalStorePlatform: {
    color: '#6f5e48',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  finalStoreName: {
    color: '#17182d',
    fontFamily: FONTS.heading,
    fontSize: 25,
    lineHeight: 31,
    marginTop: 2,
  },
  finalStoreStatus: {
    color: '#46507b',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
});
