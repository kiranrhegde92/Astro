import React, { useEffect, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PALETTE = [
  COLORS.gold,
  COLORS.starGold,
  COLORS.iris,
  COLORS.coral,
  COLORS.tide,
  '#ffd3e0',
  '#c9b1ff',
];

type Piece = {
  id: number;
  startX: number;
  endX: number;
  endY: number;
  rotate: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'strip';
};

function makePieces(count: number): Piece[] {
  const pieces: Piece[] = [];
  const centerX = SCREEN_WIDTH / 2;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.random() - 0.5) * Math.PI; // -90..90
    const distance = 140 + Math.random() * 220;
    pieces.push({
      id: i,
      startX: centerX + (Math.random() - 0.5) * 40,
      endX: centerX + Math.cos(angle) * distance,
      endY: 260 + Math.sin(angle) * distance + Math.random() * 120,
      rotate: (Math.random() - 0.5) * 1080,
      delay: Math.floor(Math.random() * 120),
      duration: 900 + Math.floor(Math.random() * 700),
      color: PALETTE[i % PALETTE.length],
      size: 6 + Math.random() * 7,
      shape: (['square', 'circle', 'strip'] as const)[i % 3],
    });
  }
  return pieces;
}

type Props = {
  visible: boolean;
  onDone?: () => void;
  count?: number;
  haptic?: boolean;
};

export function ConfettiBurst({ visible, onDone, count = Platform.OS === 'android' ? 22 : 34, haptic = true }: Props) {
  const pieces = useMemo(() => makePieces(count), [count]);

  useEffect(() => {
    if (!visible) return;
    if (haptic) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    const timer = setTimeout(() => onDone?.(), 1800);
    return () => clearTimeout(timer);
  }, [visible, haptic, onDone]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {pieces.map((p) => (
        <Piece key={p.id} piece={p} />
      ))}
    </View>
  );
}

function Piece({ piece }: { piece: Piece }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: piece.duration, easing: Easing.out(Easing.cubic) }),
    );
    return () => cancelAnimation(progress);
  }, [piece.delay, piece.duration, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.1, 0.85, 1], [0, 1, 1, 0], 'clamp'),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [piece.startX, piece.endX]) },
      { translateY: interpolate(progress.value, [0, 1], [80, piece.endY]) },
      { rotate: `${progress.value * piece.rotate}deg` },
      { scale: interpolate(progress.value, [0, 0.2, 1], [0.2, 1, 0.9], 'clamp') },
    ],
  }));

  const shapeStyle = {
    width: piece.shape === 'strip' ? piece.size * 0.5 : piece.size,
    height: piece.shape === 'strip' ? piece.size * 1.8 : piece.size,
    borderRadius: piece.shape === 'circle' ? piece.size : piece.shape === 'strip' ? 2 : 1,
    backgroundColor: piece.color,
  };

  return <Animated.View style={[styles.piece, shapeStyle, style]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
