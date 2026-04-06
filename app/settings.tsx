import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '../src/i18n';
import { StarField } from '../src/components/ui/StarField';
import { GlowText } from '../src/components/ui/GlowText';
import { GradientCard } from '../src/components/ui/GradientCard';
import { CosmicButton } from '../src/components/ui/CosmicButton';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', emoji: '\u{1F1FA}\u{1F1F8}' },
  { code: 'hi', name: 'Hindi', native: '\u0939\u093F\u0928\u094D\u0926\u0940', emoji: '\u{1F1EE}\u{1F1F3}' },
  { code: 'zh', name: 'Chinese', native: '\u4E2D\u6587', emoji: '\u{1F1E8}\u{1F1F3}' },
];

const NOTIFICATION_TIMES = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const {
    language,
    notificationsEnabled,
    dailyNotificationTime,
    setLanguage,
    setNotifications,
    setNotificationTime,
  } = useSettingsStore();

  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setShowLangPicker(false);
  };

  const handleClearData = () => {
    Alert.alert(
      'Reset App Data',
      'This will clear all your data and return to onboarding. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            useUserStore.getState().clearUser();
            router.replace('/');
          },
        },
      ]
    );
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <GlowText size="xl" align="center">
          Settings
        </GlowText>

        {/* Language */}
        <GradientCard>
          <Text style={styles.sectionTitle}>{'\u{1F30D}'} Language</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowLangPicker(!showLangPicker)}
          >
            <Text style={styles.settingLabel}>App Language</Text>
            <Text style={styles.settingValue}>
              {currentLang.emoji} {currentLang.native}
            </Text>
          </TouchableOpacity>

          {showLangPicker && (
            <View style={styles.pickerContainer}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    language === lang.code && styles.pickerItemActive,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={styles.pickerEmoji}>{lang.emoji}</Text>
                  <View style={styles.pickerTextCol}>
                    <Text style={[
                      styles.pickerName,
                      language === lang.code && styles.pickerNameActive,
                    ]}>{lang.native}</Text>
                    <Text style={styles.pickerNameSub}>{lang.name}</Text>
                  </View>
                  {language === lang.code && (
                    <Text style={styles.checkmark}>{'\u2713'}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GradientCard>

        {/* Notifications */}
        <GradientCard>
          <Text style={styles.sectionTitle}>{'\u{1F514}'} Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Daily Cosmic Vibe</Text>
              <Text style={styles.settingDesc}>Get your morning cosmic reading</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotifications}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.starGold }}
              thumbColor={COLORS.white}
            />
          </View>

          {notificationsEnabled && (
            <>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowTimePicker(!showTimePicker)}
              >
                <Text style={styles.settingLabel}>Notification Time</Text>
                <Text style={styles.settingValue}>
                  {NOTIFICATION_TIMES.find((t) => t.value === dailyNotificationTime)?.label ?? '8:00 AM'}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <View style={styles.pickerContainer}>
                  {NOTIFICATION_TIMES.map((time) => (
                    <TouchableOpacity
                      key={time.value}
                      style={[
                        styles.pickerItem,
                        dailyNotificationTime === time.value && styles.pickerItemActive,
                      ]}
                      onPress={() => { setNotificationTime(time.value); setShowTimePicker(false); }}
                    >
                      <Text style={[
                        styles.pickerName,
                        dailyNotificationTime === time.value && styles.pickerNameActive,
                      ]}>{time.label}</Text>
                      {dailyNotificationTime === time.value && (
                        <Text style={styles.checkmark}>{'\u2713'}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </GradientCard>

        {/* Account */}
        <GradientCard>
          <Text style={styles.sectionTitle}>{'\u{1F464}'} Account</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Name</Text>
            <Text style={styles.settingValue}>{user?.name ?? 'Unknown'}</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Subscription</Text>
            <Text style={[styles.settingValue, { color: user?.subscription.tier === 'free' ? COLORS.textSecondary : COLORS.starGold }]}>
              {user?.subscription.tier === 'free' ? 'Free' : user?.subscription.tier === 'premium' ? 'Premium' : 'Family'}
              {user?.subscription.status === 'trial' ? ' (Trial)' : ''}
            </Text>
          </View>

          {user?.subscription.tier === 'free' && (
            <CosmicButton
              title="Upgrade to Premium"
              onPress={() => router.push('/subscription')}
              colors={[COLORS.starGold, COLORS.sunOrange]}
              style={styles.upgradeButton}
            />
          )}

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Active Systems</Text>
            <Text style={styles.settingValue}>{user?.activeSystems.length ?? 0} / 4</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Cosmic Points</Text>
            <Text style={[styles.settingValue, { color: COLORS.starGold }]}>
              {'\u{1F31F}'} {user?.cosmicPoints ?? 0}
            </Text>
          </View>
        </GradientCard>

        {/* About */}
        <GradientCard>
          <Text style={styles.sectionTitle}>{'\u2728'} About</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Systems</Text>
            <Text style={styles.settingValue}>Western + Vedic + Chinese + KP</Text>
          </View>

          <Text style={styles.aboutText}>
            CosmicSelf combines 4 ancient astrology traditions into one unified
            cosmic profile. All readings are positively framed and backed by
            classical source references.
          </Text>
        </GradientCard>

        {/* Danger Zone */}
        <GradientCard>
          <Text style={[styles.sectionTitle, { color: '#ff6b6b' }]}>{'\u{26A0}\uFE0F'} Data</Text>
          <CosmicButton
            title="Reset All Data"
            onPress={handleClearData}
            variant="outline"
            style={styles.dangerButton}
          />
        </GradientCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  spacer: { height: 50 },
  backButton: { marginBottom: SPACING.sm },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  sectionTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.md },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingTextCol: { flex: 1 },
  settingLabel: { color: COLORS.textSecondary, fontSize: 14 },
  settingDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  settingValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  pickerItemActive: { backgroundColor: 'rgba(255,215,0,0.08)' },
  pickerEmoji: { fontSize: 24 },
  pickerTextCol: { flex: 1 },
  pickerName: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  pickerNameActive: { color: COLORS.starGold },
  pickerNameSub: { color: COLORS.textMuted, fontSize: 12 },
  checkmark: { color: COLORS.starGold, fontSize: 18, fontWeight: '700' },
  upgradeButton: { marginTop: SPACING.sm },
  aboutText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20, marginTop: SPACING.sm },
  dangerButton: { borderColor: '#ff6b6b' },
  bottomPad: { height: 20 },
});
