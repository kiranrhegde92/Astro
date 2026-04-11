import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { COLORS, FONTS, SHADOWS } from '../src/constants/theme';

const SYSTEMS = [
  ['Western', 'Personality, transits, emotional weather'],
  ['Vedic', 'Rashi, nakshatra, dasha timing'],
  ['Chinese', 'Elemental rhythm and long-cycle pattern'],
  ['KP', 'Sub-lord detail and practical timing'],
] as const;

const RITUAL = [
  ['Birth details', 'Create the chart foundation once with place, date, and time.'],
  ['Daily blend', 'See the strongest signals across four traditions without reading four reports.'],
  ['Share and match', 'Save people, compare compatibility, and exchange a compact cosmic QR.'],
] as const;

export default function LaunchScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const orbit = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const isDesktop = width >= 900;
  const isWide = width >= 720;
  const isCompact = width < 390;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(orbit, {
          toValue: 1,
          duration: 32000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [fade, orbit]);

  const orbitSpin = useMemo(
    () =>
      orbit.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [orbit]
  );

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={COLORS.western} />
      </View>
    );
  }

  const goToSignup = () => router.push('/(auth)/signup');
  const goToLogin = () => router.push('/(auth)/login');

  return (
    <>
    <Head>
      <title>CosmicSelf - Daily Astrology, Four Systems in One Read</title>
      <meta
        name="description"
        content="CosmicSelf blends Western, Vedic, Chinese and KP astrology into a clear daily brief, compatibility flow and shareable cosmic QR."
      />
    </Head>
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#fff8f2', '#f3e8ef', '#f7c992']} style={styles.hero}>
        <View style={styles.paperGrain} />
        <View style={styles.nav}>
          <Text style={styles.navBrand}>CosmicSelf</Text>
          <View style={styles.navActions}>
            <Pressable onPress={goToLogin} style={styles.navLink}>
              <Text style={styles.navLinkText}>Sign in</Text>
            </Pressable>
            <Pressable onPress={goToSignup} style={styles.navButton}>
              <Text style={styles.navButtonText}>Create profile</Text>
            </Pressable>
          </View>
        </View>

        <Animated.View
          style={[
            styles.heroInner,
            isDesktop && styles.heroInnerDesktop,
            { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] },
          ]}
        >
          <View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>
            <Text style={styles.domain}>cosmicself.app</Text>
            <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact, isWide && styles.brandTitleWide]}>CosmicSelf</Text>
            <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact, isWide && styles.heroTitleWide]}>
              A daily astrology ritual that turns four systems into one clear read.
            </Text>
            <Text style={styles.heroBody}>
              Western, Vedic, Chinese and KP are blended into a practical daily brief, life roadmap, match reading and shareable cosmic QR.
            </Text>
            <View style={styles.ctaRow}>
              <Pressable onPress={goToSignup} style={styles.primaryCta}>
                <Text style={styles.primaryCtaText}>Start your chart</Text>
              </Pressable>
              <Pressable onPress={goToLogin} style={styles.secondaryCta}>
                <Text style={styles.secondaryCtaText}>Open the app</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.dialStage, isDesktop && styles.dialStageDesktop]}>
            <Animated.View style={[styles.dialOrbit, { transform: [{ rotate: orbitSpin }] }]}>
              <View style={[styles.orbitPoint, styles.orbitPointOne]} />
              <View style={[styles.orbitPoint, styles.orbitPointTwo]} />
              <View style={[styles.orbitPoint, styles.orbitPointThree]} />
              <View style={[styles.orbitPoint, styles.orbitPointFour]} />
            </Animated.View>
            <View style={styles.dial}>
              <View style={styles.dialRingOuter} />
              <View style={styles.dialRingMiddle} />
              <View style={styles.dialRingInner} />
              <View style={styles.dialCore}>
                <Text style={styles.dialCoreText}>CS</Text>
                <Text style={styles.dialCoreSub}>daily blend</Text>
              </View>
              <Text style={[styles.dialLabel, styles.dialLabelTop]}>Rashi</Text>
              <Text style={[styles.dialLabel, styles.dialLabelRight]}>Transit</Text>
              <Text style={[styles.dialLabel, styles.dialLabelBottom]}>Dasha</Text>
              <Text style={[styles.dialLabel, styles.dialLabelLeft]}>Match</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.sectionIntro}>
          <Text style={styles.sectionTitle}>One app, four lenses, fewer vague readings.</Text>
          <Text style={styles.sectionCopy}>
            CosmicSelf keeps the result readable: what matters today, what is driving it, and where to focus.
          </Text>
        </View>
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

      <LinearGradient colors={['#17182d', '#24284a', '#46306b']} style={styles.inkSection}>
        <Text style={styles.inkTitle}>Built for the moment after you ask, "What should I do with today?"</Text>
        <View style={styles.ritualGrid}>
          {RITUAL.map(([title, body]) => (
            <View key={title} style={styles.ritualItem}>
              <Text style={styles.ritualTitle}>{title}</Text>
              <Text style={styles.ritualBody}>{body}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={[styles.finalSection, isWide && styles.finalSectionWide]}>
        <View style={styles.finalCopy}>
          <Text style={styles.finalTitle}>Your domain is ready for the app story.</Text>
          <Text style={styles.finalBody}>
            Use cosmicself.app as the clean public doorway: explain the ritual, invite new profiles, and let existing users return to their chart.
          </Text>
        </View>
        <View style={styles.ctaRow}>
          <Pressable onPress={goToSignup} style={styles.primaryCta}>
            <Text style={styles.primaryCtaText}>Create profile</Text>
          </Pressable>
          <Pressable onPress={goToLogin} style={styles.secondaryCta}>
            <Text style={styles.secondaryCtaText}>Sign in</Text>
          </Pressable>
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
    paddingBottom: 72,
  },
  paperGrain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    backgroundColor: 'rgba(255,255,255,0.20)',
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
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  navLinkText: {
    color: '#46507b',
    fontSize: 14,
    fontWeight: '700',
  },
  navButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#17182d',
    paddingHorizontal: 16,
  },
  navButtonText: {
    color: '#fff8f2',
    fontSize: 14,
    fontWeight: '800',
  },
  heroInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingTop: 64,
    gap: 42,
  },
  heroInnerDesktop: {
    minHeight: 610,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCopy: {
    maxWidth: 640,
  },
  heroCopyDesktop: {
    flex: 1,
  },
  domain: {
    color: '#7367ff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  brandTitle: {
    color: '#17182d',
    fontFamily: FONTS.display,
    fontSize: 72,
    lineHeight: 78,
    letterSpacing: -2.2,
  },
  brandTitleCompact: {
    fontSize: 58,
    lineHeight: 64,
    letterSpacing: -1.7,
  },
  brandTitleWide: {
    fontSize: 112,
    lineHeight: 114,
    letterSpacing: -4,
  },
  heroTitle: {
    color: '#24284a',
    fontFamily: FONTS.heading,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
    marginTop: 18,
    maxWidth: 700,
  },
  heroTitleCompact: {
    fontSize: 29,
    lineHeight: 35,
  },
  heroTitleWide: {
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1.3,
  },
  heroBody: {
    color: '#46507b',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 22,
    maxWidth: 610,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 30,
  },
  primaryCta: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#17182d',
    paddingHorizontal: 22,
    ...SHADOWS.glass,
  },
  primaryCtaText: {
    color: '#fff8f2',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryCta: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(23,24,45,0.20)',
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,248,242,0.52)',
  },
  secondaryCtaText: {
    color: '#17182d',
    fontSize: 15,
    fontWeight: '900',
  },
  dialStage: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialStageDesktop: {
    flex: 0.78,
  },
  dialOrbit: {
    position: 'absolute',
    width: '96%',
    height: '96%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(23,24,45,0.20)',
  },
  orbitPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#ff8a5b',
  },
  orbitPointOne: {
    top: -6,
    left: '50%',
  },
  orbitPointTwo: {
    right: 20,
    top: '28%',
    backgroundColor: '#12c8b2',
  },
  orbitPointThree: {
    bottom: 24,
    left: '22%',
    backgroundColor: '#7367ff',
  },
  orbitPointFour: {
    left: 6,
    top: '48%',
    backgroundColor: '#ff5e7e',
  },
  dial: {
    width: '82%',
    height: '82%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,248,242,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(23,24,45,0.16)',
  },
  dialRingOuter: {
    position: 'absolute',
    width: '92%',
    height: '92%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(115,103,255,0.24)',
  },
  dialRingMiddle: {
    position: 'absolute',
    width: '68%',
    height: '68%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,138,91,0.32)',
  },
  dialRingInner: {
    position: 'absolute',
    width: '42%',
    height: '42%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(18,200,178,0.30)',
  },
  dialCore: {
    width: 122,
    height: 122,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17182d',
  },
  dialCoreText: {
    color: '#fff8f2',
    fontFamily: FONTS.heading,
    fontSize: 34,
    letterSpacing: -0.5,
  },
  dialCoreSub: {
    color: '#f8c892',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  dialLabel: {
    position: 'absolute',
    color: '#17182d',
    fontSize: 12,
    fontWeight: '900',
  },
  dialLabelTop: {
    top: '13%',
  },
  dialLabelRight: {
    right: '8%',
  },
  dialLabelBottom: {
    bottom: '13%',
  },
  dialLabelLeft: {
    left: '8%',
  },
  section: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 88,
    gap: 34,
  },
  sectionIntro: {
    maxWidth: 720,
  },
  sectionTitle: {
    color: '#17182d',
    fontFamily: FONTS.heading,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1,
  },
  sectionCopy: {
    color: '#46507b',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 14,
    maxWidth: 620,
  },
  systemList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(23,24,45,0.16)',
  },
  systemRow: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23,24,45,0.16)',
  },
  systemRowLast: {
    borderBottomWidth: 0,
  },
  systemIndex: {
    color: '#7367ff',
    fontSize: 14,
    fontWeight: '900',
    width: 42,
  },
  systemText: {
    flex: 1,
  },
  systemTitle: {
    color: '#17182d',
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
  },
  systemBody: {
    color: '#46507b',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
  },
  inkSection: {
    paddingHorizontal: 20,
    paddingVertical: 88,
  },
  inkTitle: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    color: '#fff8f2',
    fontFamily: FONTS.heading,
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -1,
  },
  ritualGrid: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    marginTop: 38,
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.20)',
  },
  ritualItem: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.20)',
  },
  ritualTitle: {
    color: '#f8c892',
    fontFamily: FONTS.heading,
    fontSize: 23,
  },
  ritualBody: {
    color: 'rgba(255,248,242,0.76)',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 8,
    maxWidth: 620,
  },
  finalSection: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 88,
  },
  finalSectionWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 44,
  },
  finalCopy: {
    flex: 1,
  },
  finalTitle: {
    color: '#17182d',
    fontFamily: FONTS.display,
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1.4,
    maxWidth: 620,
  },
  finalBody: {
    color: '#46507b',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 16,
    maxWidth: 560,
  },
});
