import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../src/components/web/WebShell';
import { SEOHead } from '../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../src/constants/theme';
import { FREE_FEATURES, PREMIUM_FEATURES, PRICING } from '../src/utils/pricingCopy';
import { APP_STORE_URL, PLAY_STORE_URL } from '../src/constants/storeLinks';

export default function PricingPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <WebShell>
      <SEOHead
        title="Pricing — CosmicSelf"
        description="Free forever includes the daily ritual. Premium removes limits and unlocks forecasts, compatibility, archive, alerts, and ad-free readings."
        canonical="https://cosmicself.app/pricing"
      />

      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.eyebrow}>PRICING</Text>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
          Free stays useful. Premium goes deeper.
        </Text>
        <Text style={[styles.heroBody, isWide && styles.heroBodyWide]}>
          Every day, CosmicSelf gives you a real reading — free. Premium is for when you want the
          full forecast, unlimited compatibility, full archive, and the richer profile timeline
          that shows where your year is actually heading.
        </Text>
      </View>

      <View style={[styles.plans, isWide && styles.plansWide]}>
        <PlanCard
          title="Free"
          kicker="THE DAILY RITUAL"
          price="$0"
          period="forever"
          detail="No account gate. No trial clock."
          borderColor="rgba(62,224,200,0.34)"
          accentColor={COLORS.tide}
          gradientImage="radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.16) 0%, rgba(23,24,45,0.62) 48%, rgba(18,16,38,0.78) 100%)"
          features={FREE_FEATURES.map((text) => ({ text }))}
          cta={null}
          isWide={isWide}
        />

        <PlanCard
          title="Premium"
          kicker="COSMICSELF+"
          price={PRICING.yearlyPrice}
          period="per year"
          detail={`${PRICING.monthlyPrice} monthly · ${PRICING.trialDays}-day free trial · Save ${PRICING.yearlySavings} yearly`}
          borderColor="rgba(241,183,79,0.42)"
          accentColor={COLORS.starGold}
          gradientImage="radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.18) 0%, rgba(23,24,45,0.62) 48%, rgba(18,16,38,0.78) 100%)"
          features={PREMIUM_FEATURES.map((f) => ({ emoji: f.emoji, text: f.text }))}
          cta="Start 7-day free trial"
          isWide={isWide}
          featured
        />
      </View>

      <View style={[styles.billingStrip, isWide && styles.billingStripWide]}>
        <Text style={styles.sectionKicker}>BILLING</Text>
        <Text style={[styles.billingTitle, !isWide && styles.billingTitleCompact]}>
          Straightforward, no tricks.
        </Text>
        <View style={styles.billingGrid}>
          {[
            ['Trial', 'Free for 7 days. Cancel before it ends and you pay nothing.'],
            ['Billing', 'Through App Store or Play Store. Renews automatically unless canceled.'],
            ['Cancel', 'One tap from your device store settings. Keep access through the paid period.'],
            ['Refunds', 'Handled by Apple or Google under their standard policies.'],
          ].map(([label, body]) => (
            <View key={label} style={styles.billingCard}>
              <Text style={styles.billingLabel}>{label}</Text>
              <Text style={styles.billingBody}>{body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.ctaBand, isWide && styles.ctaBandWide]}>
        <Text style={styles.sectionKicker}>GET IT</Text>
        <Text style={[styles.ctaTitle, !isWide && styles.ctaTitleCompact]}>
          Install free. Decide about Premium inside.
        </Text>
        <View style={styles.ctaRow}>
          <StoreButton label="Google Play" url={PLAY_STORE_URL} status="Download" />
          <StoreButton label="App Store" url={APP_STORE_URL} status="Coming soon" />
        </View>
      </View>
    </WebShell>
  );
}

function PlanCard(props: {
  title: string;
  kicker: string;
  price: string;
  period: string;
  detail: string;
  borderColor: string;
  accentColor: string;
  gradientImage: string;
  features: ReadonlyArray<{ emoji?: string; text: string }>;
  cta: string | null;
  isWide: boolean;
  featured?: boolean;
}) {
  const { title, kicker, price, period, detail, borderColor, accentColor, gradientImage, features, cta, isWide, featured } = props;
  return (
    <View
      style={[
        styles.planCard,
        isWide && styles.planCardWide,
        { borderColor },
        Platform.OS === 'web' && ({ backgroundImage: gradientImage } as any),
        featured && Platform.OS === 'web' && ({
          boxShadow:
            '0 32px 64px -28px rgba(241,183,79,0.35), inset 0 1px 0 rgba(255,248,242,0.08)' as any,
        } as any),
      ]}
    >
      <Text style={[styles.planKicker, { color: accentColor }]}>{kicker}</Text>
      <Text style={styles.planTitle}>{title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceNumber}>{price}</Text>
        <Text style={styles.pricePeriod}>{period}</Text>
      </View>
      <Text style={styles.planDetail}>{detail}</Text>

      <View style={styles.divider} />

      <View style={styles.featureList}>
        {features.map((f) => (
          <View key={f.text} style={styles.featureRow}>
            <Text style={[styles.featureMarker, { color: accentColor }]}>{f.emoji ?? '—'}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {cta ? (
        <View style={styles.planCtaWrap}>
          <Text style={styles.planCtaNote}>
            Purchases happen inside the mobile app through App Store or Play Store billing.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function StoreButton({ label, url, status }: { label: string; url: string; status: string }) {
  const isLive = status === 'Download';
  return (
    <Pressable
      onPress={() => { if (isLive) Linking.openURL(url); }}
      disabled={!isLive}
      style={(state) => {
        const { pressed } = state;
        const hovered = (state as { hovered?: boolean }).hovered;
        return [
          styles.storeBtn,
          !isLive && styles.storeBtnDisabled,
          hovered && isLive && styles.storeBtnHovered,
          pressed && isLive && styles.storeBtnPressed,
        ];
      }}
      accessibilityRole="link"
      accessibilityLabel={`${label} — ${status}`}
    >
      <Text style={styles.storeLabel}>{label}</Text>
      <Text style={[styles.storeStatus, !isLive && styles.storeStatusMuted]}>{status}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 72,
    paddingBottom: 56,
    paddingHorizontal: SPACING.lg,
  },
  heroWide: { paddingTop: 86, paddingBottom: 64, paddingHorizontal: SPACING.xl },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  heroTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1.8,
    maxWidth: 780,
    marginBottom: 22,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(120deg, #fff8f2 0%, #ffd9b8 42%, #12c8b2 78%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
        }
      : {}),
  },
  heroTitleCompact: { fontSize: 38, lineHeight: 42, letterSpacing: -1.2 },
  heroBody: {
    color: 'rgba(255,248,242,0.68)',
    fontFamily: FONTS.body,
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 680,
  },
  heroBodyWide: { fontSize: 20, lineHeight: 33 },

  plans: {
    gap: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 56,
  },
  plansWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 24,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 72,
  },

  planCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 32,
    gap: 4,
    ...SHADOWS.deep,
  },
  planCardWide: {
    flex: 1,
    padding: 36,
  },

  planKicker: {
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  planTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.2,
    marginTop: 6,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  priceNumber: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: -1.5,
  },
  pricePeriod: {
    color: 'rgba(255,248,242,0.56)',
    fontFamily: FONTS.body,
    fontSize: 15,
    paddingBottom: 8,
  },
  planDetail: {
    color: 'rgba(255,248,242,0.66)',
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,248,242,0.14)',
    marginVertical: 24,
  },

  featureList: { gap: 10 },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  featureMarker: {
    fontSize: 16,
    lineHeight: 24,
    minWidth: 22,
  },
  featureText: {
    flex: 1,
    color: 'rgba(255,248,242,0.78)',
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 24,
  },

  planCtaWrap: { marginTop: 24 },
  planCtaNote: {
    color: 'rgba(255,248,242,0.52)',
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 18,
  },

  billingStrip: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
    paddingBottom: 72,
  },
  billingStripWide: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 86,
  },
  sectionKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  billingTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.4,
    marginBottom: 28,
    maxWidth: 640,
  },
  billingTitleCompact: { fontSize: 32, lineHeight: 36, letterSpacing: -1 },

  billingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  billingCard: {
    flexGrow: 1,
    flexBasis: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.14)',
    backgroundColor: 'rgba(23,24,45,0.52)',
    padding: 20,
    gap: 8,
    ...(Platform.OS === 'web'
      ? {
          boxShadow:
            '0 12px 32px -16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,248,242,0.05)' as any,
        }
      : SHADOWS.card),
  },
  billingLabel: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  billingBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
  },

  ctaBand: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
    paddingBottom: 100,
  },
  ctaBandWide: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 120,
  },
  ctaTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.4,
    marginBottom: 28,
    maxWidth: 680,
  },
  ctaTitleCompact: { fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },

  storeBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.22)',
    backgroundColor: 'rgba(23,24,45,0.62)',
    paddingVertical: 16,
    paddingHorizontal: 22,
    minWidth: 200,
    gap: 2,
    ...(Platform.OS === 'web'
      ? ({
          transitionProperty: 'transform, box-shadow, border-color' as any,
          transitionDuration: '180ms' as any,
        } as any)
      : {}),
  },
  storeBtnHovered: {
    borderColor: 'rgba(241,183,79,0.6)',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 18px 42px -18px rgba(241,183,79,0.45)' as any, transform: [{ translateY: -2 }] } as any)
      : {}),
  },
  storeBtnPressed: { transform: [{ translateY: 0 }] },
  storeBtnDisabled: { opacity: 0.62 },

  storeLabel: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  storeStatus: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  storeStatusMuted: { color: 'rgba(255,248,242,0.52)' },
});
