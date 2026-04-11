import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ResetScrollView } from '../src/components/ui/ResetScrollView';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { StarField } from '../src/components/ui/StarField';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useSettingsStore } from '../src/store/settingsStore';

const NOTIFICATION_TIMES = [
  { label: '6:00 am', value: '06:00' },
  { label: '7:00 am', value: '07:00' },
  { label: '8:00 am', value: '08:00' },
  { label: '9:00 am', value: '09:00' },
  { label: '10:00 am', value: '10:00' },
];

function PickerRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.84}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { notificationsEnabled, dailyNotificationTime, setNotifications, setNotificationTime } = useSettingsStore();
  const [showTimePicker, setShowTimePicker] = useState(false);

  return (
    <StarField>
      <ScreenHeader title="Settings" />
      <ResetScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Shape the ritual around your routine.</Text>

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
      </ResetScrollView>
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
});
