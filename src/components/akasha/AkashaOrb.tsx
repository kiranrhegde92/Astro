import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

interface Props {
  mode: 'idle' | 'asking';
  size?: number;
}

export function AkashaOrb({ mode, size = 140 }: Props) {
  const scale = useSharedValue(1);
  const haloOpacity = useSharedValue(0.4);

  useEffect(() => {
    const duration = mode === 'asking' ? 900 : 2800;
    const peak = mode === 'asking' ? 1.08 : 1.04;

    scale.value = withRepeat(
      withTiming(peak, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    haloOpacity.value = withRepeat(
      withTiming(mode === 'asking' ? 0.7 : 0.5, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(haloOpacity);
    };
  }, [mode, scale, haloOpacity]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: haloOpacity.value }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.halo,
          { width: size * 1.4, height: size * 1.4, borderRadius: size * 0.7 },
          haloStyle,
        ]}
      />
      <Animated.View style={[orbStyle, { width: size, height: size }]}>
        <LinearGradient
          colors={[COLORS.violetSoft, COLORS.violet, COLORS.violetDeep]}
          style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 0.8, y: 0.9 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    backgroundColor: COLORS.violetSoft,
  },
  orb: {
    shadowColor: COLORS.violetDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
});
