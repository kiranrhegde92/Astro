import React, { useMemo, useState } from 'react';
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
import { searchAdminUsers } from '../../src/services/adminService';
import { useAuthStore } from '../../src/store/authStore';
import type { AdminUserListItem } from '../../src/types/admin';

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
  const subscriptionLabel = `${item.subscriptionTier} · ${item.subscriptionStatus}`;

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

  const ready = authReady && !profileLoading;
  const trimmedQuery = query.trim();
  const helperText = useMemo(
    () => 'Search by email, display name, or uid. Results stay behind callable admin functions.',
    [],
  );

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
        <Text style={styles.pageHeadline}>Search and inspect CosmicSelf accounts.</Text>

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
            <CosmicButton title="Refresh claims" onPress={handleRefreshClaims} variant="outline" disabled={loading} />
          </View>
        </GradientCard>

        {hasSearched ? (
          <View style={styles.resultsWrap}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Results</Text>
              <Text style={styles.resultsMeta}>{loading ? 'Searching…' : `${results.length} found`}</Text>
            </View>

            {results.length === 0 && !loading ? (
              <GradientCard style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No matching users</Text>
                <Text style={styles.body}>Try a broader email prefix, display name fragment, or exact uid.</Text>
              </GradientCard>
            ) : null}

            {results.map((item) => (
              <SearchResultCard
                key={item.uid}
                item={item}
                onPress={() => router.push({ pathname: '/admin/user/[uid]', params: { uid: item.uid } })}
              />
            ))}
          </View>
        ) : (
          <GradientCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Ready for lookup</Text>
            <Text style={styles.body}>Run a search to inspect a user profile, subscription state, charts, and admin actions.</Text>
          </GradientCard>
        )}
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
  actionStack: {
    gap: SPACING.sm,
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
