import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { OrbIcon } from '../ui/OrbIcon';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import type { SharedProfilePayload } from '../../types/appData';
import { generateProfileLink } from '../../utils/qrCodeUtils';

interface QRCodeCardProps {
  userName: string;
  cosmicDNA: string;
  sunSign?: string;
  animal?: string;
  rashi?: string;
  profilePayload: SharedProfilePayload;
  gradientColors?: string[];
  viewShotRef?: React.RefObject<ViewShot | null>;
}

export function QRCodeCard({
  userName,
  cosmicDNA,
  sunSign,
  animal,
  rashi,
  profilePayload,
  gradientColors,
  viewShotRef,
}: QRCodeCardProps) {
  const deepLink = generateProfileLink(profilePayload);
  const colors = (gradientColors ?? ['#fffaf1', '#f7efe0', '#eddcc1']) as [string, string, ...string[]];

  return (
    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.overlay} />
        <Text style={styles.appName}>COSMICSELF</Text>

        <OrbIcon icon="qr-code" size={78} accentColor={COLORS.tide} secondaryColor="#e1f5ef" active />
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.cosmicDNA}>{cosmicDNA}</Text>

        <View style={styles.qrContainer}>
          <View style={styles.qrInner}>
            <QRCode
              value={deepLink}
              size={180}
              backgroundColor="white"
              color="#1b2233"
              quietZone={10}
            />
          </View>
        </View>

        <Text style={styles.scanText}>Scan to see my Cosmic DNA</Text>
        <Text style={styles.scanSubtext}>and compare our charts instantly</Text>

        <View style={styles.iconsRow}>
          {sunSign ? (
            <Legend icon="sunny" accent={COLORS.western} secondary="#ece6ff" text={sunSign} />
          ) : null}
          {rashi ? (
            <Legend icon="moon" accent={COLORS.vedic} secondary="#ffe6d8" text={rashi} />
          ) : null}
          {animal ? (
            <Legend icon="leaf" accent={COLORS.chinese} secondary="#ffe7db" text={animal} />
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>cosmicself.app</Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

function Legend({
  icon,
  accent,
  secondary,
  text,
}: {
  icon: React.ComponentProps<typeof OrbIcon>['icon'];
  accent: string;
  secondary: string;
  text: string;
}) {
  return (
    <View style={styles.legend}>
      <OrbIcon icon={icon} size={30} accentColor={accent} secondaryColor={secondary} />
      <Text style={styles.legendText}>{text}</Text>
    </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  appName: {
    color: COLORS.goldMid,
    fontSize: 13,
    fontFamily: FONTS.accent,
    letterSpacing: 3,
    marginBottom: SPACING.md,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontFamily: FONTS.display,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  cosmicDNA: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  qrContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  qrInner: {
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  scanText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.56)',
    borderColor: COLORS.glassBorder,
  },
  legendText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.4,
  },
  footer: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
  },
});
