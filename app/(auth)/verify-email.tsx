import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StarField } from '../../src/components/ui/StarField';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { sendCurrentUserVerificationEmail } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/authStore';

export default function VerifyEmailScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const refreshEmailVerification = useAuthStore((s) => s.refreshEmailVerification);
  const logout = useAuthStore((s) => s.logout);
  const { showAlert, alertModal } = useCosmicAlert();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleRefresh = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const verified = await refreshEmailVerification();
      if (!verified) {
        showAlert('Still waiting', 'Open the verification link from your email, then come back and check again.');
      }
    } catch {
      showAlert('Could not refresh', 'Please try again after a moment.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      await sendCurrentUserVerificationEmail();
      showAlert('Verification email sent', 'Check your inbox and spam folder for the latest verification link.');
    } catch {
      showAlert('Could not send email', 'Please wait a moment before requesting another verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <StarField>
      <ResetScrollView contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(80).duration(420).springify().damping(20)} style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="mail-unread-outline" size={42} color={COLORS.starGold} />
          </View>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.copy}>
            We sent a verification link to {firebaseUser?.email ?? 'your email'}. You can continue after that link is confirmed.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(420).springify().damping(20)} style={styles.card}>
          <Text style={styles.kicker}>What to do</Text>
          <Text style={styles.body}>1. Open the email from CosmicSelf or Firebase.</Text>
          <Text style={styles.body}>2. Tap the verification link.</Text>
          <Text style={styles.body}>3. Return here and check again.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(420).springify().damping(20)} style={styles.actions}>
          <CosmicButton
            title={checking ? 'Checking email' : 'I verified my email'}
            onPress={() => void handleRefresh()}
            loading={checking}
            disabled={checking}
          />
          <CosmicButton
            title={resending ? 'Sending email' : 'Resend verification email'}
            onPress={() => void handleResend()}
            loading={resending}
            disabled={resending}
            variant="outline"
          />
          <TouchableOpacity style={styles.signOutBtn} onPress={() => void handleSignOut()} activeOpacity={0.76} disabled={signingOut}>
            {signingOut ? <ActivityIndicator size="small" color={COLORS.coral} /> : <Ionicons name="log-out-outline" size={18} color={COLORS.coral} />}
            <Text style={styles.signOutText}>Use a different account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ResetScrollView>
      {alertModal}
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  containerDesktop: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.72)',
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
    marginBottom: SPACING.xs,
  },
  body: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    gap: SPACING.md,
  },
  signOutBtn: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  signOutText: {
    color: COLORS.coral,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
});
