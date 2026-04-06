import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface StarFieldProps {
  children: React.ReactNode;
}

function Star({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          backgroundColor: COLORS.white,
        },
      ]}
    />
  );
}

// Simple seeded random for consistent star positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function StarField({ children }: StarFieldProps) {
  const stars = useMemo(() => {
    const result = [];
    for (let i = 0; i < 80; i++) {
      result.push({
        id: i,
        x: seededRandom(i * 7 + 1) * width,
        y: seededRandom(i * 13 + 3) * height,
        size: seededRandom(i * 3 + 5) * 2.5 + 0.5,
        opacity: seededRandom(i * 11 + 7) * 0.6 + 0.2,
      });
    }
    return result;
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientPrimary as unknown as [string, string, ...string[]]}
        style={styles.gradient}
      >
        {stars.map((star) => (
          <Star key={star.id} {...star} />
        ))}
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
});
