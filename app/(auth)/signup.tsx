import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
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
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { signUp } from '../../src/services/authService';
import { createUserProfile } from '../../src/services/firestoreService';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';

function FocusInput({ error, children }: { error?: boolean; children: React.ReactNode }) {
  const focused = useSharedValue(0);
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? COLORS.error
      : interpolateColor(focused.value, [0, 1], ['rgba(36,40,74,0.16)', COLORS.western]),
  }));
  return (
    <Animated.View style={[styles.inputWrap, borderStyle]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TextInput) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onFocus: (e: any) => { focused.value = withTiming(1, { duration: 180 }); (child.props as any).onFocus?.(e); },
            onBlur:  (e: any) => { focused.value = withTiming(0, { duration: 180 }); (child.props as any).onBlur?.(e);  },
          });
        }
        return child;
      })}
    </Animated.View>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { showAlert, alertModal } = useCosmicAlert();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await signUp(email.trim().toLowerCase(), password, name.trim());
      await createUserProfile(user.uid, {
        name: name.trim(),
        activeSystems: ['western', 'vedic', 'chinese', 'kp'],
        streak: 0,
        cosmicPoints: 0,
        onboardingComplete: false,
        language: 'en',
        subscription: { tier: 'free', status: 'active', purchasedItems: [] },
      } as any);
      // onAuthChange in _layout.tsx handles routing to onboarding
    } catch (e: any) {
      const msg =
        e.code === 'auth/email-already-in-use'
          ? 'That email is already registered.'
          : e.code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : e.code === 'auth/network-request-failed'
          ? 'No internet connection.'
          : 'Sign up failed. Please try again.';
      showAlert('Sign up failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarField>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.delay(80).duration(420).springify().damping(20)} style={styles.header}>
            <Ionicons name="sparkles" size={48} color={COLORS.western} />
            <Text style={styles.title}>Begin your journey</Text>
            <Text style={styles.subtitle}>Create your cosmic profile</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(420).springify().damping(20)} style={styles.fields}>
            {/* Name */}
            <View>
              <Text style={styles.label}>Your Name</Text>
              <FocusInput error={!!errors.name}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="A name to place in the stars"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={t => { setName(t); setErrors(p => ({ ...p, name: undefined })); }}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </FocusInput>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View>
              <Text style={styles.label}>Email</Text>
              <FocusInput error={!!errors.email}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.icon} />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textMuted}
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

            {/* Password */}
            <View>
              <Text style={styles.label}>Password</Text>
              <FocusInput error={!!errors.password}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.icon} />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Min 6 characters"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                  secureTextEntry={!showPass}
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </FocusInput>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400).springify().damping(20)}>
            <AnimatedPressable onPress={handleSignup} disabled={loading} haptic>
              <View style={styles.btn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
              </View>
            </AnimatedPressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(420).duration(380).springify().damping(20)}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn} activeOpacity={0.7}>
              <Text style={styles.linkText}>
                Already have an account?{'  '}
                <Text style={styles.linkAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {alertModal}
    </StarField>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    gap: SPACING.lg,
  },
  header: { gap: SPACING.sm, alignItems: 'center' },
  title: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.textPrimary, letterSpacing: 1, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  fields: { gap: SPACING.md },
  label: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.accent, letterSpacing: 1, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    minHeight: 54,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingVertical: 14,
  },
  eyeBtn: { padding: 4 },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4, marginLeft: 2 },
  btn: {
    backgroundColor: COLORS.western,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
    shadowColor: COLORS.western,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: { color: '#fff', fontSize: 15, fontFamily: FONTS.heading, letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(36,40,74,0.12)' },
  dividerText: { color: COLORS.textMuted, fontSize: 13 },
  linkBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
  linkAccent: { color: COLORS.western, fontFamily: FONTS.heading },
});
