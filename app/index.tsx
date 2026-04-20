import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WebShell } from '../src/components/web/WebShell';
import { SEOHead } from '../src/components/web/SEOHead';
import { COLORS, FONTS, SPACING } from '../src/constants/theme';
import { pickStoreUrl } from '../src/constants/storeLinks';
import { useInstallDetect } from '../src/utils/useInstallDetect';

// ─── Section: Hero ────────────────────────────────────────────────────────────

function Hero() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const reveal = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { platform } = useInstallDetect();

  useEffect(() => {
    const anim = Animated.timing(reveal, {
      toValue: 1,
      duration: 820,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reveal]);

  const lift = reveal.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });

  function handleGetApp() {
    Linking.openURL(pickStoreUrl(platform));
  }

  function handlePricing() {
    router.push('/pricing' as any);
  }

  return (
    <Animated.View
      style={[
        heroStyles.root,
        isWide && heroStyles.rootWide,
        { opacity: reveal, transform: [{ translateY: lift }] },
      ]}
    >
      {/* Radial glow backdrop */}
      <View style={heroStyles.glowBackdrop} pointerEvents="none" />

      <View style={[heroStyles.copy, isWide && heroStyles.copyWide]}>
        <Text style={heroStyles.eyebrow}>Your cosmic mirror</Text>
        <Text
          style={[heroStyles.headline, isWide && heroStyles.headlineWide]}
          // @ts-ignore — web-only fontSize clamp
          accessibilityRole="heading"
        >
          Your cosmic mirror.
        </Text>
        <Text style={heroStyles.subhead}>
          Daily readings, charts, and the wisdom of the stars — written for you.
        </Text>

        <View style={[heroStyles.ctaRow, !isWide && heroStyles.ctaRowCompact]}>
          <TouchableOpacity style={heroStyles.ctaPrimary} onPress={handleGetApp} accessibilityRole="button">
            <Text style={heroStyles.ctaPrimaryLabel}>Get the app</Text>
          </TouchableOpacity>
          <TouchableOpacity style={heroStyles.ctaSecondary} onPress={handlePricing} accessibilityRole="button">
            <Text style={heroStyles.ctaSecondaryLabel}>See pricing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const heroStyles = StyleSheet.create({
  root: {
    width: '100%',
    minHeight: 680,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  rootWide: {
    minHeight: 760,
    paddingTop: 100,
    paddingBottom: 100,
  },
  glowBackdrop: {
    position: 'absolute',
    top: -120,
    left: '50%' as any,
    width: 800,
    height: 800,
    borderRadius: 400,
    // tide at very low opacity for the radial hint
    backgroundColor: 'rgba(18,200,178,0.07)',
    transform: [{ translateX: -400 }],
  },
  copy: {
    width: '100%',
    maxWidth: 680,
    alignItems: 'center',
  },
  copyWide: {
    maxWidth: 760,
  },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },
  headline: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
    textAlign: 'center',
    // @ts-ignore web
    ...(Platform.OS === 'web' ? { fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' as any } : {}),
  },
  headlineWide: {
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2.8,
  },
  subhead: {
    color: 'rgba(255,248,242,0.78)',
    fontFamily: FONTS.body,
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
    maxWidth: 560,
    marginTop: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaRowCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 320,
  },
  ctaPrimary: {
    backgroundColor: COLORS.tide,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  ctaPrimaryLabel: {
    color: '#06040F',
    fontFamily: FONTS.heading,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  ctaSecondary: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.28)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    backgroundColor: 'rgba(255,248,242,0.06)',
  },
  ctaSecondaryLabel: {
    color: 'rgba(255,248,242,0.88)',
    fontFamily: FONTS.heading,
    fontSize: 17,
    letterSpacing: -0.2,
  },
});

// ─── Section: HowItWorks ──────────────────────────────────────────────────────

const HOW_STEPS = [
  ['01', 'Share your birth details', 'Enter your name, date, time, and place of birth once. Everything else follows.'],
  ['02', 'Receive your daily reading', 'Each morning, four astrology systems combine into one calm, personal brief.'],
  ['03', 'Ask Akasha anything', 'Your AI oracle draws on your actual chart — not generic horoscope copy.'],
] as const;

function HowItWorks() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  return (
    <View style={howStyles.root}>
      <Text style={howStyles.kicker}>HOW IT WORKS</Text>
      <Text style={[howStyles.title, !isWide && howStyles.titleCompact]}>Three steps to your cosmos.</Text>
      <View style={[howStyles.grid, isWide && howStyles.gridWide]}>
        {HOW_STEPS.map(([num, title, body]) => (
          <View key={num} style={[howStyles.card, isWide && howStyles.cardWide]}>
            <Text style={howStyles.num}>{num}</Text>
            <Text style={howStyles.cardTitle}>{title}</Text>
            <Text style={howStyles.cardBody}>{body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const howStyles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 80,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.10)',
  },
  kicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.6,
    marginBottom: 48,
    maxWidth: 560,
  },
  titleCompact: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 36,
  },
  grid: {
    gap: 16,
  },
  gridWide: {
    flexDirection: 'row',
  },
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.14)',
    backgroundColor: 'rgba(255,248,242,0.04)',
    padding: 28,
    gap: 14,
    minHeight: 200,
    borderTopWidth: 3,
    borderTopColor: COLORS.tide,
  },
  cardWide: {
    flex: 1,
  },
  num: {
    color: COLORS.tide,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.8,
  },
  cardTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  cardBody: {
    color: 'rgba(255,248,242,0.66)',
    fontSize: 15,
    lineHeight: 24,
  },
});

// ─── Section: TodaysSky ───────────────────────────────────────────────────────

function TodaysSky() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  return (
    <View style={skyStyles.root}>
      <View style={[skyStyles.card, isWide && skyStyles.cardWide]}>
        <View style={skyStyles.header}>
          <Text style={skyStyles.kicker}>THE SKY TODAY</Text>
          <View style={skyStyles.liveDot} />
        </View>
        <Text style={[skyStyles.line, isWide && skyStyles.lineWide]}>
          Mercury presses its point to Mars; the conversation quickens.
        </Text>
        <Text style={skyStyles.note}>
          Every morning CosmicSelf reads the live sky and weaves it into your personal brief.
        </Text>
      </View>
    </View>
  );
}

const skyStyles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 56,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.10)',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(18,200,178,0.28)',
    backgroundColor: 'rgba(18,200,178,0.06)',
    padding: 36,
    gap: 18,
  },
  cardWide: {
    padding: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kicker: {
    color: COLORS.tide,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.tide,
  },
  line: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.6,
    maxWidth: 640,
  },
  lineWide: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -1,
  },
  note: {
    color: 'rgba(255,248,242,0.58)',
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 480,
  },
});

// ─── Section: FeaturePillars ──────────────────────────────────────────────────

const PILLARS = [
  ['Daily Readings', 'Four systems, one calm brief.', 'Western transit, Vedic nakshatra, Chinese element, and KP signal — distilled into a reading that actually lands.'],
  ['Natal Chart', 'Your birth pattern decoded.', 'A plain-English profile of your Western, Vedic, Chinese, and KP signatures — who you are, not just your sun sign.'],
  ['Ask Akasha', 'Your AI oracle.', 'Ask a real question, get a grounded answer rooted in your actual chart. Not a horoscope. Not a chatbot. Something in between.'],
  ['Cosmic Self Card', 'Your shareable cosmic identity.', 'A profile card and QR code that lets you share only what you choose — your sky, your sign, your self.'],
] as const;

function FeaturePillars() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  return (
    <View style={pillarsStyles.root}>
      <Text style={pillarsStyles.kicker}>WHAT'S INSIDE</Text>
      <Text style={[pillarsStyles.title, !isWide && pillarsStyles.titleCompact]}>
        Four rituals. One quiet app.
      </Text>
      <View style={[pillarsStyles.grid, isWide && pillarsStyles.gridWide]}>
        {PILLARS.map(([title, tag, body]) => (
          <View key={title} style={[pillarsStyles.card, isWide && pillarsStyles.cardWide]}>
            <Text style={pillarsStyles.tag}>{tag}</Text>
            <Text style={pillarsStyles.cardTitle}>{title}</Text>
            <Text style={pillarsStyles.cardBody}>{body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const pillarsStyles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 80,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.10)',
  },
  kicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.6,
    marginBottom: 48,
    maxWidth: 560,
  },
  titleCompact: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 36,
  },
  grid: {
    gap: 16,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.14)',
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 28,
    gap: 10,
    minHeight: 210,
  },
  cardWide: {
    flex: 1,
    flexBasis: '45%' as any,
    minWidth: 280,
  },
  tag: {
    color: COLORS.tide,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  cardBody: {
    color: 'rgba(255,248,242,0.66)',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 4,
  },
});

// ─── Section: Testimonial ─────────────────────────────────────────────────────

function Testimonial() {
  return (
    <View style={quoteStyles.root}>
      <View style={quoteStyles.inner}>
        <Text style={quoteStyles.mark}>"</Text>
        <Text style={quoteStyles.quote}>
          It's the first astrology app that feels like it was written for me, not at me.
        </Text>
        <Text style={quoteStyles.attr}>— Early reader, 2026</Text>
      </View>
    </View>
  );
}

const quoteStyles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 72,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.10)',
    alignItems: 'center',
  },
  inner: {
    maxWidth: 640,
    alignItems: 'center',
    gap: 16,
  },
  mark: {
    color: COLORS.tide,
    fontFamily: FONTS.display,
    fontSize: 80,
    lineHeight: 60,
    letterSpacing: -2,
  },
  quote: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  attr: {
    color: 'rgba(255,248,242,0.50)',
    fontFamily: FONTS.accent,
    fontSize: 13,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 8,
  },
});

// ─── Section: FinalCta ────────────────────────────────────────────────────────

function FinalCta() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const router = useRouter();
  const { platform } = useInstallDetect();

  function handleGetApp() {
    Linking.openURL(pickStoreUrl(platform));
  }

  function handlePricing() {
    router.push('/pricing' as any);
  }

  return (
    <View style={[ctaStyles.root, isWide && ctaStyles.rootWide]}>
      <View style={ctaStyles.glow} pointerEvents="none" />
      <Text style={[ctaStyles.title, !isWide && ctaStyles.titleCompact]}>
        Begin your cosmic year.
      </Text>
      <Text style={ctaStyles.body}>
        Your birth chart has been waiting. Your daily reading is ready at dawn.
      </Text>
      <View style={[ctaStyles.row, !isWide && ctaStyles.rowCompact]}>
        <TouchableOpacity style={ctaStyles.primary} onPress={handleGetApp} accessibilityRole="button">
          <Text style={ctaStyles.primaryLabel}>Get the app</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ctaStyles.secondary} onPress={handlePricing} accessibilityRole="button">
          <Text style={ctaStyles.secondaryLabel}>See pricing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ctaStyles = StyleSheet.create({
  root: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(18,200,178,0.22)',
    backgroundColor: 'rgba(18,200,178,0.06)',
    paddingHorizontal: 32,
    paddingVertical: 72,
    marginVertical: 56,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  rootWide: {
    paddingVertical: 96,
    paddingHorizontal: 48,
  },
  glow: {
    position: 'absolute',
    top: -160,
    left: '50%' as any,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(18,200,178,0.09)',
    transform: [{ translateX: -300 }],
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1.8,
    textAlign: 'center',
    maxWidth: 600,
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.1,
  },
  body: {
    color: 'rgba(255,248,242,0.72)',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 480,
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rowCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 320,
  },
  primary: {
    backgroundColor: COLORS.tide,
    borderRadius: 14,
    paddingHorizontal: 36,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  primaryLabel: {
    color: '#06040F',
    fontFamily: FONTS.heading,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  secondary: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.28)',
    paddingHorizontal: 36,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    backgroundColor: 'rgba(255,248,242,0.06)',
  },
  secondaryLabel: {
    color: 'rgba(255,248,242,0.88)',
    fontFamily: FONTS.heading,
    fontSize: 17,
    letterSpacing: -0.2,
  },
});

// ─── MarketingLanding ─────────────────────────────────────────────────────────

function MarketingLanding() {
  return (
    <View style={landingStyles.root}>
      <Hero />
      <HowItWorks />
      <TodaysSky />
      <FeaturePillars />
      <Testimonial />
      <FinalCta />
    </View>
  );
}

const landingStyles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 0,
  },
});

// ─── Root Route ───────────────────────────────────────────────────────────────

export default function IndexRoute() {
  // Native: show a loading indicator while the app bootstraps.
  if (Platform.OS !== 'web') {
    return (
      <View style={nativeStyles.root}>
        <ActivityIndicator color={COLORS.western} />
      </View>
    );
  }

  // Web: full marketing landing wrapped in nav + footer shell.
  return (
    <WebShell>
      <SEOHead
        title="CosmicSelf"
        description="Your cosmic mirror — daily readings, charts, and the wisdom of the stars, personalized for you."
        canonical="https://cosmicself.app/"
      />
      <MarketingLanding />
    </WebShell>
  );
}

const nativeStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDeep,
  },
});
