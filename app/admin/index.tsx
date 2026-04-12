import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { ResetScrollView } from '../../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { StarField } from '../../src/components/ui/StarField';
import { CosmicButton } from '../../src/components/ui/CosmicButton';
import { useCosmicAlert } from '../../src/components/ui/CosmicAlert';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import {
  getAdminDashboardSummary,
  searchAdminUsers,
  sendAdminBroadcastNotification,
  updateAdminGlobalSettings,
} from '../../src/services/adminService';
import { useAuthStore } from '../../src/store/authStore';
import type { AdminBroadcastNotificationInput, AdminDashboardSummary, AdminUserListItem } from '../../src/types/admin';

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

function SearchResultCard({ item, onPress }: { item: AdminUserListItem; onPress: () => void }) {
  const subscriptionLabel = `${item.subscriptionTier} • ${item.subscriptionStatus}`;

  return (
    <Pressable onPress={onPress} style={styles.resultPressable}>
      <GradientCard style={styles.resultCard} accentColor={item.disabled ? COLORS.coral : COLORS.iris}>
        <View style={styles.resultHeader}>
          <View style={styles.resultHeaderCopy}>
            <Text style={styles.resultName}>{item.name || 'Unnamed user'}</Text>
            <Text style={styles.resultEmail}>{item.email ?? 'No email on file'}</Text>
            <Text style={styles.resultUid}>{item.uid}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </View>

        <View style={styles.badgeRow}>
          <Badge label={subscriptionLabel} tone={item.subscriptionTier === 'premium' ? 'success' : 'default'} />
          {item.disabled ? <Badge label="Disabled" tone="danger" /> : null}
          <Badge label={item.onboardingComplete ? 'Onboarded' : 'Onboarding'} tone={item.onboardingComplete ? 'success' : 'warning'} />
          <Badge label={item.chartCalculated ? 'Chart ready' : 'No chart'} tone={item.chartCalculated ? 'success' : 'warning'} />
        </View>
      </GradientCard>
    </Pressable>
  );
}

function StatCard({ label, value, tone = COLORS.iris }: { label: string; value: string | number; tone?: string }) {
  return (
    <View style={[styles.statCard, { borderColor: `${tone}55` }]}> 
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
    </View>
  );
}

export default function AdminIndexScreen() {
  const router = useRouter();
  const authReady = useAuthStore((s) => s.authReady);
  const profileLoading = useAuthStore((s) => s.profileLoading);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const refreshClaims = useAuthStore((s) => s.refreshClaims);
  const { showAlert, alertModal } = useCosmicAlert();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AdminUserListItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [supportEmail, setSupportEmail] = useState('admin@cosmicself.app');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastPushEnabled, setBroadcastPushEnabled] = useState(true);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<AdminBroadcastNotificationInput['target']>('all');

  const ready = authReady && !profileLoading;
  const trimmedQuery = query.trim();
  const helperText = useMemo(
    () => 'Search by email, display name, or uid. Leave the field blank to review recent users.',
    [],
  );

  const syncSummarySettings = (nextSummary: AdminDashboardSummary) => {
    setSupportEmail(nextSummary.settings.supportEmail);
    setMaintenanceMode(nextSummary.settings.maintenanceMode);
    setBroadcastPushEnabled(nextSummary.settings.broadcastPushEnabled);
  };

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const nextSummary = await getAdminDashboardSummary();
      setSummary(nextSummary);
      syncSummarySettings(nextSummary);
    } catch (error: any) {
      const message = typeof error?.message === 'string'
        ? error.message
        : 'Could not load admin dashboard metrics.';
      showAlert('Dashboard unavailable', message);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (ready && firebaseUser && isAdmin) {
      void loadSummary();
    }
  }, [ready, firebaseUser, isAdmin]);

  const handleRefreshClaims = async () => {
    try {
      setLoading(true);
      await refreshClaims();
    } catch {
      showAlert('Refresh failed', 'Could not refresh your Firebase custom claims right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      const response = await searchAdminUsers(trimmedQuery || undefined, 20);
      setResults(response.users ?? []);
    } catch (error: any) {
      const message = typeof error?.message === 'string'
        ? error.message
        : 'Could not load admin search results.';
      showAlert('Search failed', message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsSaving(true);
      const result = await updateAdminGlobalSettings({
        supportEmail,
        maintenanceMode,
        broadcastPushEnabled,
      });
      showAlert('Admin settings saved', result.message);
      await loadSummary();
    } catch (error: any) {
      const message = typeof error?.message === 'string'
        ? error.message
        : 'Could not save admin settings.';
      showAlert('Save failed', message);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleBroadcast = async (dryRun: boolean) => {
    try {
      setBroadcastLoading(true);
      const result = await sendAdminBroadcastNotification({
        title: broadcastTitle,
        body: broadcastBody,
        target: broadcastTarget,
        dryRun,
      });
      showAlert(dryRun ? 'Dry run complete' : 'Broadcast complete', result.message);
      await loadSummary();
    } catch (error: any) {
      const message = typeof error?.message === 'string'
        ? error.message
        : 'Could not send the admin broadcast.';
      showAlert('Broadcast failed', message);
    } finally {
      setBroadcastLoading(false);
    }
  };

  if (!ready) {
    return (
      <StarField>
        <ScreenHeader title="Admin" showBack={false} />
        <View style={styles.centerState}>
          <ActivityIndicator color={COLORS.iris} />
          <Text style={styles.stateTitle}>Loading admin claims</Text>
          <Text style={styles.stateBody}>Checking your signed-in session and permissions.</Text>
        </View>
        {alertModal}
      </StarField>
    );
  }

  if (!firebaseUser) {
    return (
      <StarField>
        <ScreenHeader title="Admin" showBack={false} />
        <View style={styles.centerState}>
          <Ionicons name="lock-closed-outline" size={28} color={COLORS.textMuted} />
          <Text style={styles.stateTitle}>Sign in required</Text>
          <Text style={styles.stateBody}>Admin tools are only available for authenticated staff accounts.</Text>
        </View>
        {alertModal}
      </StarField>
    );
  }

  if (!isAdmin) {
    return (
      <StarField>
        <ScreenHeader title="Admin console" />
        <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GradientCard style={styles.section} accentColor={COLORS.coral}>
            <Text style={styles.kicker}>Access denied</Text>
            <Text style={styles.title}>This account is not marked as admin.</Text>
            <Text style={styles.body}>
              If your claim was just granted, refresh claims and try again. Otherwise use a staff account with the admin custom claim.
            </Text>
            <View style={styles.actionStack}>
              <CosmicButton title="Refresh claims" onPress={handleRefreshClaims} loading={loading} />
              <CosmicButton title="Go to today" onPress={() => router.replace('/(tabs)/today')} variant="outline" />
            </View>
          </GradientCard>
        </ResetScrollView>
        {alertModal}
      </StarField>
    );
  }

  return (
    <StarField>
      <ScreenHeader title="Admin console" />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageHeadline}>Search users, review global admin settings, and manage push operations.</Text>

        <GradientCard style={styles.section} accentColor={COLORS.starGold}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Overview</Text>
            <Text style={styles.resultsMeta}>{summaryLoading ? 'Refreshing…' : 'Live admin summary'}</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard label="Users" value={summary?.totals.users ?? '—'} />
            <StatCard label="Premium" value={summary?.totals.premiumUsers ?? '—'} tone={COLORS.starGold} />
            <StatCard label="Push ready" value={summary?.totals.pushReadyUsers ?? '—'} tone={COLORS.tide} />
            <StatCard label="Disabled" value={summary?.totals.disabledUsers ?? '—'} tone={COLORS.coral} />
          </View>
        </GradientCard>

        <GradientCard style={styles.section} accentColor={COLORS.iris}>
          <Text style={styles.kicker}>User search</Text>
          <Text style={styles.body}>{helperText}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by email, name, or uid"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <View style={styles.actionStack}>
            <CosmicButton title="Search users" onPress={handleSearch} loading={loading} />
            <CosmicButton title="Refresh dashboard" onPress={() => void loadSummary()} variant="outline" disabled={loading || summaryLoading} />
          </View>
        </GradientCard>

        <GradientCard style={styles.section} accentColor={COLORS.plum}>
          <Text style={styles.kicker}>Global settings</Text>
          <Text style={styles.body}>Admin-only operational switches for the app and support workflow.</Text>
          <TextInput
            value={supportEmail}
            onChangeText={setSupportEmail}
            placeholder="Support email"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Maintenance mode</Text>
            <Pressable onPress={() => setMaintenanceMode((current) => !current)} style={[styles.toggleChip, maintenanceMode && styles.toggleChipActive]}>
              <Text style={[styles.toggleChipText, maintenanceMode && styles.toggleChipTextActive]}>{maintenanceMode ? 'On' : 'Off'}</Text>
            </Pressable>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Broadcast push enabled</Text>
            <Pressable onPress={() => setBroadcastPushEnabled((current) => !current)} style={[styles.toggleChip, broadcastPushEnabled && styles.toggleChipActive]}>
              <Text style={[styles.toggleChipText, broadcastPushEnabled && styles.toggleChipTextActive]}>{broadcastPushEnabled ? 'Enabled' : 'Disabled'}</Text>
            </Pressable>
          </View>
          <CosmicButton title="Save admin settings" onPress={handleSaveSettings} loading={settingsSaving} />
        </GradientCard>

        <GradientCard style={styles.section} accentColor={COLORS.tide}>
          <Text style={styles.kicker}>Push notifications</Text>
          <Text style={styles.body}>Send an admin broadcast to every registered device token or just premium users.</Text>
          <TextInput
            value={broadcastTitle}
            onChangeText={setBroadcastTitle}
            placeholder="Push title"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
          <TextInput
            value={broadcastBody}
            onChangeText={setBroadcastBody}
            placeholder="Push body"
            placeholderTextColor={COLORS.textMuted}
            style={[styles.input, styles.textArea]}
            multiline
          />
          <View style={styles.badgeRow}>
            <Pressable onPress={() => setBroadcastTarget('all')} style={[styles.toggleChip, broadcastTarget === 'all' && styles.toggleChipActive]}>
              <Text style={[styles.toggleChipText, broadcastTarget === 'all' && styles.toggleChipTextActive]}>All users</Text>
            </Pressable>
            <Pressable onPress={() => setBroadcastTarget('premium')} style={[styles.toggleChip, broadcastTarget === 'premium' && styles.toggleChipActive]}>
              <Text style={[styles.toggleChipText, broadcastTarget === 'premium' && styles.toggleChipTextActive]}>Premium only</Text>
            </Pressable>
          </View>
          <View style={styles.actionStack}>
            <CosmicButton title="Dry run" onPress={() => void handleBroadcast(true)} loading={broadcastLoading} />
            <CosmicButton title="Send broadcast" onPress={() => void handleBroadcast(false)} variant="outline" disabled={broadcastLoading} />
          </View>
          <Text style={styles.resultsMeta}>Last broadcast: {summary?.settings.latestBroadcastAt ? new Date(summary.settings.latestBroadcastAt).toLocaleString() : 'Never'}</Text>
        </GradientCard>

        <View style={styles.resultsWrap}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>{hasSearched ? 'Results' : 'Recent users'}</Text>
            <Text style={styles.resultsMeta}>{loading ? 'Searching…' : `${(hasSearched ? results : summary?.recentUsers ?? []).length} shown`}</Text>
          </View>

          {(hasSearched ? results : summary?.recentUsers ?? []).length === 0 && !loading ? (
            <GradientCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{hasSearched ? 'No matching users' : 'No recent users yet'}</Text>
              <Text style={styles.body}>{hasSearched ? 'Try a broader email prefix, display name fragment, or exact uid.' : 'Once users sign in and profiles exist, they will appear here.'}</Text>
            </GradientCard>
          ) : null}

          {(hasSearched ? results : summary?.recentUsers ?? []).map((item) => (
            <SearchResultCard
              key={item.uid}
              item={item}
              onPress={() => router.push({ pathname: '/admin/user/[uid]', params: { uid: item.uid } })}
            />
          ))}
        </View>
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
  pageHeadline: {
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: FONTS.display,
  },
  section: {
    gap: SPACING.sm,
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
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
  stateTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  stateBody: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
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
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  actionStack: {
    gap: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.68)',
    padding: SPACING.md,
    gap: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontFamily: FONTS.heading,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  toggleLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: FONTS.heading,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    backgroundColor: 'rgba(255,255,255,0.64)',
  },
  toggleChipActive: {
    backgroundColor: 'rgba(115,103,255,0.16)',
    borderColor: 'rgba(115,103,255,0.32)',
  },
  toggleChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.heading,
  },
  toggleChipTextActive: {
    color: COLORS.textPrimary,
  },
  resultsWrap: {
    gap: SPACING.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.heading,
  },
  resultsMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  resultPressable: {
    borderRadius: BORDER_RADIUS.xl,
  },
  resultCard: {
    gap: SPACING.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  resultEmail: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  resultUid: {
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
  emptyCard: {
    gap: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.heading,
  },
});
