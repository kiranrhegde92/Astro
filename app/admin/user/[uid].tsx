import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GradientCard } from '../../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../../../src/components/ui/ScreenHeader';
import { StarField } from '../../../src/components/ui/StarField';
import { CosmicButton } from '../../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../../src/components/ui/CosmicAlert';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../../src/constants/theme';
import {
  clearAdminUserPushToken,
  getAdminUserDetail,
  setAdminUserDisabled,
  updateAdminUserSubscription,
} from '../../../src/services/adminService';
import { useAuthStore } from '../../../src/store/authStore';
import type {
  AdminBillingPeriod,
  AdminSubscriptionPatch,
  AdminUserDetail,
} from '../../../src/types/admin';

function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const toneStyle =
    tone === 'success'
      ? styles.badgeSuccess
      : tone === 'warning'
        ? styles.badgeWarning
        : tone === 'danger'
          ? styles.badgeDanger
          : styles.badgeDefault;

  return (
    <View style={[styles.badge, toneStyle]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleChip, active && styles.toggleChipActive]}>
      <Text style={[styles.toggleChipText, active && styles.toggleChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export default function AdminUserDetailScreen() {
  const params = useLocalSearchParams<{ uid?: string | string[] }>();
  const router = useRouter();
  const authReady = useAuthStore((s) => s.authReady);
  const profileLoading = useAuthStore((s) => s.profileLoading);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const refreshClaims = useAuthStore((s) => s.refreshClaims);
  const { showAlert, alertModal } = useCosmicAlert();

  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid;
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'refresh' | 'push' | 'disable' | 'subscription' | null>(null);
  const [showRawProfile, setShowRawProfile] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState<AdminSubscriptionPatch>({
    tier: 'free',
    status: 'expired',
  });

  const ready = authReady && !profileLoading;

  const syncForm = useCallback((nextDetail: AdminUserDetail) => {
    setSubscriptionForm({
      tier: nextDetail.subscriptionTier === 'premium' ? 'premium' : 'free',
      status:
        nextDetail.subscriptionStatus === 'active' ||
        nextDetail.subscriptionStatus === 'expired' ||
        nextDetail.subscriptionStatus === 'trial'
          ? nextDetail.subscriptionStatus
          : 'expired',
      billingPeriod: (nextDetail.rawProfile?.subscription as any)?.billingPeriod as AdminBillingPeriod | undefined,
      productId: typeof (nextDetail.rawProfile?.subscription as any)?.productId === 'string'
        ? (nextDetail.rawProfile?.subscription as any)?.productId
        : '',
    });
  }, []);

  const loadDetail = useCallback(async () => {
    if (!uid) return;

    try {
      setLoading(true);
      const nextDetail = await getAdminUserDetail(uid);
      setDetail(nextDetail);
      syncForm(nextDetail);
    } catch (error: any) {
      const message = typeof error?.message === 'string'
        ? error.message
        : 'Could not load the selected user.';
      showAlert('Load failed', message);
    } finally {
      setLoading(false);
    }
  }, [showAlert, syncForm, uid]);

  useEffect(() => {
    if (ready && firebaseUser && isAdmin && uid) {
      void loadDetail();
    }
  }, [firebaseUser, isAdmin, loadDetail, ready, uid]);

  const chartBadges = useMemo(() => {
    if (!detail) return [];
    return [
      { label: 'Western', active: detail.chartSummary.hasWestern },
      { label: 'Vedic', active: detail.chartSummary.hasVedic },
      { label: 'Chinese', active: detail.chartSummary.hasChinese },
      { label: 'KP', active: detail.chartSummary.hasKP },
    ];
  }, [detail]);

  const ensureAdmin = async () => {
    await refreshClaims();
  };

  const runAction = async (
    kind: 'refresh' | 'push' | 'disable' | 'subscription',
    action: () => Promise<void>,
  ) => {
    try {
      setActionLoading(kind);
      await action();
    } catch (error: any) {
      const message = typeof error?.message === 'string'
        ? error.message
        : 'Admin action failed.';
      showAlert('Action failed', message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSubscription = async () => {
    if (!uid) return;

    await runAction('subscription', async () => {
      await updateAdminUserSubscription(uid, {
        ...subscriptionForm,
        productId: subscriptionForm.productId?.trim() || undefined,
      });
      await loadDetail();
      showAlert('Subscription updated', 'The user subscription fields were updated.');
    });
  };

  const handleClearPush = async () => {
    if (!uid) return;

    await runAction('push', async () => {
      await clearAdminUserPushToken(uid);
      await loadDetail();
      showAlert('Push token cleared', 'Stored FCM token fields were removed for this user.');
    });
  };

  const handleToggleDisabled = async () => {
    if (!uid || !detail) return;

    await runAction('disable', async () => {
      await setAdminUserDisabled(uid, !detail.disabled);
      await loadDetail();
      showAlert(detail.disabled ? 'Account enabled' : 'Account disabled', 'The admin flag was updated successfully.');
    });
  };

  if (!ready) {
    return (
      <StarField>
        <ScreenHeader title="User detail" />
        <View style={styles.centerState}>
          <ActivityIndicator color={COLORS.iris} />
          <Text style={styles.stateTitle}>Loading access</Text>
          <Text style={styles.stateBody}>Checking admin claim state for this route.</Text>
        </View>
        {alertModal}
      </StarField>
    );
  }

  if (!firebaseUser) {
    return (
      <StarField>
        <ScreenHeader title="User detail" />
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Sign in required</Text>
          <Text style={styles.stateBody}>This admin route requires an authenticated staff session.</Text>
        </View>
        {alertModal}
      </StarField>
    );
  }

  if (!isAdmin) {
    return (
      <StarField>
        <ScreenHeader title="User detail" />
        <ResetScrollView contentContainerStyle={styles.container}>
          <GradientCard style={styles.section} accentColor={COLORS.coral}>
            <Text style={styles.sectionLabel}>Access denied</Text>
            <Text style={styles.sectionTitle}>Your account does not have admin access.</Text>
            <Text style={styles.body}>Refresh claims if your admin role was just granted, or return to the main app.</Text>
            <View style={styles.buttonStack}>
              <CosmicButton
                title="Refresh claims"
                onPress={() => void ensureAdmin()}
              />
              <CosmicButton title="Back to admin search" onPress={() => router.replace('/admin')} variant="outline" />
            </View>
          </GradientCard>
        </ResetScrollView>
        {alertModal}
      </StarField>
    );
  }

  if (!uid) {
    return (
      <StarField>
        <ScreenHeader title="User detail" />
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Missing user id</Text>
          <Text style={styles.stateBody}>Open this screen from admin search so a user uid is provided.</Text>
        </View>
        {alertModal}
      </StarField>
    );
  }

  return (
    <StarField>
      <ScreenHeader
        title={detail?.name ? `${detail.name}` : 'User detail'}
        rightSlot={
          <Pressable onPress={() => void loadDetail()} style={styles.iconButton}>
            {loading || actionLoading === 'refresh'
              ? <ActivityIndicator size="small" color={COLORS.iris} />
              : <Ionicons name="refresh" size={16} color={COLORS.textPrimary} />}
          </Pressable>
        }
      />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading && !detail ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={COLORS.iris} />
            <Text style={styles.stateTitle}>Loading user snapshot</Text>
          </View>
        ) : null}

        {detail ? (
          <>
            <GradientCard style={styles.section} accentColor={detail.disabled ? COLORS.coral : COLORS.iris}>
              <Text style={styles.sectionLabel}>Profile</Text>
              <Text style={styles.sectionTitle}>{detail.name || 'Unnamed user'}</Text>
              <Text style={styles.email}>{detail.email ?? 'No email on file'}</Text>
              <Text style={styles.uid}>{detail.uid}</Text>
              <View style={styles.badgeRow}>
                <Badge label={`${detail.subscriptionTier} · ${detail.subscriptionStatus}`} tone={detail.subscriptionTier === 'premium' ? 'success' : 'default'} />
                <Badge label={detail.disabled ? 'Disabled' : 'Enabled'} tone={detail.disabled ? 'danger' : 'success'} />
                <Badge label={detail.onboardingComplete ? 'Onboarded' : 'Onboarding'} tone={detail.onboardingComplete ? 'success' : 'warning'} />
                <Badge label={detail.hasFcmToken ? 'Push token stored' : 'No push token'} tone={detail.hasFcmToken ? 'success' : 'warning'} />
              </View>
            </GradientCard>

            <GradientCard style={styles.section} accentColor={COLORS.kp}>
              <Text style={styles.sectionLabel}>State snapshot</Text>
              <StatRow label="Language" value={detail.language || '—'} />
              <StatRow label="Created" value={formatDate(detail.createdAt)} />
              <StatRow label="Updated" value={formatDate(detail.updatedAt)} />
              <StatRow label="Last check-in" value={formatDate(detail.lastCheckIn)} />
              <StatRow label="Birth place" value={detail.birthPlaceName || '—'} />
              <StatRow label="Cosmic points" value={String(detail.cosmicPoints ?? 0)} />
              <StatRow label="Streak" value={String(detail.streak ?? 0)} />
              <StatRow label="Active systems" value={detail.activeSystems.length ? detail.activeSystems.join(', ') : '—'} />
            </GradientCard>

            <GradientCard style={styles.section} accentColor={COLORS.starGold}>
              <Text style={styles.sectionLabel}>Chart + usage</Text>
              <View style={styles.badgeRow}>
                {chartBadges.map((item) => (
                  <Badge key={item.label} label={item.label} tone={item.active ? 'success' : 'warning'} />
                ))}
              </View>
              <StatRow label="Daily readings" value={String(detail.counts.dailyReadings)} />
              <StatRow label="Prediction runs" value={String(detail.counts.predictionRuns)} />
              <StatRow label="Connections" value={String(detail.counts.connections)} />
            </GradientCard>

            <GradientCard style={styles.section} accentColor={COLORS.vedic}>
              <Text style={styles.sectionLabel}>Admin actions</Text>
              <View style={styles.buttonStack}>
                <CosmicButton
                  title="Refresh snapshot"
                  onPress={() => void runAction('refresh', loadDetail)}
                  loading={actionLoading === 'refresh'}
                />
                <CosmicButton
                  title={detail.hasFcmToken ? 'Clear push token' : 'Push token already clear'}
                  onPress={() => void handleClearPush()}
                  variant="secondary"
                  loading={actionLoading === 'push'}
                  disabled={!detail.hasFcmToken || actionLoading !== null}
                />
                <CosmicButton
                  title={detail.disabled ? 'Enable account' : 'Disable account'}
                  onPress={() => void handleToggleDisabled()}
                  variant="outline"
                  loading={actionLoading === 'disable'}
                  disabled={actionLoading !== null}
                />
              </View>
            </GradientCard>

            <GradientCard style={styles.section} accentColor={COLORS.iris}>
              <Text style={styles.sectionLabel}>Edit subscription</Text>
              <Text style={styles.body}>Update tier and status manually when support needs to correct a user account.</Text>

              <Text style={styles.fieldLabel}>Tier</Text>
              <View style={styles.toggleRow}>
                <ToggleChip
                  label="Free"
                  active={subscriptionForm.tier === 'free'}
                  onPress={() => setSubscriptionForm((current) => ({ ...current, tier: 'free' }))}
                />
                <ToggleChip
                  label="Premium"
                  active={subscriptionForm.tier === 'premium'}
                  onPress={() => setSubscriptionForm((current) => ({ ...current, tier: 'premium' }))}
                />
              </View>

              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.toggleRow}>
                {(['active', 'trial', 'expired'] as const).map((status) => (
                  <ToggleChip
                    key={status}
                    label={status}
                    active={subscriptionForm.status === status}
                    onPress={() => setSubscriptionForm((current) => ({ ...current, status }))}
                  />
                ))}
              </View>

              <Text style={styles.fieldLabel}>Billing period</Text>
              <View style={styles.toggleRow}>
                <ToggleChip
                  label="Unset"
                  active={!subscriptionForm.billingPeriod}
                  onPress={() => setSubscriptionForm((current) => ({ ...current, billingPeriod: undefined }))}
                />
                <ToggleChip
                  label="Monthly"
                  active={subscriptionForm.billingPeriod === 'monthly'}
                  onPress={() => setSubscriptionForm((current) => ({ ...current, billingPeriod: 'monthly' }))}
                />
                <ToggleChip
                  label="Yearly"
                  active={subscriptionForm.billingPeriod === 'yearly'}
                  onPress={() => setSubscriptionForm((current) => ({ ...current, billingPeriod: 'yearly' }))}
                />
              </View>

              <Text style={styles.fieldLabel}>Product id</Text>
              <TextInput
                value={subscriptionForm.productId ?? ''}
                onChangeText={(productId) => setSubscriptionForm((current) => ({ ...current, productId }))}
                placeholder="Optional product id"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <CosmicButton
                title="Save subscription"
                onPress={() => void handleSaveSubscription()}
                loading={actionLoading === 'subscription'}
                disabled={actionLoading !== null && actionLoading !== 'subscription'}
              />
            </GradientCard>

            <GradientCard style={styles.section} accentColor={COLORS.plum}>
              <Pressable onPress={() => setShowRawProfile((current) => !current)} style={styles.expandHeader}>
                <View style={styles.expandHeaderCopy}>
                  <Text style={styles.sectionLabel}>Raw profile</Text>
                  <Text style={styles.body}>Collapsed by default. FCM token fields stay hidden server-side.</Text>
                </View>
                <Ionicons
                  name={showRawProfile ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={COLORS.textPrimary}
                />
              </Pressable>
              {showRawProfile ? (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{JSON.stringify(detail.rawProfile, null, 2)}</Text>
                </View>
              ) : null}
            </GradientCard>
          </>
        ) : null}
      </ResetScrollView>
      {alertModal}
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  stateTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.heading,
    textAlign: 'center',
  },
  stateBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: FONTS.heading,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  uid: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  badgeDefault: {
    backgroundColor: 'rgba(115,103,255,0.08)',
    borderColor: 'rgba(115,103,255,0.20)',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(18,200,178,0.10)',
    borderColor: 'rgba(18,200,178,0.24)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(241,183,79,0.10)',
    borderColor: 'rgba(241,183,79,0.24)',
  },
  badgeDanger: {
    backgroundColor: 'rgba(255,94,126,0.10)',
    borderColor: 'rgba(255,94,126,0.24)',
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: FONTS.heading,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  rowLabel: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.accent,
  },
  rowValue: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    textAlign: 'right',
  },
  buttonStack: {
    gap: SPACING.sm,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  toggleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    backgroundColor: 'rgba(255,255,255,0.64)',
  },
  toggleChipActive: {
    backgroundColor: 'rgba(115,103,255,0.12)',
    borderColor: COLORS.iris,
  },
  toggleChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.heading,
    textTransform: 'capitalize',
  },
  toggleChipTextActive: {
    color: COLORS.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.76)',
    fontSize: 15,
  },
  expandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  expandHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  codeBlock: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.bgInkCard,
    padding: SPACING.md,
  },
  codeText: {
    color: COLORS.silver,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Courier',
  },
});
