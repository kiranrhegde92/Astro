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
import { BORDER_RADIUS, COLORS, SPACING, FONTS } from '../../src/constants/theme';
import {
  deleteCurrentUser,
  getGoogleAuthErrorMessage,
  isUserEmailVerified,
  signInWithGoogle,
  signUp,
} from '../../src/services/authService';
import {
  applyReferralTransaction,
  createReferralCodeDoc,
  createUserProfile,
  deleteAllUserData,
  generateUniqueReferralCode,
  validateReferralCode,
} from '../../src/services/firestoreService';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';

const PERKS = [
  ['Today', 'A short daily bend across four systems.'],
  ['Self Chart', 'Western, Vedic, Chinese, KP in plain English.'],
  ['Match', 'Compatibility reading with anyone saved.'],
  ['Cosmic QR', 'A shareable identity — only what you choose.'],
] as const;

function FocusInput({ error, children }: { error?: boolean; children: React.ReactNode }) {
  const focused = useSharedValue(0);
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? COLORS.error
      : interpolateColor(focused.value, [0, 1], ['rgba(255,248,242,0.18)', COLORS.tide]),
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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const referralRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { showAlert, alertModal } = useCosmicAlert();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; referralCode?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!referralCode.trim()) e.referralCode = 'Referral code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const trimmedCode = referralCode.trim().toUpperCase();
      const validation = await validateReferralCode(trimmedCode);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, referralCode: validation.error }));
        return;
      }
      const user = await signUp(email.trim().toLowerCase(), password, name.trim());
      const newReferralCode = await generateUniqueReferralCode();
      await createUserProfile(user.uid, {
        name: name.trim(),
        activeSystems: [],
        streak: 0,
        cosmicPoints: 0,
        onboardingComplete: false,
        language: 'en',
        subscription: { tier: 'free', status: 'active' },
        referralCode: newReferralCode,
        referralCount: 0,
      } as any);
      await createReferralCodeDoc(newReferralCode, user.uid);
      const result = await applyReferralTransaction(user.uid, trimmedCode);
      if (!result.success) {
        await deleteAllUserData(user.uid).catch(() => {});
        await deleteCurrentUser().catch(() => {});
        setErrors((prev) => ({ ...prev, referralCode: result.error }));
        return;
      }
      if (!isUserEmailVerified(user)) {
        showAlert('Verify your email', 'We sent a verification link. You can continue after confirming your email.');
      }
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
            {isDesktop ? (
              <Animated.View entering={FadeInDown.delay(60).duration(520)} style={styles.cosmicPanel}>
                <LinearGradient
                  colors={['rgba(241,183,79,0.22)', 'rgba(199,122,216,0.18)', 'rgba(62,224,200,0.16)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.cosmicGradient}
                  pointerEvents="none"
                />
                <View style={styles.cosmicInner}>
                  <Text style={styles.eyebrow}>JOIN THE OBSERVATORY</Text>
                  <Text style={styles.brand}>Begin your journey</Text>
                  <Text style={styles.lede}>
                    Create a cosmic profile and the sky starts speaking in your language — across Western, Vedic, Chinese, and KP.
                  </Text>
                  <View style={styles.perks}>
                    {PERKS.map(([title, body], i) => (
                      <View key={title} style={styles.perkRow}>
                        <Text style={styles.perkIndex}>0{i + 1}</Text>
                        <View style={styles.perkText}>
                          <Text style={styles.perkTitle}>{title}</Text>
                          <Text style={styles.perkBody}>{body}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            ) : null}

            <Animated.View
              entering={FadeInDown.delay(120).duration(460)}
              style={[styles.formPanel, isDesktop && styles.formPanelDesktop]}
            >
              <View style={styles.formHeader}>
                {!isDesktop ? <Text style={styles.eyebrowCompact}>JOIN COSMICSELF</Text> : null}
                <Text style={styles.title}>Create your account</Text>
                <Text style={styles.subtitle}>A quiet place for your chart, your day, and the people you care about.</Text>
              </View>

              <View style={styles.fields}>
                <View>
                  <Text style={styles.label}>Your Name</Text>
                  <FocusInput error={!!errors.name}>
                    <Ionicons name="person-outline" size={18} color="rgba(255,248,242,0.55)" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="A name to place in the stars"
                      placeholderTextColor="rgba(255,248,242,0.38)"
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

                <View>
                  <Text style={styles.label}>Email</Text>
                  <FocusInput error={!!errors.email}>
                    <Ionicons name="mail-outline" size={18} color="rgba(255,248,242,0.55)" style={styles.icon} />
                    <TextInput
                      ref={emailRef}
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
                      placeholder="Min 6 characters"
                      placeholderTextColor="rgba(255,248,242,0.38)"
                      value={password}
                      onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                      secureTextEntry={!showPass}
                      autoComplete="new-password"
                      returnKeyType="next"
                      onSubmitEditing={() => referralRef.current?.focus()}
                    />
                    <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,248,242,0.62)" />
                    </TouchableOpacity>
                  </FocusInput>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <View>
                  <Text style={styles.label}>Referral Code</Text>
                  <FocusInput error={!!errors.referralCode}>
                    <Ionicons name="key-outline" size={18} color="rgba(255,248,242,0.55)" style={styles.icon} />
                    <TextInput
                      ref={referralRef}
                      style={[styles.input, styles.codeInput]}
                      placeholder="Ask a friend for their code"
                      placeholderTextColor="rgba(255,248,242,0.38)"
                      value={referralCode}
                      onChangeText={t => { setReferralCode(t); setErrors(p => ({ ...p, referralCode: undefined })); }}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleSignup}
                    />
                  </FocusInput>
                  {errors.referralCode && <Text style={styles.errorText}>{errors.referralCode}</Text>}
                </View>
              </View>

              <AnimatedPressable onPress={handleSignup} disabled={loading || googleLoading} haptic>
                <View style={styles.primaryBtn}>
                  {loading ? <ActivityIndicator color="#0a0816" /> : <Text style={styles.primaryBtnText}>Create my cosmic profile</Text>}
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

              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.linkBtn} activeOpacity={0.7}>
                <Text style={styles.linkText}>
                  Already have an account?{'  '}
                  <Text style={styles.linkAccent}>Sign in</Text>
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
  root: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    gap: SPACING.lg,
  },
  containerDesktop: { paddingHorizontal: 32, paddingTop: 80 },
  shell: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: SPACING.lg },
  shellDesktop: { maxWidth: 1080, flexDirection: 'row', alignItems: 'stretch', gap: 32 },

  cosmicPanel: {
    flex: 1.05,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.16)',
    overflow: 'hidden',
    backgroundColor: 'rgba(23,24,45,0.58)',
    minHeight: 620,
    position: 'relative',
  },
  cosmicGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.9 },
  cosmicInner: { flex: 1, padding: 36, justifyContent: 'space-between', gap: 24 },
  eyebrow: { color: COLORS.starGold, fontFamily: FONTS.accent, fontSize: 12, letterSpacing: 2 },
  eyebrowCompact: { color: COLORS.starGold, fontFamily: FONTS.accent, fontSize: 11, letterSpacing: 2.4, marginBottom: 8, textAlign: 'center' },
  brand: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    marginTop: 14,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage: 'linear-gradient(120deg, #fff8f2 0%, #ffd9b8 38%, #12c8b2 72%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
        }
      : {}),
  },
  lede: { color: 'rgba(255,248,242,0.78)', fontSize: 16, lineHeight: 26, marginTop: 12, maxWidth: 380 },
  perks: { borderTopWidth: 1, borderTopColor: 'rgba(255,248,242,0.14)', marginTop: 8 },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,248,242,0.10)',
  },
  perkIndex: { width: 32, color: COLORS.starGold, fontFamily: FONTS.accent, fontSize: 11, letterSpacing: 1.4, paddingTop: 3 },
  perkText: { flex: 1 },
  perkTitle: { color: COLORS.white, fontFamily: FONTS.heading, fontSize: 17, lineHeight: 22 },
  perkBody: { color: 'rgba(255,248,242,0.58)', fontSize: 13, lineHeight: 19, marginTop: 2 },

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
  formPanelDesktop: { flex: 1, padding: 40, justifyContent: 'center' },
  formHeader: { gap: 6, alignItems: 'flex-start' },
  title: { fontFamily: FONTS.display, fontSize: 32, lineHeight: 38, color: COLORS.white, letterSpacing: -1.2 },
  subtitle: { color: 'rgba(255,248,242,0.68)', fontSize: 15, lineHeight: 22 },
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
  codeInput: { letterSpacing: 2 },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4, marginLeft: 2 },
  primaryBtn: {
    backgroundColor: COLORS.tide,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 20px 42px -18px rgba(62,224,200,0.7)' as any } : {}),
  },
  primaryBtnText: { color: '#0a0816', fontSize: 15, fontFamily: FONTS.heading, letterSpacing: 0.6 },
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
  googleText: { color: COLORS.textPrimary, fontSize: 15, fontFamily: FONTS.heading },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,248,242,0.14)' },
  dividerText: { color: 'rgba(255,248,242,0.52)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  linkBtn: { alignItems: 'center', paddingVertical: SPACING.sm, marginTop: 4 },
  linkText: { color: 'rgba(255,248,242,0.7)', fontSize: 14 },
  linkAccent: { color: COLORS.tide, fontFamily: FONTS.heading },
});
