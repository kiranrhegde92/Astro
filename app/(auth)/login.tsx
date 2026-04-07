import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { signIn } from '../../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
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
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      const msg =
        e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : e.code === 'auth/too-many-requests'
          ? 'Too many attempts. Try again later.'
          : e.code === 'auth/network-request-failed'
          ? 'No internet connection.'
          : 'Sign in failed. Please try again.';
      Alert.alert('Sign in failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarField>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Ionicons name="planet" size={48} color={COLORS.western} />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your cosmic profile</Text>
          </View>

          <View style={styles.fields}>
            {/* Email */}
            <View>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={email}
                  onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: undefined })); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.icon} />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined })); }}
                  secureTextEntry={!showPass}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
          </View>

          <AnimatedPressable onPress={handleLogin} disabled={loading} haptic>
            <View style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
            </View>
          </AnimatedPressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.linkBtn} activeOpacity={0.7}>
            <Text style={styles.linkText}>
              Don't have an account?{'  '}
              <Text style={styles.linkAccent}>Create one</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: { fontFamily: FONTS.display, fontSize: 26, color: '#fff', letterSpacing: 2, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center' },
  fields: { gap: SPACING.md },
  label: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: FONTS.accent, letterSpacing: 1, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: SPACING.md,
    minHeight: 54,
  },
  inputError: { borderColor: COLORS.error },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#ffffff',
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
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: { color: '#fff', fontSize: 15, fontFamily: FONTS.heading, letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  dividerText: { color: 'rgba(255,255,255,0.40)', fontSize: 13 },
  linkBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  linkText: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  linkAccent: { color: COLORS.western, fontFamily: FONTS.heading },
});
