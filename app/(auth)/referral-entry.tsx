import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import Animated, { FadeInDown, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import {
  applyReferralTransaction,
  createReferralCodeDoc,
  createUserProfile,
  deleteAllUserData,
  generateUniqueReferralCode,
  getUserProfile,
  validateReferralCode,
} from '../../src/services/firestoreService';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { currentUser, deleteCurrentUser } from '../../src/services/authService';

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

export default function ReferralEntryScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const fbUser = currentUser();
  const setPendingReferral = useAuthStore((s) => s.setPendingReferral);
  const logout = useAuthStore((s) => s.logout);
  const pendingReferralCode = useAuthStore((s) => s.pendingReferralCode);
  const setPendingReferralCode = useAuthStore((s) => s.setPendingReferralCode);

  const [code, setCode] = useState(pendingReferralCode ?? '');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // If a referral code arrives via deep link while this screen is open, fill it in
  React.useEffect(() => {
    if (pendingReferralCode && !code) {
      setCode(pendingReferralCode);
    }
  }, [pendingReferralCode]);
  const { showAlert, alertModal } = useCosmicAlert();

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setCodeError('Referral code is required.');
      return;
    }

    if (!fbUser) {
      showAlert('Session expired', 'Please sign in again.');
      await logout();
      return;
    }

    setLoading(true);
    try {
      // 1. Pre-validate (fast feedback)
      const validation = await validateReferralCode(trimmed);
      if (!validation.valid) {
        setCodeError(validation.error);
        return;
      }

      // 2. Generate referral code for this new user
      const newReferralCode = await generateUniqueReferralCode();

      // 3. Create Firestore profile
      const name = fbUser.displayName?.trim() || fbUser.email?.split('@')[0] || 'Cosmic User';
      await createUserProfile(fbUser.uid, {
        name,
        activeSystems: [],
        streak: 0,
        cosmicPoints: 0,
        onboardingComplete: false,
        language: 'en',
        subscription: { tier: 'free', status: 'active' },
        referralCode: newReferralCode,
        referralCount: 0,
      } as any);

      // 4. Store the referral code doc for this new user
      await createReferralCodeDoc(newReferralCode, fbUser.uid);

      // 5. Atomically apply the referral (increments referrer count, sets referredBy)
      const result = await applyReferralTransaction(fbUser.uid, trimmed);
      if (!result.success) {
        // Clean up: delete newly created profile + auth user since referral failed
        await deleteAllUserData(fbUser.uid).catch(() => {});
        await deleteCurrentUser().catch(() => {});
        setCodeError(result.error);
        await logout();
        return;
      }

      // 6. Load the full profile and hydrate the store
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        useUserStore.getState().setUser(profile as any);
      }

      // 7. Clear pending flag — _layout.tsx routing takes over to onboarding
      setPendingReferralCode(null);
      setPendingReferral(false);
    } catch {
      showAlert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarField>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ResetScrollView contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.delay(80).duration(420).springify().damping(20)} style={styles.header}>
            <Ionicons name="sparkles" size={48} color={COLORS.western} />
            <Text style={styles.title}>You need an invite</Text>
            <Text style={styles.subtitle}>CosmicSelf is invite-only.{'\n'}Ask a friend for their referral code to continue.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(420).springify().damping(20)} style={styles.fields}>
            <View>
              <Text style={styles.label}>Referral Code</Text>
              <FocusInput error={!!codeError}>
                <Ionicons name="key-outline" size={18} color="#6b7390" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ABCD1234"
                  placeholderTextColor="#6b7390"
                  value={code}
                  onChangeText={(t) => { setCode(t); setCodeError(undefined); }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </FocusInput>
              {codeError && <Text style={styles.errorText}>{codeError}</Text>}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400).springify().damping(20)}>
            <AnimatedPressable onPress={handleSubmit} disabled={loading} haptic>
              <View style={styles.btn}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Continue</Text>}
              </View>
            </AnimatedPressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(420).duration(380).springify().damping(20)} style={styles.cancelWrap}>
            <Text style={styles.cancelText}>Wrong account?{'  '}</Text>
            <Text style={styles.cancelLink} onPress={() => void logout()}>Sign out</Text>
          </Animated.View>

          <View style={{ height: SPACING.xxl }} />
        </ResetScrollView>
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
  containerDesktop: {
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  header: { gap: SPACING.sm, alignItems: 'center' },
  title: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.textPrimary, letterSpacing: 1, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
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
  input: { flex: 1, color: '#1b2233', fontSize: 16, paddingVertical: 14, letterSpacing: 2 },
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
  cancelWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: COLORS.textMuted, fontSize: 14 },
  cancelLink: { color: COLORS.western, fontSize: 14, fontFamily: FONTS.heading },
});
