import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StarField } from '../../src/components/ui/StarField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { useAuthStore } from '../../src/store/authStore';
import {
  getOracleProvider,
  setOracleProvider,
  type OracleProvider,
} from '../../src/services/oracleConfigService';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

const OPTIONS: Array<{ value: OracleProvider; title: string; subtitle: string }> = [
  { value: 'gemini', title: 'Google Gemini', subtitle: 'Default. Lower cost, high throughput.' },
  { value: 'claude', title: 'Anthropic Claude', subtitle: 'Higher reasoning for nuanced questions.' },
];

export default function AdminOracleScreen() {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const authReady = useAuthStore((s) => s.authReady);
  const [provider, setProvider] = useState<OracleProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<OracleProvider | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    getOracleProvider()
      .then((p) => setProvider(p))
      .catch(() => setProvider('gemini'))
      .finally(() => setLoading(false));
  }, [authReady, isAdmin, router]);

  async function handleSelect(next: OracleProvider) {
    if (next === provider || saving) return;
    setSaving(next);
    try {
      await setOracleProvider(next);
      setProvider(next);
    } catch (err: any) {
      Alert.alert('Update failed', err?.message ?? 'Could not save provider.');
    } finally {
      setSaving(null);
    }
  }

  if (!authReady || loading) {
    return (
      <StarField>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Oracle Provider" accentColor={COLORS.violetSoft ?? COLORS.tide} />
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.tide} />
        </View>
      </StarField>
    );
  }

  return (
    <StarField>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Oracle Provider" accentColor={COLORS.violetSoft ?? COLORS.tide} />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>ADMIN · ASK AKASHA</Text>
        <Text style={styles.headline}>Pick which AI answers Akasha questions.</Text>
        <Text style={styles.body}>
          Applies to all users. New selection takes effect within 5 minutes (function cache). API
          keys stay in Firebase Secrets — set them via the Firebase CLI.
        </Text>

        {OPTIONS.map((opt) => {
          const selected = opt.value === provider;
          const isSaving = saving === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              disabled={!!saving}
              style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
            >
              <GradientCard
                style={[styles.card, selected && styles.cardSelected]}
                accentColor={selected ? COLORS.tide : COLORS.textMuted}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{opt.title}</Text>
                    <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <View style={styles.cardStatus}>
                    {isSaving ? (
                      <ActivityIndicator color={COLORS.tide} />
                    ) : selected ? (
                      <Text style={styles.selectedTag}>ACTIVE</Text>
                    ) : (
                      <Text style={styles.selectTag}>SELECT</Text>
                    )}
                  </View>
                </View>
              </GradientCard>
            </Pressable>
          );
        })}

        <Text style={styles.footnote}>
          Rotate keys: firebase functions:secrets:set GEMINI_API_KEY | ANTHROPIC_API_KEY
        </Text>
      </View>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.lg,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  eyebrow: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.4,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontFamily: FONTS.display,
    letterSpacing: -0.4,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  cardWrap: { borderRadius: 18 },
  cardPressed: { opacity: 0.85 },
  card: {
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,248,242,0.08)',
  },
  cardSelected: {
    borderColor: COLORS.tide,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardText: { flex: 1, gap: 4 },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FONTS.heading,
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  cardStatus: { minWidth: 72, alignItems: 'flex-end' },
  selectedTag: {
    color: COLORS.tide,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  selectTag: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.2,
  },
  footnote: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.md,
  },
});
