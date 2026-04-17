/**
 * FormInput — text field with icon, floating label, error state, focus glow.
 * Single source of truth for form fields across onboarding + compatibility + referral.
 */
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BORDER_RADIUS, COLORS, FONTS, SPACING, TYPE } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon?: IconName;
  error?: string | null;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  trailing?: React.ReactNode;
}

export const FormInput = forwardRef<TextInput, FormInputProps>(function FormInput(
  {
    label,
    icon,
    error,
    helper,
    containerStyle,
    inputStyle,
    trailing,
    onFocus,
    onBlur,
    value,
    ...textProps
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const glow = useSharedValue(0);

  const handleFocus = useCallback(
    (e: any) => {
      setFocused(true);
      glow.value = withTiming(1, { duration: 180 });
      onFocus?.(e);
    },
    [glow, onFocus],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setFocused(false);
      glow.value = withTiming(0, { duration: 220 });
      onBlur?.(e);
    },
    [glow, onBlur],
  );

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const borderColor = useMemo(() => {
    if (error) return COLORS.error;
    if (focused) return COLORS.gold;
    return COLORS.glassBorder;
  }, [error, focused]);

  const hasValue = Boolean(value && String(value).length);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, error ? styles.labelError : null]}>{label}</Text>
      <View style={[styles.fieldWrap, { borderColor }]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.focusGlow, glowStyle, { shadowColor: COLORS.gold }]}
        />
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused || hasValue ? COLORS.gold : COLORS.textMuted}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.gold}
          accessibilityLabel={label}
          style={[styles.input, inputStyle]}
          {...textProps}
        />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
      {error ? (
        <View style={styles.helperRow}>
          <Ionicons name="alert-circle" size={12} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    ...TYPE.label,
    fontFamily: FONTS.accent,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  labelError: {
    color: COLORS.error,
  },
  fieldWrap: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    backgroundColor: COLORS.glassBg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  focusGlow: {
    ...StyleSheet.absoluteFillObject,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  icon: {
    opacity: 0.9,
  },
  input: {
    flex: 1,
    ...TYPE.subhead,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    paddingVertical: SPACING.sm + 2,
  },
  trailing: {
    marginLeft: SPACING.xs,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  errorText: {
    ...TYPE.caption,
    color: COLORS.error,
    fontFamily: FONTS.body,
  },
  helperText: {
    ...TYPE.caption,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    marginTop: 2,
  },
});
