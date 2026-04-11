import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { StarField } from '../src/components/ui/StarField';
import { useCosmicAlert } from '../src/components/ui/CosmicAlert';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
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
  const { notificationsEnabled, dailyNotificationTime, setNotifications, setNotificationTime } = useSettingsStore();
  const user = useUserStore((s) => s.user);
  const setActiveSystems = useUserStore((s) => s.setActiveSystems);
  const { showAlert, alertModal } = useCosmicAlert();
  const [showTimePicker, setShowTimePicker] = useState(false);

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
          ) : null}
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
              <Ionicons name="create-outline" size={18} color={COLORS.iris} />
              <Text style={styles.linkText}>Edit birth details</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </GradientCard>
        ) : null}

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
        </GradientCard>

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
  linkText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.heading,
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
