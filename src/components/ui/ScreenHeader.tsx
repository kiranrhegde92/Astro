/**
 * ScreenHeader — unified header for modal/detail screens
 *
 * - Consistent back button (Ionicons chevron-back inside a glass pill)
 * - Centered GlowText title with optional accent color
 * - Safe-area top inset handling so screens don't need their own paddingTop
 *
 * Use on every non-tab screen (settings, subscription, reading/*, share/*,
 * qr/*) to keep navigation/header treatment uniform.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlowText } from './GlowText';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface ScreenHeaderProps {
  title: string;
  accentColor?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export const ScreenHeader = React.memo(function ScreenHeader({
  title,
  accentColor,
  onBack,
  showBack = true,
  rightSlot,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());
  const topPad = Math.max(insets.top, Platform.OS === 'ios' ? 12 : 16);

  return (
    <View style={[styles.wrap, { paddingTop: topPad }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleWrap}>
          <GlowText size="lg" align="center" color={accentColor ?? COLORS.white}>
            {title}
          </GlowText>
        </View>

        <View style={styles.side}>{rightSlot}</View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
