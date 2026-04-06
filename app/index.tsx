import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useUserStore } from '../src/store/userStore';
import { CosmicOrb } from '../src/components/ui/CosmicOrb';

const { width, height } = Dimensions.get('window');

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 100 }).map((_, i) => ({
  x: seededRandom(i * 7 + 1) * width,
  y: seededRandom(i * 13 + 3) * height,
  size: seededRandom(i * 3 + 5) * 2.2 + 0.3,
  opacity: seededRandom(i * 11 + 7) * 0.40 + 0.06,
  warm: seededRandom(i * 17 + 9) > 0.65,
}));

const SYSTEM_PILLS = [
  { label: '☉ Western', color: 'rgba(124, 109, 255, 0.18)', border: 'rgba(124, 109, 255, 0.55)' },
  { label: '🕉 Vedic',   color: 'rgba(255, 107, 53, 0.18)',  border: 'rgba(255, 107, 53, 0.55)' },
  { label: '龍 Chinese', color: 'rgba(255, 58, 92, 0.18)',   border: 'rgba(255, 58, 92, 0.55)' },
  { label: '◎ KP',       color: 'rgba(0, 229, 209, 0.18)',   border: 'rgba(0, 229, 209, 0.55)' },
];

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useUserStore();

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const orbY = useRef(new Animated.Value(-30)).current;
  const orbOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(30)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pillsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(containerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(orbOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(orbY, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(logoY, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(pillsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (user?.onboardingComplete) {
        router.replace('/(tabs)/today');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    }, 3200);
    return () => clearTimeout(timer);
  }, [isLoading, user]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Deep charcoal background */}
      <LinearGradient
        colors={['#12121e', '#0e0e18', '#181824', '#0c0c16']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Nebula hints */}
      <LinearGradient
        colors={['rgba(100,90,200,0.18)', 'rgba(80,70,180,0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject]}
      />
      {/* Galaxy arm diagonal sweep */}
      <LinearGradient
        colors={['transparent', 'rgba(180,180,240,0.07)', 'rgba(200,200,255,0.12)', 'rgba(180,180,240,0.05)', 'transparent']}
        start={{ x: 0, y: 0.25 }}
        end={{ x: 1, y: 0.75 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Stars */}
      {STARS.map((s, i) => (
        <View key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: s.size, height: s.size, borderRadius: s.size / 2,
          opacity: s.opacity,
          backgroundColor: s.warm ? '#ffffff' : '#dde2ff',
        }} />
      ))}

      {/* Orb */}
      <Animated.View style={[styles.orbWrapper, { opacity: orbOpacity, transform: [{ translateY: orbY }] }]}>
        <CosmicOrb size={260} primaryColor="#7C6DFF" secondaryColor="#00E5D1" />
      </Animated.View>

      {/* App name */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ translateY: logoY }] }]}>
        <Text style={styles.appName}>COSMIC</Text>
        <Text style={styles.appNameSub}>SELF</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineBlock, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>DISCOVER YOUR COSMIC DNA</Text>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divider}
        />
      </Animated.View>

      {/* System pills */}
      <Animated.View style={[styles.pillsRow, { opacity: pillsOpacity }]}>
        {SYSTEM_PILLS.map((p, i) => (
          <View key={i} style={[styles.pill, { backgroundColor: p.color, borderColor: p.border }]}>
            <Text style={styles.pillText}>{p.label}</Text>
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbWrapper: {
    position: 'absolute',
    top: height * 0.07,
    alignSelf: 'center',
  },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.xs },
  appName: {
    fontSize: 58,
    fontFamily: 'Cinzel_900Black',
    color: COLORS.white,
    letterSpacing: 8,
    textShadowColor: 'rgba(255,255,255,0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  appNameSub: {
    fontSize: 38,
    fontFamily: 'Cinzel_700Bold',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 16,
    marginTop: -12,
  },
  taglineBlock: { alignItems: 'center', marginBottom: SPACING.xl },
  tagline: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 4,
    fontFamily: 'Cinzel_400Regular',
  },
  divider: {
    width: 80, height: 1,
    marginTop: SPACING.md,
    opacity: 0.6,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  pillText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
