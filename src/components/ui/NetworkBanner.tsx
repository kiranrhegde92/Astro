import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';

type BannerVariant = 'offline' | 'failure' | 'info';

const ICON_FOR: Record<BannerVariant, React.ComponentProps<typeof Ionicons>['name']> = {
  offline: 'cloud-offline-outline',
  failure: 'alert-circle-outline',
  info: 'information-circle-outline',
};

const TINT_FOR: Record<BannerVariant, string> = {
  offline: COLORS.textMuted,
  failure: COLORS.coral,
  info: COLORS.iris,
};

interface NetworkBannerProps {
  variant?: BannerVariant;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
  onDismiss?: () => void;
}

export function NetworkBanner({
  variant = 'failure',
  title,
  body,
  ctaLabel,
  onCta,
  onDismiss,
}: NetworkBannerProps) {
  const tint = TINT_FOR[variant];
  return (
    <View
      style={[styles.wrap, { borderColor: `${tint}55`, backgroundColor: `${tint}18` }]}
      accessibilityRole="alert"
      accessibilityLabel={`${title}${body ? `. ${body}` : ''}`}
    >
      <Ionicons name={ICON_FOR[variant]} size={18} color={tint} style={styles.icon} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: tint }]}>{title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
      </View>
      {ctaLabel && onCta ? (
        <Pressable
          onPress={onCta}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.8 }]}
          hitSlop={8}
        >
          <Text style={[styles.ctaText, { color: tint }]}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.6 }]}
          hitSlop={10}
        >
          <Ionicons name="close" size={16} color={COLORS.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  icon: {
    marginTop: 1,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontFamily: FONTS.accentBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  cta: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ctaText: {
    fontSize: 12,
    fontFamily: FONTS.accentBold,
    letterSpacing: 0.6,
  },
  dismiss: {
    padding: 4,
  },
});
