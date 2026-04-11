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
  ['Western', 'Daily transits and emotional weather'],
  ['Vedic', 'Rashi, nakshatra, and timing signals'],
  ['Chinese', 'Element rhythm and long-cycle temperament'],
  ['KP', 'Sub-lord precision for practical direction'],
] as const;

const APP_STORY = [
  ['Today', 'One clear read for the day ahead.'],
  ['Self', 'Birth-chart patterns translated into plain language.'],
  ['Match', 'Compatibility and shared cosmic QR profiles.'],
] as const;

const DOWNLOAD_OPTIONS = [
  ['Android', 'Google Play', 'Store link pending'],
  ['iPhone', 'App Store', 'Store link pending'],
] as const;

export default function LaunchScreen() {
  const { width } = useWindowDimensions();
  const spin = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;
  const isDesktop = width >= 980;
  const isWide = width >= 720;
  const isCompact = width < 390;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const entrance = Animated.timing(reveal, {
      toValue: 1,
      duration: 760,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const orbit = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 26000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    entrance.start();
    orbit.start();
    breathing.start();

    return () => {
      entrance.stop();
      orbit.stop();
      breathing.stop();
    };
  }, [float, reveal, spin]);

  const motion = useMemo(
    () => ({
      introY: reveal.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }),
      floatY: float.interpolate({ inputRange: [0, 1], outputRange: [12, -14] }),
      phoneY: float.interpolate({ inputRange: [0, 1], outputRange: [8, -10] }),
      ringSpin: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
      ringCounter: spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }),
      phoneTurn: spin.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-16deg', '18deg', '-16deg'] }),
    }),
    [float, reveal, spin]
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
        <title>CosmicSelf - Astrology App for Android and iPhone</title>
        <meta
          name="description"
          content="CosmicSelf is a mobile astrology app for daily readings, life patterns, compatibility, and cosmic QR sharing across Western, Vedic, Chinese, and KP systems."
        />
      </Head>

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0d0907', '#18110d', '#2f1d13']} style={styles.hero}>
          <View style={styles.glowAmber} />
          <View style={styles.glowWine} />

          <View style={styles.nav}>
            <Text style={styles.navBrand}>CosmicSelf</Text>
            <Text style={styles.navDomain}>cosmicself.app</Text>
          </View>

          <Animated.View
            style={[
              styles.heroInner,
              isDesktop && styles.heroInnerDesktop,
              { opacity: reveal, transform: [{ translateY: motion.introY }] },
            ]}
          >
            <View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>
              <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact, isWide && styles.brandTitleWide]}>
                CosmicSelf
              </Text>
              <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact, isWide && styles.heroTitleWide]}>
                A mobile astrology app for daily clarity, self-knowledge, and compatibility.
              </Text>
              <Text style={styles.heroBody}>
                Western, Vedic, Chinese, and KP astrology are blended into short reads that help you understand what is
                active today and how your cosmic pattern behaves over time.
              </Text>

              <View style={styles.downloadRow}>
                {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
                  <View key={platform} style={styles.storeBadge}>
                    <Text style={styles.storePlatform}>{platform}</Text>
                    <Text style={styles.storeName}>{store}</Text>
                    <Text style={styles.storeStatus}>{status}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.visualStage, isDesktop && styles.visualStageDesktop]}>
              <Animated.View style={[styles.deepShadow, { opacity: reveal }]} />

              <Animated.View
                style={[
                  styles.bigOrbit,
                  {
                    transform: [
                      { perspective: 1000 },
                      { translateY: motion.floatY },
                      { rotateX: '64deg' },
                      { rotateZ: motion.ringSpin },
                    ],
                  },
                ]}
              >
                <View style={[styles.orbitPoint, styles.orbitPointGold]} />
                <View style={[styles.orbitPoint, styles.orbitPointGreen]} />
                <View style={[styles.orbitPoint, styles.orbitPointRust]} />
              </Animated.View>

              <Animated.View
                style={[
                  styles.secondaryOrbit,
                  {
                    transform: [
                      { perspective: 1000 },
                      { translateY: motion.floatY },
                      { rotateX: '72deg' },
                      { rotateZ: motion.ringCounter },
                    ],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.phoneRig,
                  {
                    transform: [
                      { perspective: 1000 },
                      { translateY: motion.phoneY },
                      { rotateX: '-9deg' },
                      { rotateY: motion.phoneTurn },
                      { rotateZ: '-2deg' },
                    ],
                  },
                ]}
              >
                <View style={styles.phoneDepthRight} />
                <View style={styles.phoneDepthBottom} />
                <LinearGradient colors={['#201814', '#11100f', '#342019']} style={styles.phoneFace}>
                  <View style={styles.phoneSpeaker} />
                  <Text style={styles.phoneAppName}>CosmicSelf</Text>
                  <Text style={styles.phoneToday}>Today</Text>
                  <View style={styles.phoneArc}>
                    <View style={styles.phoneArcInner} />
                    <Text style={styles.phoneArcText}>72</Text>
                  </View>
                  <View style={styles.phoneLines}>
                    <View style={[styles.phoneLine, styles.phoneLineStrong]} />
                    <View style={[styles.phoneLine, styles.phoneLineMid]} />
                    <View style={styles.phoneLine} />
                  </View>
                  <View style={styles.phonePills}>
                    {SYSTEMS.map(([system], index) => (
                      <Text key={system} style={[styles.phonePill, index === 1 && styles.phonePillWarm, index === 2 && styles.phonePillRose, index === 3 && styles.phonePillMint]}>
                        {system}
                      </Text>
                    ))}
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={[styles.strip, isWide && styles.stripWide]}>
          {APP_STORY.map(([title, body]) => (
            <View key={title} style={styles.stripItem}>
              <Text style={styles.stripTitle}>{title}</Text>
              <Text style={styles.stripBody}>{body}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, isWide && styles.sectionWide]}>
          <Text style={styles.sectionTitle}>What is CosmicSelf?</Text>
          <Text style={styles.sectionCopy}>
            A mobile-first astrology companion. It keeps the reading short, combines four traditions, and gives you a
            daily direction without forcing you to study multiple astrology systems.
          </Text>
        </View>

        <View style={styles.systemSection}>
          <Text style={styles.systemSectionTitle}>The blend behind each reading</Text>
          <View style={styles.systemList}>
            {SYSTEMS.map(([title, body], index) => (
              <View key={title} style={[styles.systemRow, index === SYSTEMS.length - 1 && styles.systemRowLast]}>
                <Text style={styles.systemIndex}>0{index + 1}</Text>
                <View style={styles.systemText}>
                  <Text style={styles.systemTitle}>{title}</Text>
                  <Text style={styles.systemBody}>{body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <LinearGradient colors={['#110d0b', '#23150f', '#3d2112']} style={styles.downloadSection}>
          <Text style={styles.downloadTitle}>Download CosmicSelf</Text>
          <Text style={styles.downloadBody}>
            The website is only the doorway. The real experience is the Android and iPhone app: daily readings,
            compatibility, sharing, and your personal cosmic profile.
          </Text>
          <View style={styles.finalDownloads}>
            {DOWNLOAD_OPTIONS.map(([platform, store, status]) => (
              <View key={platform} style={styles.finalBadge}>
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
    backgroundColor: '#f5e6cf',
  },
  pageContent: {
    backgroundColor: '#f5e6cf',
  },
  hero: {
    minHeight: 790,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 70,
  },
  glowAmber: {
    position: 'absolute',
    right: -140,
    top: -130,
    width: 420,
    height: 420,
    borderRadius: 999,
    backgroundColor: 'rgba(244,188,99,0.28)',
  },
  glowWine: {
    position: 'absolute',
    left: -180,
    bottom: -170,
    width: 520,
    height: 520,
    borderRadius: 999,
    backgroundColor: 'rgba(162,65,44,0.25)',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,244,223,0.14)',
  },
  navBrand: {
    color: '#fff4df',
    fontFamily: FONTS.heading,
    fontSize: 23,
    letterSpacing: -0.2,
  },
  navDomain: {
    color: 'rgba(255,244,223,0.70)',
    fontSize: 14,
    fontWeight: '800',
  },
  heroInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingTop: 70,
    gap: 42,
  },
  heroInnerDesktop: {
    minHeight: 620,
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
    color: '#fff4df',
    fontFamily: FONTS.display,
    fontSize: 68,
    lineHeight: 72,
    letterSpacing: -2,
  },
  brandTitleCompact: {
    fontSize: 54,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  brandTitleWide: {
    fontSize: 118,
    lineHeight: 116,
    letterSpacing: -4,
  },
  heroTitle: {
    color: '#f4bc63',
    fontFamily: FONTS.heading,
    fontSize: 30,
    lineHeight: 37,
    letterSpacing: -0.8,
    marginTop: 18,
    maxWidth: 710,
  },
  heroTitleCompact: {
    fontSize: 26,
    lineHeight: 33,
  },
  heroTitleWide: {
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.2,
  },
  heroBody: {
    color: 'rgba(255,244,223,0.78)',
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
  storeBadge: {
    minWidth: 206,
    minHeight: 88,
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,244,223,0.20)',
    backgroundColor: 'rgba(255,244,223,0.07)',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  storePlatform: {
    color: '#f4bc63',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  storeName: {
    color: '#fff4df',
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 29,
    marginTop: 2,
  },
  storeStatus: {
    color: 'rgba(255,244,223,0.62)',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  visualStage: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 470,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualStageDesktop: {
    flex: 0.88,
    maxWidth: 560,
  },
  deepShadow: {
    position: 'absolute',
    bottom: '10%',
    width: '70%',
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.42)',
    transform: [{ scaleX: 1.2 }],
  },
  bigOrbit: {
    position: 'absolute',
    width: '96%',
    height: '96%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244,188,99,0.46)',
  },
  secondaryOrbit: {
    position: 'absolute',
    width: '72%',
    height: '72%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(116,214,184,0.34)',
  },
  orbitPoint: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 999,
  },
  orbitPointGold: {
    top: -8,
    left: '50%',
    backgroundColor: '#f4bc63',
  },
  orbitPointGreen: {
    right: 22,
    bottom: 48,
    backgroundColor: '#74d6b8',
  },
  orbitPointRust: {
    left: 20,
    top: '38%',
    backgroundColor: '#f0784b',
  },
  phoneRig: {
    width: '50%',
    minWidth: 210,
    aspectRatio: 0.56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFace: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,244,223,0.28)',
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 20,
  },
  phoneDepthRight: {
    position: 'absolute',
    right: -16,
    top: 24,
    width: 17,
    height: '88%',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#070606',
  },
  phoneDepthBottom: {
    position: 'absolute',
    bottom: -16,
    left: 20,
    width: '88%',
    height: 17,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#070606',
  },
  phoneSpeaker: {
    alignSelf: 'center',
    width: '34%',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,244,223,0.30)',
  },
  phoneAppName: {
    color: '#fff4df',
    fontFamily: FONTS.heading,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 22,
  },
  phoneToday: {
    color: '#f4bc63',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  phoneArc: {
    alignSelf: 'center',
    width: 132,
    height: 132,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244,188,99,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  phoneArcInner: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(116,214,184,0.36)',
  },
  phoneArcText: {
    color: '#fff4df',
    fontFamily: FONTS.display,
    fontSize: 42,
    lineHeight: 48,
  },
  phoneLines: {
    gap: 8,
    marginTop: 24,
  },
  phoneLine: {
    width: '52%',
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,244,223,0.22)',
  },
  phoneLineStrong: {
    width: '96%',
    backgroundColor: '#f4bc63',
  },
  phoneLineMid: {
    width: '74%',
    backgroundColor: '#74d6b8',
  },
  phonePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 24,
  },
  phonePill: {
    color: '#c8c0ff',
    fontSize: 10,
    fontWeight: '900',
  },
  phonePillWarm: {
    color: '#f4bc63',
  },
  phonePillRose: {
    color: '#f0784b',
  },
  phonePillMint: {
    color: '#74d6b8',
  },
  strip: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 18,
  },
  stripWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stripItem: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(32,24,20,0.22)',
    paddingTop: 18,
  },
  stripTitle: {
    color: '#18110d',
    fontFamily: FONTS.heading,
    fontSize: 28,
    lineHeight: 34,
  },
  stripBody: {
    color: '#5f4938',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 5,
    maxWidth: 310,
  },
  section: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 78,
    gap: 24,
  },
  sectionWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flex: 0.9,
    color: '#18110d',
    fontFamily: FONTS.display,
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: -1.8,
    maxWidth: 520,
  },
  sectionCopy: {
    flex: 1,
    color: '#5f4938',
    fontSize: 20,
    lineHeight: 32,
    maxWidth: 620,
  },
  systemSection: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 88,
  },
  systemSectionTitle: {
    color: '#18110d',
    fontFamily: FONTS.heading,
    fontSize: 34,
    lineHeight: 40,
    marginBottom: 22,
  },
  systemList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(32,24,20,0.22)',
  },
  systemRow: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32,24,20,0.18)',
  },
  systemRowLast: {
    borderBottomWidth: 0,
  },
  systemIndex: {
    width: 46,
    color: '#9b642e',
    fontSize: 14,
    fontWeight: '900',
  },
  systemText: {
    flex: 1,
  },
  systemTitle: {
    color: '#18110d',
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
  },
  systemBody: {
    color: '#5f4938',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 4,
    maxWidth: 620,
  },
  downloadSection: {
    paddingHorizontal: 20,
    paddingVertical: 88,
    alignItems: 'center',
  },
  downloadTitle: {
    color: '#fff4df',
    fontFamily: FONTS.display,
    fontSize: 58,
    lineHeight: 62,
    textAlign: 'center',
    letterSpacing: -1.8,
  },
  downloadBody: {
    color: 'rgba(255,244,223,0.74)',
    fontSize: 18,
    lineHeight: 29,
    textAlign: 'center',
    maxWidth: 680,
    marginTop: 18,
  },
  finalDownloads: {
    width: '100%',
    maxWidth: 720,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 36,
  },
  finalBadge: {
    minWidth: 240,
    minHeight: 102,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,244,223,0.22)',
    backgroundColor: 'rgba(255,244,223,0.08)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  finalPlatform: {
    color: '#f4bc63',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  finalStore: {
    color: '#fff4df',
    fontFamily: FONTS.heading,
    fontSize: 26,
    lineHeight: 32,
    marginTop: 2,
  },
  finalStatus: {
    color: 'rgba(255,244,223,0.62)',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
});
