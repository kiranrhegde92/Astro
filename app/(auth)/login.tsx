import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import {
  getGoogleAuthErrorMessage,
  isUserEmailVerified,
  signIn,
  signInWithGoogle,
} from '../../src/services/authService';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';

const SYSTEMS = [
  ['Western', 'Transit mood'],
  ['Vedic', 'Nakshatra rhythm'],
  ['Chinese', 'Element pace'],
  ['KP', 'Signal detail'],
] as const;

function FocusInput({
  error,
  children,
}: { error?: boolean; children: React.ReactNode }) {
  const focused = useSharedValue(0);
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? COLORS.error
      : interpolateColor(focused.value, [0, 1], ['rgba(255,248,242,0.18)', COLORS.tide]),
  }));
  return (
    <Animated.View
      style={[styles.inputWrap, borderStyle]}
      onStartShouldSetResponder={() => false}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TextInput) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onFocus: (e: any) => {
              focused.value = withTiming(1, { duration: 180 });
              (child.props as any).onFocus?.(e);
            },
            onBlur: (e: any) => {
              focused.value = withTiming(0, { duration: 180 });
              (child.props as any).onBlur?.(e);
            },
          });
        }
        return child;
      })}
    </Animated.View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { showAlert, alertModal } = useCosmicAlert();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await signIn(email.trim().toLowerCase(), password);
      if (!isUserEmailVerified(user)) {
        showAlert('Verify your email', 'Open the verification link in your email before continuing.');
      }
    } catch (e: any) {
      const msg =
        e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : e.code === 'auth/too-many-requests'
          ? 'Too many attempts. Try again later.'
          : e.code === 'auth/network-request-failed'
          ? 'No internet connection.'
          : 'Sign in failed. Please try again.';
      showAlert('Sign in failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = getGoogleAuthErrorMessage(error);
      if (message) showAlert('Google sign-in failed', message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <StarField>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ResetScrollView
          contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {Platform.OS === 'web' ? (
            <TouchableOpacity
              onPress={() => router.push('/' as any)}
              style={styles.backHome}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={14} color="rgba(255,248,242,0.75)" />
              <Text style={styles.backHomeText}>Back to home</Text>
            </TouchableOpacity>
          ) : null}

          <View style={[styles.shell, isDesktop && styles.shellDesktop]}>
            {/* LEFT — cosmic panel */}
            {isDesktop ? (
              <Animated.View entering={FadeInDown.delay(60).duration(520)} style={styles.cosmicPanel}>
                <LinearGradient
                  colors={['rgba(62,224,200,0.18)', 'rgba(155,145,255,0.20)', 'rgba(241,183,79,0.16)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.cosmicGradient}
                  pointerEvents="none"
                />
                <View style={styles.cosmicInner}>
                  <Text style={styles.eyebrow}>MOBILE ASTROLOGY RITUAL</Text>
                  <Text style={styles.brand}>CosmicSelf</Text>
                  <Text style={styles.lede}>
                    Your day, chart, matches, and cosmic identity — drawn from four astrology systems.
                  </Text>
                  <View style={styles.systemList}>
                    {SYSTEMS.map(([name, label], i) => (
                      <View key={name} style={styles.systemRow}>
                        <Text style={styles.systemIndex}>0{i + 1}</Text>
                        <View style={styles.systemText}>
                          <Text style={styles.systemName}>{name}</Text>
                          <Text style={styles.systemLabel}>{label}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            ) : null}

            {/* RIGHT — form panel */}
            <Animated.View
              entering={FadeInDown.delay(120).duration(460)}
              style={[styles.formPanel, isDesktop && styles.formPanelDesktop]}
            >
              <View style={styles.formHeader}>
                {!isDesktop ? <Text style={styles.eyebrowCompact}>COSMICSELF</Text> : null}
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to pick up where the sky left off.</Text>
              </View>

              <View style={styles.fields}>
                <View>
                  <Text style={styles.label}>Email</Text>
                  <FocusInput error={!!errors.email}>
                    <Ionicons name="mail-outline" size={18} color="rgba(255,248,242,0.55)" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor="rgba(255,248,242,0.38)"
                      value={email}
                      onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: undefined })); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </FocusInput>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View>
                  <Text style={styles.label}>Password</Text>
                  <FocusInput error={!!errors.password}>
                    <Ionicons name="lock-closed-outline" size={18} color="rgba(255,248,242,0.55)" style={styles.icon} />
                    <TextInput
                      ref={passwordRef}
                      style={styles.input}
                      placeholder="Your password"
                      placeholderTextColor="rgba(255,248,242,0.38)"
                      value={password}
                      onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                      secureTextEntry={!showPass}
                      autoComplete="password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,248,242,0.62)" />
                    </TouchableOpacity>
                  </FocusInput>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>
              </View>

              <AnimatedPressable onPress={handleLogin} disabled={loading || googleLoading} haptic>
                <View style={styles.primaryBtn}>
                  {loading ? <ActivityIndicator color="#0a0816" /> : <Text style={styles.primaryBtnText}>Enter the observatory</Text>}
                </View>
              </AnimatedPressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={() => void handleGoogleSignIn()}
                style={styles.googleBtn}
                activeOpacity={0.78}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color={COLORS.textPrimary} />
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.linkBtn} activeOpacity={0.7}>
                <Text style={styles.linkText}>
                  New to CosmicSelf?{'  '}
                  <Text style={styles.linkAccent}>Create your cosmic profile</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={{ height: SPACING.xxl }} />
        </ResetScrollView>
      </KeyboardAvoidingView>
      {alertModal}
    </StarField>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backHome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,248,242,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.18)',
    marginBottom: SPACING.md,
  },
  backHomeText: {
    color: 'rgba(255,248,242,0.85)',
    fontFamily: FONTS.accentBold,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    gap: SPACING.lg,
  },
  containerDesktop: {
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  shell: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: SPACING.lg,
  },
  shellDesktop: {
    maxWidth: 1080,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 32,
  },

  // Cosmic left panel
  cosmicPanel: {
    flex: 1.05,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.16)',
    overflow: 'hidden',
    backgroundColor: 'rgba(23,24,45,0.58)',
    minHeight: 520,
    position: 'relative',
  },
  cosmicGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  cosmicInner: {
    flex: 1,
    padding: 36,
    justifyContent: 'space-between',
    gap: 24,
  },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
  },
  eyebrowCompact: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 2.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  brand: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2.2,
    marginTop: 14,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(120deg, #fff8f2 0%, #ffd9b8 38%, #12c8b2 72%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
        }
      : {}),
  },
  lede: {
    color: 'rgba(255,248,242,0.78)',
    fontSize: 16,
    lineHeight: 26,
    marginTop: 12,
    maxWidth: 360,
  },
  systemList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.14)',
    marginTop: 8,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.10)',
  },
  systemIndex: {
    width: 32,
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  systemText: { flex: 1 },
  systemName: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 17,
    lineHeight: 22,
  },
  systemLabel: {
    color: 'rgba(255,248,242,0.58)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },

  // Form panel
  formPanel: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.14)',
    backgroundColor: 'rgba(10,11,31,0.72)',
    padding: 28,
    gap: SPACING.lg,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(14px)' as any, boxShadow: '0 40px 80px -40px rgba(0,0,0,0.8)' as any }
      : {}),
  },
  formPanelDesktop: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  formHeader: { gap: 6, alignItems: 'flex-start' },
  title: {
    fontFamily: FONTS.display,
    fontSize: 34,
    lineHeight: 40,
    color: COLORS.white,
    letterSpacing: -1.2,
  },
  subtitle: {
    color: 'rgba(255,248,242,0.68)',
    fontSize: 15,
    lineHeight: 22,
  },
  fields: { gap: SPACING.md },
  label: {
    color: COLORS.starGold,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.6,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,248,242,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    minHeight: 54,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    paddingVertical: 14,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  eyeBtn: { padding: 4 },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4, marginLeft: 2 },
  primaryBtn: {
    backgroundColor: COLORS.tide,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 20px 42px -18px rgba(62,224,200,0.7)' as any }
      : {}),
  },
  primaryBtnText: {
    color: '#0a0816',
    fontSize: 15,
    fontFamily: FONTS.heading,
    letterSpacing: 0.6,
  },
  googleBtn: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.22)',
    backgroundColor: 'rgba(255,248,242,0.04)',
  },
  googleText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.heading,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,248,242,0.14)' },
  dividerText: { color: 'rgba(255,248,242,0.52)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  linkBtn: { alignItems: 'center', paddingVertical: SPACING.sm, marginTop: 4 },
  linkText: { color: 'rgba(255,248,242,0.7)', fontSize: 14 },
  linkAccent: { color: COLORS.tide, fontFamily: FONTS.heading },
});
