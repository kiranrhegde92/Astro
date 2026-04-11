import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import { StarField } from '../../src/components/ui/StarField';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { ShareableCard, DailyVibeCard } from '../../src/components/share/ShareableCard';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../src/constants/theme';
import { useActiveProfile } from '../../src/hooks/useActiveProfile';
import { showRewardedAd } from '../../src/services/rewardedAds';
import { useAdUnlockStore } from '../../src/store/adUnlockStore';
import { useUserStore } from '../../src/store/userStore';
import { captureAndShare } from '../../src/utils/shareUtils';
import { getDailyAffirmation, getDailyOpener } from '../../src/content/positiveFraming';
import { hasPremiumEntitlement } from '../../src/utils/subscription';

type CardType = 'cosmic-dna' | 'daily-vibe';

export default function ShareCardScreen() {
  const router = useRouter();
  const accountUser = useUserStore((s) => s.user);
  const user = useActiveProfile();
  const tokens = useAdUnlockStore((s) => s.tokens);
  const grantUnlock = useAdUnlockStore((s) => s.grantUnlock);
  const consumeUnlock = useAdUnlockStore((s) => s.consumeUnlock);
  const viewShotRef = useRef<ViewShot>(null);
  const [activeTab, setActiveTab] = useState<CardType>('cosmic-dna');
  const [premiumCardUnlocked, setPremiumCardUnlocked] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const { showAlert, alertModal } = useCosmicAlert();

  if (!user?.western || !user?.vedic || !user?.chinese) return null;

  const today = new Date();
  const profile = {
    western: user.western,
    vedic: user.vedic,
    chinese: user.chinese,
    kp: user.kp,
  };
  const hasPremiumShareUnlock = tokens.some((token) => token.feature === 'premium_share_card' && !token.consumedAt);
  const canShareWithoutWatermark = hasPremiumEntitlement(accountUser?.subscription) || premiumCardUnlocked;

  const handleShare = () => {
    captureAndShare(viewShotRef, 'Check out my Cosmic DNA!');
  };

  const handleUsePremiumCardUnlock = async () => {
    const consumed = await consumeUnlock('premium_share_card');
    if (consumed) setPremiumCardUnlocked(true);
  };

  const handleWatchAd = async () => {
    if (adLoading) return;
    setAdLoading(true);
    try {
      const earned = await showRewardedAd('premium_share_card');
      if (!earned) {
        showAlert('Ad not completed', 'The premium card was not unlocked. Try again when a rewarded ad is available.');
        return;
      }
      await grantUnlock('premium_share_card');
      await consumeUnlock('premium_share_card');
      setPremiumCardUnlocked(true);
    } finally {
      setAdLoading(false);
    }
  };

  return (
    <StarField>
      <ScreenHeader title="Share your stars" />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
              showWatermark={!canShareWithoutWatermark}
            />
          ) : (
            <DailyVibeCard
              userName={user.name}
              sunSign={user.western.sun}
              vibe={getDailyOpener(today)}
              affirmation={getDailyAffirmation(today)}
              date={today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              viewShotRef={viewShotRef}
              showWatermark={!canShareWithoutWatermark}
            />
          )}
        </View>

        {!canShareWithoutWatermark ? (
          <View style={styles.premiumActions}>
            <CosmicButton
              title={hasPremiumShareUnlock ? 'Use no-watermark unlock' : adLoading ? 'Loading ad' : 'Watch ad to remove watermark'}
              onPress={hasPremiumShareUnlock ? () => void handleUsePremiumCardUnlock() : () => void handleWatchAd()}
              loading={adLoading}
            />
            <CosmicButton title="Go Premium for clean cards" onPress={() => router.push('/subscription')} variant="outline" />
          </View>
        ) : (
          <Text style={styles.premiumNote}>Premium card active for this export.</Text>
        )}

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
      </ResetScrollView>
      {alertModal}
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
  premiumActions: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  premiumNote: {
    color: COLORS.tide,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontFamily: FONTS.heading,
  },
  bottomPad: { height: 20 },
});
