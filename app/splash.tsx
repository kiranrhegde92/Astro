import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { CosmicOrb } from '../src/components/ui/CosmicOrb';
import { OrbIcon } from '../src/components/ui/OrbIcon';
import { COLORS, FONTS, SPACING, TYPE } from '../src/constants/theme';

const TOTAL_DURATION = 2600;

export default function SplashScreen() {
  const router = useRouter();
  const orbOpacity = useSharedValue(0);
  const orbScale = useSharedValue(0.74);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(18);
  const chipsOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    orbOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    orbScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.2)) });
    titleOpacity.value = withDelay(450, withTiming(1, { duration: 550 }));
    titleTranslateY.value = withDelay(450, withTiming(0, { duration: 550, easing: Easing.out(Easing.cubic) }));
    chipsOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    containerOpacity.value = withDelay(
      TOTAL_DURATION - 380,
      withTiming(0, { duration: 380 }, (finished) => {
        if (finished) runOnJS(() => router.replace('/'))();
      })
    );
  }, [chipsOpacity, containerOpacity, orbOpacity, orbScale, router, titleOpacity, titleTranslateY]);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbOpacity.value,
    transform: [{ scale: orbScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const chipsStyle = useAnimatedStyle(() => ({
    opacity: chipsOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.wrapper, containerStyle]}>
      <LinearGradient
        colors={['#fffaf1', '#f7efe0', '#eddcc1']}
        style={styles.container}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <View style={styles.content}>
          <Animated.View style={orbStyle}>
            <CosmicOrb size={220} />
          </Animated.View>

          <Animated.Text style={[styles.title, titleStyle]}>CosmicSelf</Animated.Text>
          <Animated.Text style={[styles.tagline, titleStyle]}>Open your chart like a ritual.</Animated.Text>

          <Animated.View style={[styles.chips, chipsStyle]}>
            <OrbIcon icon="sunny" size={32} accentColor={COLORS.sunOrange} secondaryColor="#ffe9c7" />
            <OrbIcon icon="moon" size={32} accentColor={COLORS.vedic} secondaryColor="#ffe6d8" />
            <OrbIcon icon="leaf" size={32} accentColor={COLORS.chinese} secondaryColor="#ffe7db" />
            <OrbIcon icon="sparkles" size={32} accentColor={COLORS.kp} secondaryColor="#e1f5ef" />
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: TYPE.hero.fontSize,
    letterSpacing: TYPE.hero.letterSpacing,
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  tagline: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    letterSpacing: 0,
    color: COLORS.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
});
