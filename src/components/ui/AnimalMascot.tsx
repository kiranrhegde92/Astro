import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

const ANIMAL_EMOJI: Record<string, string> = {
  Rat: '\u{1F400}',
  Ox: '\u{1F402}',
  Tiger: '\u{1F405}',
  Rabbit: '\u{1F407}',
  Dragon: '\u{1F409}',
  Snake: '\u{1F40D}',
  Horse: '\u{1F40E}',
  Goat: '\u{1F410}',
  Monkey: '\u{1F412}',
  Rooster: '\u{1F413}',
  Dog: '\u{1F415}',
  Pig: '\u{1F416}',
};

const ANIMAL_HALO: Record<string, readonly [string, string]> = {
  Rat: ['rgba(162,155,254,0.35)', 'rgba(201,177,255,0.1)'],
  Ox: ['rgba(253,203,110,0.35)', 'rgba(255,159,127,0.1)'],
  Tiger: ['rgba(255,127,80,0.35)', 'rgba(253,203,110,0.1)'],
  Rabbit: ['rgba(255,196,215,0.4)', 'rgba(253,121,168,0.1)'],
  Dragon: ['rgba(255,107,107,0.35)', 'rgba(253,203,110,0.1)'],
  Snake: ['rgba(107,207,127,0.35)', 'rgba(62,224,200,0.1)'],
  Horse: ['rgba(253,203,110,0.35)', 'rgba(255,159,127,0.1)'],
  Goat: ['rgba(232,216,180,0.4)', 'rgba(199,168,122,0.1)'],
  Monkey: ['rgba(212,165,116,0.35)', 'rgba(160,145,108,0.1)'],
  Rooster: ['rgba(255,159,127,0.35)', 'rgba(255,107,107,0.1)'],
  Dog: ['rgba(160,145,108,0.35)', 'rgba(212,165,116,0.1)'],
  Pig: ['rgba(255,180,162,0.4)', 'rgba(253,121,168,0.1)'],
};

type Props = {
  animal?: string;
  size?: number;
  celebrating?: boolean;
};

export function AnimalMascot({ animal, size = 72, celebrating = false }: Props) {
  const key = animal ?? '';
  const emoji = ANIMAL_EMOJI[key] ?? '\u2728';
  const halo = ANIMAL_HALO[key] ?? (['rgba(241,183,79,0.35)', 'rgba(241,183,79,0.08)'] as const);

  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  const blink = useSharedValue(1);
  const celebrate = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    sway.value = withRepeat(
      withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breath, sway]);

  useEffect(() => {
    const interval = setInterval(() => {
      blink.value = withSequence(
        withTiming(0.2, { duration: 90 }),
        withDelay(90, withTiming(1, { duration: 120 })),
      );
    }, 4500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [blink]);

  useEffect(() => {
    if (!celebrating) return;
    celebrate.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) }),
    );
  }, [celebrating, celebrate]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breath.value, [0, 1], [0.55, 0.95]),
    transform: [{ scale: interpolate(breath.value, [0, 1], [0.94, 1.08]) }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    opacity: blink.value,
    transform: [
      { translateY: interpolate(breath.value, [0, 1], [0, -3]) },
      { rotate: `${interpolate(sway.value, [0, 1], [-4, 4])}deg` },
      {
        scale:
          1 + interpolate(celebrate.value, [0, 1], [0, 0.28]) + interpolate(breath.value, [0, 1], [0, 0.04]),
      },
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: celebrate.value,
    transform: [{ scale: 0.8 + celebrate.value * 0.6 }],
  }));

  const containerStyle = useMemo(
    () => [styles.container, { width: size, height: size }],
    [size],
  );

  return (
    <View style={containerStyle}>
      <Animated.View style={[styles.halo, haloStyle]}>
        <LinearGradient colors={halo as [string, string]} style={StyleSheet.absoluteFillObject} />
      </Animated.View>
      <Animated.Text style={[styles.emoji, { fontSize: size * 0.6, lineHeight: size * 0.78 }, emojiStyle]}>
        {emoji}
      </Animated.Text>
      <Animated.Text style={[styles.sparkle, sparkleStyle]}>{'\u2728'}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 16,
    color: COLORS.starGold,
  },
});
