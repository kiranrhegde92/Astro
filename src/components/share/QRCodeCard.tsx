import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface QRCodeCardProps {
  userId: string;
  userName: string;
  cosmicDNA: string;
  sunSign?: string;
  animal?: string;
  rashi?: string;
  gradientColors?: string[];
  viewShotRef?: React.RefObject<ViewShot | null>;
}

export function QRCodeCard({
  userId,
  userName,
  cosmicDNA,
  sunSign,
  animal,
  rashi,
  gradientColors,
  viewShotRef,
}: QRCodeCardProps) {
  // Deep link URL - falls back to web URL for non-app users
  const deepLink = `https://cosmicself.app/profile/${userId}`;

  const colors = gradientColors ?? ['#0a0a2e', '#2d1b69', '#4a00e0'];

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'png', quality: 1 }}
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <Text style={styles.appName}>COSMICSELF</Text>

        {/* User Info */}
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.cosmicDNA}>{cosmicDNA}</Text>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrInner}>
            <QRCode
              value={deepLink}
              size={180}
              backgroundColor="white"
              color="#0a0a2e"
              quietZone={10}
            />
          </View>
        </View>

        {/* Scan prompt */}
        <Text style={styles.scanText}>Scan to see my Cosmic DNA</Text>
        <Text style={styles.scanSubtext}>& check our compatibility instantly</Text>

        {/* System icons */}
        <View style={styles.iconsRow}>
          {sunSign && (
            <View style={[styles.iconBadge, { borderColor: COLORS.western }]}>
              <Text style={styles.iconText}>{'\u2648'} {sunSign}</Text>
            </View>
          )}
          {rashi && (
            <View style={[styles.iconBadge, { borderColor: COLORS.vedic }]}>
              <Text style={styles.iconText}>{'\u{1F549}\uFE0F'} {rashi}</Text>
            </View>
          )}
          {animal && (
            <View style={[styles.iconBadge, { borderColor: COLORS.chinese }]}>
              <Text style={styles.iconText}>{'\u{1F409}'} {animal}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{'\u2728'} cosmicself.app</Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  appName: {
    color: COLORS.starGold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: SPACING.md,
  },
  userName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  cosmicDNA: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  qrContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  qrInner: {
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  scanText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  scanSubtext: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  iconBadge: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  iconText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
