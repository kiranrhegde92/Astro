import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { QRCodeCard } from '../../src/components/share/QRCodeCard';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { getCosmicDNASummary } from '../../src/engines/unified';
import { captureAndShare } from '../../src/utils/shareUtils';
import { QR_THEMES, getQRThemeColors } from '../../src/utils/qrCodeUtils';
import type { QRThemeName } from '../../src/utils/qrCodeUtils';
import type { SharedProfilePayload } from '../../src/types/appData';

export default function MyQRCodeScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const viewShotRef = useRef<ViewShot>(null);
  const [selectedTheme, setSelectedTheme] = useState<QRThemeName>('Cosmic Night');

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
        currentDasha: user.vedic.currentDasha,
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

  const handleShare = () => {
    captureAndShare(viewShotRef, 'Scan my Cosmic DNA!');
  };

  return (
    <StarField>
      <ScreenHeader title="My cosmic QR" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Share your QR code and let others discover your Cosmic DNA instantly
        </Text>

        {/* QR Card */}
        <View style={styles.cardWrapper}>
          <QRCodeCard
            userName={user.name}
            cosmicDNA={cosmicDNA}
            sunSign={user.western.sun}
            rashi={user.vedic.rashi}
            animal={user.chinese.animal}
            profilePayload={profilePayload}
            gradientColors={getQRThemeColors(selectedTheme)}
            viewShotRef={viewShotRef}
          />
        </View>

        {/* Theme Picker */}
        <Text style={styles.themeLabel}>Choose Your Theme</Text>
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
      </ScrollView>
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
  },
  cardWrapper: {
    alignItems: 'center',
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
  },
  themeOptionSelected: {
    borderColor: COLORS.starGold,
    backgroundColor: 'rgba(255,255,255,0.68)',
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
    backgroundColor: 'rgba(255,255,255,0.68)',
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
