import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { StarField } from '../src/components/ui/StarField';
import { useCosmicAlert } from '../src/components/ui/CosmicAlert';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../src/constants/theme';
import { exportMyData } from '../src/services/functionsService';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { shareDataExport } from '../src/utils/exportData';
import type { AstrologySystem } from '../src/types/user';

const NOTIFICATION_TIMES = [
  { label: '6:00 am', value: '06:00' },
  { label: '7:00 am', value: '07:00' },
  { label: '8:00 am', value: '08:00' },
  { label: '9:00 am', value: '09:00' },
  { label: '10:00 am', value: '10:00' },
];

const ALL_SYSTEMS: Array<{ value: AstrologySystem; label: string; color: string }> = [
  { value: 'western', label: 'Western', color: COLORS.western },
  { value: 'vedic', label: 'Vedic', color: COLORS.vedic },
  { value: 'chinese', label: 'Chinese', color: COLORS.chinese },
  { value: 'kp', label: 'KP', color: COLORS.kp },
];

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

function PickerRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.84}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    notificationsEnabled,
    dailyNotificationTime,
    transitAlertsEnabled,
    darkMode,
    setNotifications,
    setNotificationTime,
    setTransitAlerts,
    setDarkMode,
  } = useSettingsStore();
  const user = useUserStore((s) => s.user);
  const setActiveSystems = useUserStore((s) => s.setActiveSystems);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const refreshClaims = useAuthStore((s) => s.refreshClaims);
  const { showAlert, alertModal } = useCosmicAlert();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [accountAction, setAccountAction] = useState<'logout' | 'delete' | null>(null);
  const [exportingData, setExportingData] = useState(false);

  const toggleSystem = (system: AstrologySystem) => {
    if (!user) return;
    const current = user.activeSystems;
    if (current.includes(system)) {
      if (current.length <= 1) {
        showAlert('Cannot disable', 'You must have at least one astrology system active.');
        return;
      }
      setActiveSystems(current.filter((s) => s !== system));
    } else {
      setActiveSystems([...current, system]);
    }
  };

  const handleSignOut = () => {
    showAlert('Sign out?', 'You will return to the login screen, but your saved account data will remain available when you sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            setAccountAction('logout');
            await logout();
          } catch {
            showAlert('Unable to sign out', 'Please try again in a moment.');
          } finally {
            setAccountAction(null);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    showAlert(
      'Delete account?',
      'This permanently removes your CosmicSelf account, chart data, readings, journal, connections, and saved settings. This cannot be undone.',
      [
        { text: 'Keep account', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            try {
              setAccountAction('delete');
              await deleteAccount();
            } catch {
              showAlert('Unable to delete account', 'Your account was not removed. Please try again after signing in again.');
            } finally {
              setAccountAction(null);
            }
          },
        },
      ]
    );
  };

  const handleExportMyData = async () => {
    if (exportingData) return;

    setExportingData(true);
    try {
      const data = await exportMyData();
      const delivery = await shareDataExport(data);
      if (delivery === 'dismissed') return;

      const deliveryText = delivery === 'downloaded'
        ? 'Your JSON export was downloaded.'
        : 'Your JSON export was opened in the share sheet.';
      showAlert(
        'Export ready',
        `${deliveryText}\n\nProfile: ${data.counts.profile}\nChart: ${data.counts.chart}\nReadings: ${data.counts.dailyReadings}\nPartners: ${data.counts.partners}\nPrediction runs: ${data.counts.predictionRuns}`
      );
    } catch {
      showAlert('Export failed', 'Could not export your data right now. Please try again after signing in again.');
    } finally {
      setExportingData(false);
    }
  };

  const handleAdminAccess = async () => {
    try {
      await refreshClaims();
      if (useAuthStore.getState().isAdmin) {
        router.push('/admin');
      } else {
        showAlert('Admin access unavailable', 'This account does not currently have the admin custom claim. Sign out and back in if the claim was just granted.');
      }
    } catch {
      showAlert('Admin access unavailable', 'Could not refresh your admin claims right now.');
    }
  };

  return (
    <StarField>
      <ScreenHeader title="Settings" />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Shape the ritual around your routine.</Text>

        {/* ── Notifications ──────────────────────────────────────────── */}
        <GradientCard style={styles.section}>
          <Text style={styles.sectionLabel}>Daily reminder</Text>
          <View style={styles.switchRow}>
            <Text style={styles.rowText}>Daily reading notification</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotifications}
              trackColor={{ false: 'rgba(40,49,73,0.16)', true: COLORS.sunOrange }}
              thumbColor="#fffaf1"
            />
          </View>
          {notificationsEnabled ? (
            <>
              <PickerRow
                label="Reminder time"
                value={NOTIFICATION_TIMES.find((item) => item.value === dailyNotificationTime)?.label ?? '8:00 am'}
                onPress={() => setShowTimePicker((v) => !v)}
              />
              {showTimePicker ? (
                <View style={styles.inlineList}>
                  {NOTIFICATION_TIMES.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => { setNotificationTime(item.value); setShowTimePicker(false); }}
                      style={styles.inlineItem}
                      activeOpacity={0.84}
                    >
                      <Text style={[styles.inlineText, item.value === dailyNotificationTime && styles.inlineTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.sectionNote}>Turn this on to receive your saved daily reading reminder.</Text>
          )}
        </GradientCard>

        <GradientCard style={styles.section} accentColor={COLORS.starGold}>
          <Text style={styles.sectionLabel}>Transit center</Text>
          <Text style={styles.sectionNote}>
            Track the strongest live aspects touching your chart today. Premium transit alerts use this preference for future push delivery.
          </Text>
          <View style={styles.switchRow}>
            <View style={styles.systemLabelRow}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.starGold} />
              <Text style={styles.rowText}>Premium transit alerts</Text>
            </View>
            <Switch
              value={transitAlertsEnabled}
              onValueChange={setTransitAlerts}
              trackColor={{ false: 'rgba(40,49,73,0.16)', true: COLORS.starGold }}
              thumbColor="#fffaf1"
            />
          </View>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/reading/transits')} activeOpacity={0.84}>
            <Ionicons name="planet-outline" size={18} color={COLORS.kp} />
            <Text style={styles.linkText}>Open transit center</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </GradientCard>

        {/* ── Active Systems ─────────────────────────────────────────── */}
        {user ? (
          <GradientCard style={styles.section}>
            <Text style={styles.sectionLabel}>Active astrology systems</Text>
            <Text style={styles.sectionNote}>Toggle which systems appear in your daily reading and compatibility checks.</Text>
            {ALL_SYSTEMS.map((system) => {
              const active = user.activeSystems.includes(system.value);
              return (
                <View key={system.value} style={styles.switchRow}>
                  <View style={styles.systemLabelRow}>
                    <View style={[styles.systemDot, { backgroundColor: system.color }]} />
                    <Text style={styles.rowText}>{system.label}</Text>
                  </View>
                  <Switch
                    value={active}
                    onValueChange={() => toggleSystem(system.value)}
                    trackColor={{ false: 'rgba(40,49,73,0.16)', true: system.color }}
                    thumbColor="#fffaf1"
                  />
                </View>
              );
            })}
          </GradientCard>
        ) : null}

        {/* ── Birth Details ──────────────────────────────────────────── */}
        {user ? (
          <GradientCard style={styles.section}>
            <Text style={styles.sectionLabel}>Birth details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {new Date(user.birthDetails.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            {user.birthDetails.time ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{user.birthDetails.time}</Text>
              </View>
            ) : null}
            {user.birthDetails.place?.name ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Place</Text>
                <Text style={styles.detailValue}>{user.birthDetails.place.name}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/profile/birth-details')} activeOpacity={0.84}>
              <Ionicons name="mail-outline" size={18} color={COLORS.iris} />
              <Text style={styles.linkText}>Request a birth detail correction</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <Text style={styles.sectionNote}>Birth details are locked after setup. Send a correction request if something is wrong.</Text>
          </GradientCard>
        ) : null}

        {/* ── Appearance ───────────────────────────────────────────── */}
        <GradientCard style={styles.section}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.switchRow}>
            <View style={styles.systemLabelRow}>
              <Ionicons name={darkMode ? 'moon' : 'sunny-outline'} size={16} color={darkMode ? COLORS.iris : COLORS.starGold} />
              <Text style={styles.rowText}>{darkMode ? 'Dark mode' : 'Light mode'}</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: 'rgba(40,49,73,0.16)', true: COLORS.iris }}
              thumbColor="#fffaf1"
            />
          </View>
        </GradientCard>

        {/* ── Quick links ────────────────────────────────────────────── */}
        <GradientCard style={styles.section}>
          <Text style={styles.sectionLabel}>More</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/journal')} activeOpacity={0.84}>
            <Ionicons name="book-outline" size={18} color={COLORS.iris} />
            <Text style={styles.linkText}>Journal</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/subscription')} activeOpacity={0.84}>
            <Ionicons name="star-outline" size={18} color={COLORS.starGold} />
            <Text style={styles.linkText}>Subscription</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/legal/privacy')} activeOpacity={0.84}>
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.tide} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          {isAdmin ? (
            <TouchableOpacity style={styles.linkRow} onPress={() => void handleAdminAccess()} activeOpacity={0.84}>
              <Ionicons name="settings-outline" size={18} color={COLORS.starGold} />
              <Text style={styles.linkText}>Admin console</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.linkRowNoBorder} onPress={() => router.push('/legal/terms')} activeOpacity={0.84}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.plum} />
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </GradientCard>

        {/* ── Account ─────────────────────────────────────────────────── */}
        {user ? (
          <GradientCard style={styles.section} accentColor={COLORS.coral}>
            <Text style={styles.sectionLabel}>Account</Text>
            <Text style={styles.sectionNote}>Control access to this device and remove your account if you ever need a clean reset.</Text>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleExportMyData}
              activeOpacity={0.84}
              disabled={exportingData || accountAction !== null}
            >
              <Ionicons name="download-outline" size={18} color={COLORS.tide} />
              <Text style={styles.linkText}>{exportingData ? 'Exporting data...' : 'Export my data'}</Text>
              {exportingData ? <ActivityIndicator size="small" color={COLORS.tide} /> : <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleSignOut}
              activeOpacity={0.84}
              disabled={accountAction !== null || exportingData}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.iris} />
              <Text style={styles.linkText}>Sign out</Text>
              {accountAction === 'logout' ? <ActivityIndicator size="small" color={COLORS.iris} /> : <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkRowNoBorder}
              onPress={handleDeleteAccount}
              activeOpacity={0.84}
              disabled={accountAction !== null || exportingData}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.coral} />
              <Text style={[styles.linkText, styles.destructiveText]}>Delete account</Text>
              {accountAction === 'delete' ? <ActivityIndicator size="small" color={COLORS.coral} /> : <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
            </TouchableOpacity>
          </GradientCard>
        ) : null}

        {/* ── App Info ────────────────────────────────────────────────── */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>CosmicSelf v{APP_VERSION}</Text>
          <Text style={styles.appCopy}>4 ancient systems, one daily ritual.</Text>
        </View>

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
    gap: SPACING.lg,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: FONTS.display,
    letterSpacing: -0.6,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  sectionNote: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 6,
  },
  rowText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  rowValue: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  inlineList: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  inlineItem: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  inlineText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  inlineTextActive: {
    color: COLORS.textPrimary,
  },
  systemLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  systemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.accent,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.heading,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  linkRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
  },
  linkText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  destructiveText: {
    color: COLORS.coral,
  },
  appInfo: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.md,
  },
  appVersion: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  appCopy: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  bottomPad: {
    height: 20,
  },
});
