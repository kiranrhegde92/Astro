import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  TouchableWithoutFeedback,
  ViewStyle,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  haptic?: boolean;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { disabled?: boolean; selected?: boolean; busy?: boolean; checked?: boolean };
}

const isAndroid = Platform.OS === 'android';

export function AnimatedPressable({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  disabled = false,
  haptic = false,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: AnimatedPressableProps) {
  const press = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    if (disabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    Animated.spring(press, {
      toValue: 1,
      tension: 180,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(press, {
      toValue: 0,
      tension: 160,
      friction: 14,
      useNativeDriver: true,
    }).start();
  };

  // Android at half rotation angle to avoid GPU stress with SVG children
  const rotateAngle = isAndroid ? '3deg' : '6deg';
  const rotateAngleNeg = isAndroid ? '-3deg' : '-6deg';

  const animatedStyle = {
    transform: [
      { perspective: 900 },
      {
        scale: press.interpolate({
          inputRange: [0, 1],
          outputRange: [1, scaleTo],
        }),
      },
      {
        translateY: press.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
      {
        rotateX: press.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', rotateAngle],
        }),
      },
      {
        rotateY: press.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', rotateAngleNeg],
        }),
      },
    ],
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
