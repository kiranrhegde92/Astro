import React, { useEffect, useRef, useState } from 'react';
import { AppState, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { QRRevealAnimation } from '../../src/components/ui/QRRevealAnimation';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { getCosmicDNASummary } from '../../src/engines/unified';
import { captureAndShare } from '../../src/utils/shareUtils';
import { QR_THEMES, getQRThemeColors, generateProfileLink } from '../../src/utils/qrCodeUtils';
import type { QRThemeName } from '../../src/utils/qrCodeUtils';
import type { SharedProfilePayload } from '../../src/types/appData';

export default function MyQRCodeScreen() {
  const router = useRouter();
  const user = useActiveProfile();
  const viewShotRef = useRef<ViewShot>(null);
  const [selectedTheme, setSelectedTheme] = useState<QRThemeName>('Cosmic Night');
  const [revealVersion, setRevealVersion] = useState(0);
  const isFocused = useIsFocused();
  const themeColors = React.useMemo(() => getQRThemeColors(selectedTheme), [selectedTheme]);

  useEffect(() => {
    if (!isFocused) return;
    setRevealVersion((value) => value + 1);
  }, [isFocused, selectedTheme]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isFocused) {
        setRevealVersion((value) => value + 1);
      }
    });
    return () => subscription.remove();
  }, [isFocused]);

  if (!user?.western || !user?.vedic || !user?.chinese) return null;

  const cosmicDNA = getCosmicDNASummary({
    western: user.western,
    vedic: user.vedic,
    chinese: user.chinese,
    kp: user.kp,
  });
  const profilePayload: SharedProfilePayload = {
    version: 1,
    id: user.id,
    name: user.name,
    birthDetails: user.birthDetails,
    activeSystems: user.activeSystems,
    profile: {
      // Keep QR payload compact enough for offline scanning.
      western: {
        sun: user.western.sun,
        moon: user.western.moon,
        rising: user.western.rising,
        element: user.western.element,
        modality: user.western.modality,
        planets: [],
      },
      vedic: {
        rashi: user.vedic.rashi,
        nakshatra: user.vedic.nakshatra,
        nakshatraPada: user.vedic.nakshatraPada,
        moonSign: user.vedic.moonSign,
        dashas: [],
        currentDasha: {
            planet: user.vedic.currentDasha.planet,
            startDate: user.vedic.currentDasha.startDate,
            endDate: user.vedic.currentDasha.endDate,
          },
        remedies: [],
      },
      chinese: {
        animal: user.chinese.animal,
        element: user.chinese.element,
        yinYang: user.chinese.yinYang,
        luckyNumbers: [],
        luckyColors: user.chinese.luckyColors.slice(0, 2),
        compatibleAnimals: [],
        incompatibleAnimals: [],
      },
      kp: user.kp
        ? {
            sublords: [],
            cusps: [],
            significators: [],
            predictions: [],
          }
        : undefined,
    },
    cosmicDNA,
    sharedAt: new Date().toISOString(),
  };

  const deepLink = generateProfileLink(profilePayload);

  const handleShare = () => {
    captureAndShare(viewShotRef, 'Scan my Cosmic DNA!');
  };

  return (
    <StarField>
      <ScreenHeader title="My cosmic QR" />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Your rashi rises as a living sigil, then settles into a scan-ready QR.
        </Text>

        {/* Inline QR reveal stage */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <View style={styles.revealWrap}>
            <QRRevealAnimation
              key={`${user.id}-${selectedTheme}-${revealVersion}`}
              rashi={user.vedic.rashi}
              chineseAnimal={user.chinese.animal}
              deepLink={deepLink}
              userName={user.name}
              cosmicDNA={cosmicDNA}
              themeColors={themeColors}
            />
          </View>
        </ViewShot>

        {/* Theme Picker */}
        <Text style={styles.themeLabel}>Choose the atmosphere</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.themesRow}
        >
          {QR_THEMES.map((theme) => (
            <TouchableOpacity
              key={theme.name}
              onPress={() => setSelectedTheme(theme.name)}
              style={[
                styles.themeOption,
                selectedTheme === theme.name && styles.themeOptionSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${theme.name} QR theme`}
              accessibilityState={{ selected: selectedTheme === theme.name }}
            >
              <View
                style={[
                  styles.themePreview,
                  { backgroundColor: theme.colors[1] },
                ]}
              />
              <Text
                style={[
                  styles.themeName,
                  selectedTheme === theme.name && styles.themeNameSelected,
                ]}
              >
                {theme.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <CosmicButton
            title="Share My QR Code"
            onPress={handleShare}
            colors={[COLORS.starGold, COLORS.sunOrange]}
          />
          <CosmicButton
            title="Scan Someone's Code"
            onPress={() => router.push('/qr/scan')}
            variant="outline"
          />
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Ways to Use Your Cosmic QR</Text>
          <TipItem emoji={'\u{1F389}'} text="Show at parties for instant cosmic connections" />
          <TipItem emoji={'\u{1F4F1}'} text="Add to your dating app profile" />
          <TipItem emoji={'\u{1F4C7}'} text="Print on stickers or business cards" />
          <TipItem emoji={'\u{1F91D}'} text="Scan at meetups to compare charts" />
        </View>

        <View style={styles.bottomPad} />
      </ResetScrollView>
    </StarField>
  );
}

function TipItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.tipItem}>
      <Text style={styles.tipEmoji}>{emoji}</Text>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  revealWrap: {
    marginBottom: SPACING.lg,
  },
  themeLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.heading,
    marginBottom: SPACING.sm,
  },
  themesRow: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  themeOption: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 72,
  },
  themeOptionSelected: {
    borderColor: COLORS.starGold,
    backgroundColor: COLORS.glassHighlight,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  themeName: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  themeNameSelected: {
    color: COLORS.starGold,
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  tips: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tipsTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tipEmoji: { fontSize: 20 },
  tipText: { color: COLORS.textSecondary, fontSize: 14, flex: 1 },
  bottomPad: { height: 20 },
});
