import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { StarField } from '../../src/components/ui/StarField';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { ShareableCard, DailyVibeCard } from '../../src/components/share/ShareableCard';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { captureAndShare } from '../../src/utils/shareUtils';
import { getDailyAffirmation, getDailyOpener } from '../../src/content/positiveFraming';

type CardType = 'cosmic-dna' | 'daily-vibe';

export default function ShareCardScreen() {
  const user = useUserStore((s) => s.user);
  const viewShotRef = useRef<ViewShot>(null);
  const [activeTab, setActiveTab] = useState<CardType>('cosmic-dna');

  if (!user?.western || !user?.vedic || !user?.chinese) return null;

  const today = new Date();
  const profile = {
    western: user.western,
    vedic: user.vedic,
    chinese: user.chinese,
    kp: user.kp,
  };

  const handleShare = () => {
    captureAndShare(viewShotRef, 'Check out my Cosmic DNA!');
  };

  return (
    <StarField>
      <ScreenHeader title="Share your stars" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Create beautiful shareable cards for social media
        </Text>

        {/* Tab Selector */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cosmic-dna' && styles.tabActive]}
            onPress={() => setActiveTab('cosmic-dna')}
          >
            <View style={styles.tabInner}>
              <OrbIcon icon="sparkles" size={28} accentColor={COLORS.gold} secondaryColor="#fff4cf" active={activeTab === 'cosmic-dna'} />
              <Text style={[styles.tabText, activeTab === 'cosmic-dna' && styles.tabTextActive]}>
                Cosmic DNA
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'daily-vibe' && styles.tabActive]}
            onPress={() => setActiveTab('daily-vibe')}
          >
            <View style={styles.tabInner}>
              <OrbIcon icon="sunny" size={28} accentColor={COLORS.sunOrange} secondaryColor="#ffe9c7" active={activeTab === 'daily-vibe'} />
              <Text style={[styles.tabText, activeTab === 'daily-vibe' && styles.tabTextActive]}>
                Daily Vibe
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Card Preview */}
        <View style={styles.cardWrapper}>
          {activeTab === 'cosmic-dna' ? (
            <ShareableCard
              userName={user.name}
              profile={profile}
              type="cosmic-dna"
              viewShotRef={viewShotRef}
            />
          ) : (
            <DailyVibeCard
              userName={user.name}
              sunSign={user.western.sun}
              vibe={getDailyOpener(today)}
              affirmation={getDailyAffirmation(today)}
              date={today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              viewShotRef={viewShotRef}
            />
          )}
        </View>

        {/* Share Button */}
        <CosmicButton
          title="Share to Social Media"
          onPress={handleShare}
          colors={[COLORS.starGold, COLORS.sunOrange]}
        />

        <Text style={styles.shareHint}>
          Perfect for Instagram Stories, TikTok, WhatsApp, and more!
        </Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.bgMuted,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.heading,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  shareHint: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  bottomPad: { height: 20 },
});
