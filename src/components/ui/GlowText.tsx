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

const SIZES = { sm: 13, md: 17, lg: 23, xl: 28, hero: 42 };

const FONT_FAMILY: Record<string, string | undefined> = {
  sm:   undefined,
  md:   undefined,
  lg:   'Cinzel_700Bold',
  xl:   'Cinzel_700Bold',
  hero: 'Cinzel_900Black',
};

const LETTER_SPACING: Record<string, number> = {
  sm: 0, md: 0.3, lg: 1, xl: 2, hero: 4,
};

export const GlowText = React.memo(function GlowText({
  children,
  size = 'md',
  color = COLORS.white,
  style,
  align = 'left',
}: GlowTextProps) {
  const font = FONT_FAMILY[size];

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: SIZES[size],
          color,
          textAlign: align,
          textShadowColor: 'rgba(255,255,255,0.18)',
          textShadowRadius: size === 'hero' ? 22 : size === 'xl' ? 16 : 10,
          fontFamily: font,
          fontWeight: font ? undefined : '700',
          letterSpacing: LETTER_SPACING[size],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
});

const styles = StyleSheet.create({
  text: { textShadowOffset: { width: 0, height: 0 } },
});
