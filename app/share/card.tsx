import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { ShareableCard, DailyVibeCard } from '../../src/components/share/ShareableCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
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
      <ScreenHeader title="Share Your Stars" />
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
            <Text style={[styles.tabText, activeTab === 'cosmic-dna' && styles.tabTextActive]}>
              {'\u2728'} Cosmic DNA
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'daily-vibe' && styles.tabActive]}
            onPress={() => setActiveTab('daily-vibe')}
          >
            <Text style={[styles.tabText, activeTab === 'daily-vibe' && styles.tabTextActive]}>
              {'\u2B50'} Daily Vibe
            </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.violet,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.white,
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
