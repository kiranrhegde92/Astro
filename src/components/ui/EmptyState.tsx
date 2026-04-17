/**
 * EmptyState — unified empty/loading/error rendering.
 * Produces a consistent shape: orb → title → body → optional CTA.
 */
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';
import { CosmicOrb } from './CosmicOrb';
import { CosmicButton } from './CosmicButton';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  variant?: 'loading' | 'empty' | 'error';
  title: string;
  body?: string;
  icon?: IconName;
  ctaLabel?: string;
  onCta?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState = React.memo(function EmptyState({
  variant = 'empty',
  title,
  body,
  icon,
  ctaLabel,
  onCta,
  secondaryLabel,
  onSecondary,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityLiveRegion="polite">
      <View style={styles.orb}>
        {variant === 'loading' ? (
          <CosmicOrb size={96} />
        ) : (
          <View style={styles.iconHalo}>
            <Ionicons
              name={
                icon ?? (variant === 'error' ? 'cloud-offline-outline' : 'sparkles-outline')
              }
              size={28}
              color={variant === 'error' ? COLORS.error : COLORS.gold}
            />
          </View>
        )}
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {variant === 'loading' ? (
        <ActivityIndicator color={COLORS.gold} style={styles.loader} />
      ) : null}
      {ctaLabel && onCta ? (
        <CosmicButton title={ctaLabel} onPress={onCta} style={styles.cta} />
      ) : null}
      {secondaryLabel && onSecondary ? (
        <CosmicButton
          variant="outline"
          title={secondaryLabel}
          onPress={onSecondary}
          style={styles.cta}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  title: {
    ...TYPE.heading,
    color: COLORS.textPrimary,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  body: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    fontFamily: FONTS.body,
    textAlign: 'center',
    maxWidth: 320,
  },
  loader: {
    marginTop: SPACING.xs,
  },
  cta: {
    marginTop: SPACING.sm,
    minWidth: 220,
  },
});
