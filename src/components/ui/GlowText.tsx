import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface GlowTextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  color?: string;
  style?: TextStyle;
  align?: 'left' | 'center' | 'right';
}

const SIZES = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
  hero: 42,
};

export function GlowText({
  children,
  size = 'md',
  color = COLORS.white,
  style,
  align = 'left',
}: GlowTextProps) {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: SIZES[size],
          color,
          textAlign: align,
          textShadowColor: color === COLORS.starGold ? COLORS.starGold : COLORS.violet,
          textShadowRadius: size === 'hero' ? 20 : 10,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
    textShadowOffset: { width: 0, height: 0 },
  },
});
