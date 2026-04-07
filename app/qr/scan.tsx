import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

/**
 * QR Scanner Screen
 *
 * In production, this would use expo-camera's barcode scanner.
 * For MVP, we provide a manual link entry fallback since camera
 * requires native build (not available in Expo Go for all platforms).
 */
export default function QRScanScreen() {
  const router = useRouter();
  const [manualLink, setManualLink] = useState('');

  const handleScan = () => {
    // In production: parse deep link, fetch profile, show compatibility
    // For now: navigate back with a message
    router.back();
  };

  return (
    <StarField>
      <ScreenHeader title="Scan Cosmic QR" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Scan someone's CosmicSelf QR code to instantly see your compatibility across all systems
        </Text>

        {/* Camera Placeholder */}
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraEmoji}>{'\u{1F4F7}'}</Text>
          <Text style={styles.cameraText}>Camera Scanner</Text>
          <Text style={styles.cameraSubtext}>
            Point your camera at a CosmicSelf QR code
          </Text>
          <Text style={styles.cameraNote}>
            (Camera access requires native build - use Expo Dev Build for full functionality)
          </Text>
        </View>

        {/* Manual Entry */}
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Or enter a CosmicSelf profile link:</Text>
          <TextInput
            style={styles.input}
            value={manualLink}
            onChangeText={setManualLink}
            placeholder="cosmicself.app/profile/..."
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />
          <CosmicButton
            title="Check Compatibility"
            onPress={handleScan}
            disabled={!manualLink.trim()}
          />
        </View>

        <CosmicButton
          title="Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  cameraPlaceholder: {
    aspectRatio: 1,
    maxHeight: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.violet,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  cameraEmoji: { fontSize: 48 },
  cameraText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  cameraSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  cameraNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  manualSection: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  manualLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 15,
  },
  backButton: {
    marginTop: SPACING.sm,
  },
});
