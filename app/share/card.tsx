import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const caption = activeTab === 'daily-vibe'
      ? `Today's cosmic vibe, courtesy of my ${user.western?.sun ?? 'stars'} ✨`
      : 'Check out my Cosmic DNA ✨';
    captureAndShare(viewShotRef, caption);
  };

  const handleTabChange = (tab: CardType) => {
    Haptics.selectionAsync().catch(() => {});
    setActiveTab(tab);
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
        <Text style={styles.headline}>Send a postcard from the cosmos</Text>
        <Text style={styles.subtitle}>
          Pick a card, tap share, and drop some stardust on your feed.
        </Text>

        {/* Tab Selector */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.85}
            onPress={() => handleTabChange('cosmic-dna')}
          >
            {activeTab === 'cosmic-dna' ? (
              <LinearGradient
                colors={[`${COLORS.gold}44`, `${COLORS.gold}14`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={styles.tabInner}>
              <OrbIcon icon="sparkles" size={26} accentColor={COLORS.gold} secondaryColor="#fff4cf" active={activeTab === 'cosmic-dna'} />
              <Text style={[styles.tabText, activeTab === 'cosmic-dna' && styles.tabTextActive]}>
                Cosmic DNA
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            activeOpacity={0.85}
            onPress={() => handleTabChange('daily-vibe')}
          >
            {activeTab === 'daily-vibe' ? (
              <LinearGradient
                colors={[`${COLORS.sunOrange}44`, `${COLORS.sunOrange}14`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={styles.tabInner}>
              <OrbIcon icon="sunny" size={26} accentColor={COLORS.sunOrange} secondaryColor="#ffe9c7" active={activeTab === 'daily-vibe'} />
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
          title="Send it to the world"
          onPress={handleShare}
          colors={[COLORS.starGold, COLORS.sunOrange]}
        />

        <Text style={styles.shareHint}>
          Built for Instagram, TikTok, WhatsApp — anywhere your people hang out.
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
  headline: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.display,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,18,34,0.55)',
    borderRadius: BORDER_RADIUS.lg,
    padding: 5,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabInner: {
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.heading,
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  shareHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    lineHeight: 17,
    fontStyle: 'italic',
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
