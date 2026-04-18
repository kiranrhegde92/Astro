import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';

export type PremiumCelebrationVariant = 'purchase' | 'trial' | 'restore';

const VARIANT_COPY: Record<PremiumCelebrationVariant, { title: string; body: string }> = {
  purchase: {
    title: 'Premium unlocked',
    body: 'The full 30-day forecast, Antardasha sub-chapters, journal insights, and ad-free reading are now active.',
  },
  trial: {
    title: 'Your 7-day trial is live',
    body: 'Explore the full Daily Blend, life roadmap, and insights. No charges until day 8 and you can cancel anytime from your store account.',
  },
  restore: {
    title: 'Purchases restored',
    body: 'Welcome back. Your Premium access is active again across all your cosmic systems.',
  },
};

interface PremiumCelebrationModalProps {
  visible: boolean;
  variant?: PremiumCelebrationVariant;
  onDismiss: () => void;
}

export function PremiumCelebrationModal({
  visible,
  variant = 'purchase',
  onDismiss,
}: PremiumCelebrationModalProps) {
  const { title, body } = VARIANT_COPY[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,208,120,0.22)', 'rgba(172,132,255,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.sparkleRow}>
            <Ionicons name="sparkles" size={22} color={COLORS.starGold} />
            <Ionicons name="star" size={28} color={COLORS.starGold} />
            <Ionicons name="sparkles" size={22} color={COLORS.starGold} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <LinearGradient
              colors={[COLORS.starGold, COLORS.sunOrange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.ctaText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,30,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,208,120,0.4)',
    overflow: 'hidden',
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.display,
    textAlign: 'center',
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  cta: {
    marginTop: SPACING.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: COLORS.deepSpace ?? '#0a0a2e',
    fontSize: 15,
    fontFamily: FONTS.heading,
    fontWeight: '700',
  },
});
