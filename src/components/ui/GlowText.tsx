import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

interface GlowTextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  color?: string;
  style?: TextStyle;
  align?: 'left' | 'center' | 'right';
}

const SIZES = { sm: 13, md: 17, lg: 24, xl: 32, hero: 42 };
const FAMILIES = {
  sm: FONTS.body,
  md: FONTS.body,
  lg: FONTS.heading,
  xl: FONTS.heading,
  hero: FONTS.display,
} as const;

export const GlowText = React.memo(function GlowText({
  children,
  size = 'md',
  color = COLORS.textPrimary,
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
          fontFamily: FAMILIES[size],
          fontWeight: size === 'sm' || size === 'md' ? '600' : undefined,
          letterSpacing: size === 'hero' ? -0.8 : size === 'xl' ? -0.4 : 0,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
});

const styles = StyleSheet.create({
  text: {
    includeFontPadding: false,
  },
});
