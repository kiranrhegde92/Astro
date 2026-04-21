import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';

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
  const topPad = Math.max(insets.top, Platform.OS === 'ios' ? 10 : 14);
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={[styles.wrap, { paddingTop: topPad }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} activeOpacity={0.82} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.titleWrap}>
          <Text style={[styles.title, accentColor ? { color: accentColor } : null]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
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
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.accent,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
