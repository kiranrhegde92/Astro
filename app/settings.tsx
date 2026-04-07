import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import i18n from '../src/i18n';
import { CosmicButton } from '../src/components/ui/CosmicButton';
import { GradientCard } from '../src/components/ui/GradientCard';
import { ScreenHeader } from '../src/components/ui/ScreenHeader';
import { StarField } from '../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../src/constants/theme';
import { useConnectionsStore } from '../src/store/connectionsStore';
import { useJournalStore } from '../src/store/journalStore';
import { useReadingStore } from '../src/store/readingStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese' },
  { code: 'kn', name: 'Kannada' },
];

const NOTIFICATION_TIMES = [
  { label: '6:00 am', value: '06:00' },
  { label: '7:00 am', value: '07:00' },
  { label: '8:00 am', value: '08:00' },
  { label: '9:00 am', value: '09:00' },
  { label: '10:00 am', value: '10:00' },
];

function PickerRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.84}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const clearReadings = useReadingStore((state) => state.clearReadings);
  const clearConnections = useConnectionsStore((state) => state.clearConnections);
  const clearJournal = useJournalStore((state) => state.clearJournal);
  const { language, notificationsEnabled, dailyNotificationTime, setLanguage, setNotifications, setNotificationTime } = useSettingsStore();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setShowLanguagePicker(false);
  };

  const clearProfileAndReturnToOnboarding = async () => {
    await Promise.all([clearUser(), clearReadings(), clearConnections(), clearJournal()]);
    router.dismissAll();
    router.replace('/(onboarding)/welcome');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'This app stores your profile locally. Logging out clears the saved chart on this device and returns you to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => void clearProfileAndReturnToOnboarding() },
      ]
    );
  };

  return (
    <StarField>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Shape the ritual around your routine.</Text>

        <GradientCard style={styles.section}>
          <Text style={styles.sectionLabel}>Language</Text>
          <PickerRow
            label="App language"
            value={LANGUAGES.find((item) => item.code === language)?.name ?? 'English'}
            onPress={() => setShowLanguagePicker((value) => !value)}
          />
          {showLanguagePicker ? (
            <View style={styles.inlineList}>
              {LANGUAGES.map((item) => (
                <TouchableOpacity key={item.code} onPress={() => handleLanguageChange(item.code)} style={styles.inlineItem} activeOpacity={0.84}>
                  <Text style={[styles.inlineText, item.code === language && styles.inlineTextActive]}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </GradientCard>

        <GradientCard style={styles.section}>
          <Text style={styles.sectionLabel}>Reminder</Text>
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
                onPress={() => setShowTimePicker((value) => !value)}
              />
              {showTimePicker ? (
                <View style={styles.inlineList}>
                  {NOTIFICATION_TIMES.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => {
                        setNotificationTime(item.value);
                        setShowTimePicker(false);
                      }}
                      style={styles.inlineItem}
                      activeOpacity={0.84}
                    >
                      <Text style={[styles.inlineText, item.value === dailyNotificationTime && styles.inlineTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </GradientCard>

        <GradientCard style={styles.section}>
          <Text style={styles.sectionLabel}>Profile snapshot</Text>
          <Text style={styles.metaLine}>Name - {user?.name ?? 'Unknown'}</Text>
          <Text style={styles.metaLine}>Plan - {user?.subscription.tier ?? 'free'}</Text>
          <Text style={styles.metaLine}>Active systems - {user?.activeSystems.length ?? 0}</Text>
          <Text style={styles.metaLine}>Cosmic points - {user?.cosmicPoints ?? 0}</Text>
        </GradientCard>

        <GradientCard style={styles.section} accentColor={COLORS.coral}>
          <Text style={styles.sectionLabel}>Session</Text>
          <Text style={styles.logoutCopy}>Logging out clears the local chart and takes you back to the beginning.</Text>
          <CosmicButton title="Log out" onPress={handleLogout} variant="outline" />
        </GradientCard>
      </ScrollView>
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
  metaLine: {
    color: COLORS.textPrimary,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  logoutCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
