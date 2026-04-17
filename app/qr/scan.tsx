import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { useConnectionsStore } from '../../src/store/connectionsStore';
import { parseDeepLink } from '../../src/utils/qrCodeUtils';

export default function QRScanScreen() {
  const router = useRouter();
  const importSharedProfile = useConnectionsStore((state) => state.importSharedProfile);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [mode, setMode] = useState<'camera' | 'paste'>('camera');
  const [manualLink, setManualLink] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  const parsed = useMemo(() => parseDeepLink(manualLink.trim()), [manualLink]);

  const handleBarcodeScanned = useCallback(
    (event: BarcodeScanningResult) => {
      if (hasScanned) return;
      const nextLink = event.data?.trim();
      const nextParsed = parseDeepLink(nextLink);
      if (!nextParsed.payload) return;
      setHasScanned(true);
      setManualLink(nextLink);
      setMode('paste');
    },
    [hasScanned]
  );

  const handleImport = async () => {
    if (!parsed.payload) return;
    const saved = await importSharedProfile(parsed.payload, 'qr');
    router.replace({
      pathname: '/(tabs)/compatibility',
      params: { profileId: saved.id },
    });
  };

  return (
    <StarField>
      <ScreenHeader title="Scan cosmic QR" />
      <ResetScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Scan a CosmicSelf QR code or paste a share link and the profile will be ready for comparison instantly.
        </Text>

        <View style={styles.modeRow}>
          {(['camera', 'paste'] as const).map((item) => {
            const active = item === mode;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setMode(item)}
                activeOpacity={0.84}
                style={[styles.modeChip, active && styles.modeChipActive]}
                accessibilityRole="button"
                accessibilityLabel={item === 'camera' ? 'Scan with camera mode' : 'Paste link mode'}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.modeText, active && styles.modeTextActive]}>
                  {item === 'camera' ? 'Scan with camera' : 'Paste link'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {mode === 'camera' ? (
          <GradientCard style={styles.scanCard} accentColor={COLORS.iris}>
            {!permission ? (
              <Text style={styles.cameraCopy}>Loading camera permissions...</Text>
            ) : !permission.granted ? (
              <>
                <Text style={styles.manualLabel}>Camera access</Text>
                <Text style={styles.cameraCopy}>
                  Allow camera access to scan a CosmicSelf QR code directly from the device.
                </Text>
                <CosmicButton title="Enable camera" onPress={() => void requestPermission()} />
              </>
            ) : cameraAvailable === false ? (
              <>
                <Text style={styles.manualLabel}>Camera unavailable</Text>
                <Text style={styles.cameraCopy}>
                  This device is not exposing a camera feed right now. Use the paste option instead.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.manualLabel}>Point the camera at a shared code</Text>
                <View style={styles.cameraFrame}>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    active={mode === 'camera'}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={handleBarcodeScanned}
                    onMountError={() => setCameraAvailable(false)}
                  />
                  <View style={styles.scanOverlay} pointerEvents="none">
                    <View style={styles.scanWindow} />
                  </View>
                </View>
                <Text style={styles.cameraHint}>
                  {hasScanned ? 'Scan captured. Review it in the import panel.' : 'Hold the QR code inside the frame.'}
                </Text>
                {hasScanned ? (
                  <TouchableOpacity
                    onPress={() => {
                      setHasScanned(false);
                      setManualLink('');
                    }}
                    activeOpacity={0.84}
                    style={styles.rescanButton}
                    accessibilityRole="button"
                    accessibilityLabel="Scan another QR code"
                  >
                    <Text style={styles.rescanText}>Scan again</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </GradientCard>
        ) : null}

        <GradientCard style={styles.scanCard} accentColor={COLORS.tide}>
          <Text style={styles.manualLabel}>Shared profile link</Text>
          <TextInput
            style={styles.input}
            value={manualLink}
            onChangeText={(value) => {
              setManualLink(value);
              setHasScanned(false);
            }}
            placeholder="https://cosmicself.app/profile?data=..."
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            scrollEnabled
            textAlignVertical="top"
            accessibilityLabel="Shared profile link"
          />

          {parsed.payload ? (
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Ready to import</Text>
              <Text style={styles.previewName}>{parsed.payload.name}</Text>
              <Text style={styles.previewDNA}>{parsed.payload.cosmicDNA}</Text>
              <Text style={styles.previewMeta}>
                {parsed.type === 'compat' ? 'Compatibility link' : 'Profile link'} - {parsed.payload.activeSystems.join(', ')}
              </Text>
            </View>
          ) : manualLink.trim() ? (
            <Text style={styles.invalidText}>That link does not look like a valid CosmicSelf shared profile.</Text>
          ) : null}
        </GradientCard>

        <View style={styles.actions}>
          <CosmicButton
            title="Import and compare"
            onPress={() => void handleImport()}
            disabled={!parsed.payload}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.84}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ResetScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modeChip: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeChipActive: {
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.bgMuted,
  },
  modeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  modeTextActive: {
    color: COLORS.textPrimary,
  },
  scanCard: {
    gap: SPACING.sm,
  },
  manualLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  cameraCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  cameraFrame: {
    height: 300,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.bgInkCard,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,11,31,0.35)',
  },
  scanWindow: {
    width: 210,
    height: 210,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.starGold,
    backgroundColor: 'transparent',
  },
  cameraHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  rescanButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  rescanText: {
    color: COLORS.iris,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.7,
  },
  input: {
    minHeight: 120,
    maxHeight: 150,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  preview: {
    gap: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassHighlight,
    padding: SPACING.md,
  },
  previewLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  previewName: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.heading,
  },
  previewDNA: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  previewMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  invalidText: {
    color: COLORS.coral,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    gap: SPACING.md,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
