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
}

export function AnimatedPressable({
  children,
  onPress,
  style,
  scaleTo = 0.985,
  disabled = false,
  haptic = false,
}: AnimatedPressableProps) {
  const reducedMotion = Platform.OS === 'android';
  const press = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    if (disabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    Animated.spring(press, {
      toValue: 1,
      tension: 160,
      friction: 14,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(press, {
      toValue: 0,
      tension: 150,
      friction: 16,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: reducedMotion
      ? [
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
        ]
      : [
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
              outputRange: ['0deg', '6deg'],
            }),
          },
          {
            rotateY: press.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-6deg'],
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
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
